import pool from '../config/db.js';

/**
 * ============================
 * CRIAR ORDEM
 * ============================
 */
export const criarOrdem = async (req, res) => {
  const usuario_id = req.usuario.id;
  const {
    cliente_id,
    itens,
    observacoes,
    desconto_tipo,
    desconto_valor = 0
  } = req.body;

  if (!cliente_id || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ message: 'Dados da ordem inválidos' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: ordemRows } = await client.query(
      `
      INSERT INTO ordens
        (cliente_id, usuario_id, observacoes, desconto_tipo, desconto_valor)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        cliente_id,
        usuario_id,
        observacoes || null,
        desconto_tipo || null,
        desconto_valor || 0
      ]
    );

    const ordem = ordemRows[0];
    let subtotal = 0;

    /* =========================
       ITENS
    ========================= */
    for (const item of itens) {
      if (item.tipo === 'produto') {
        const { rows } = await client.query(
          `
          SELECT nome, valor_final, quantidade
          FROM produtos
          WHERE id = $1 AND ativo = true
          `,
          [item.referencia_id]
        );

        if (!rows.length) throw new Error('Produto não encontrado');
        if (rows[0].quantidade < item.quantidade)
          throw new Error('Estoque insuficiente');

        const preco = Number(rows[0].valor_final);
        const totalItem = preco * item.quantidade;
        subtotal += totalItem;

        await client.query(
          `
          INSERT INTO ordem_itens
            (ordem_id, tipo, produto_id, quantidade, preco_unitario)
          VALUES ($1,'produto',$2,$3,$4)
          `,
          [ordem.id, item.referencia_id, item.quantidade, preco]
        );

        await client.query(
          `UPDATE produtos SET quantidade = quantidade - $1 WHERE id = $2`,
          [item.quantidade, item.referencia_id]
        );
      }

      if (item.tipo === 'servico') {
        const valor = Number(item.valor);
        subtotal += valor;

        await client.query(
          `
          INSERT INTO ordem_itens
            (ordem_id, tipo, servico_descricao, quantidade, preco_unitario)
          VALUES ($1,'servico',$2,1,$3)
          `,
          [ordem.id, item.descricao, valor]
        );
      }
    }

    /* =========================
       DESCONTO
    ========================= */
    let valorFinal = subtotal;

    if (desconto_tipo === 'percentual') {
      valorFinal -= (subtotal * desconto_valor) / 100;
    }

    if (desconto_tipo === 'valor') {
      valorFinal -= desconto_valor;
    }

    if (valorFinal < 0) valorFinal = 0;

    /* =========================
       ATUALIZA ORDEM
    ========================= */
    await client.query(
      `
      UPDATE ordens
      SET subtotal = $1,
          valor_total = $2
      WHERE id = $3
      `,
      [subtotal, valorFinal, ordem.id]
    );

    /* =========================
       HISTÓRICO
    ========================= */
    await client.query(
      `
      INSERT INTO ordem_historico
        (ordem_id, acao, usuario_id, observacao)
      VALUES ($1,'criada',$2,'Ordem criada')
      `,
      [ordem.id, usuario_id]
    );

    /* =========================
       FINANCEIRO
    ========================= */
    await client.query(
      `
      INSERT INTO financeiro_movimentos
        (ordem_id, tipo, valor, usuario_id, descricao)
      VALUES ($1,'entrada',$2,$3,'Venda / serviço')
      `,
      [ordem.id, valorFinal, usuario_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      ...ordem,
      subtotal,
      valor_total: valorFinal
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};

/**
 * ============================
 * LISTAR ORDENS
 * ============================
 */
export const listarOrdens = async (req, res) => {
  const { rows } = await pool.query(
    `
    SELECT
      o.id,
      o.data_abertura,
      o.status,
      o.valor_total,
      c.nome AS cliente_nome
    FROM ordens o
    LEFT JOIN clientes c ON c.id = o.cliente_id
    ORDER BY o.data_abertura DESC
    `
  );

  res.json(rows);
};

/**
 * ============================
 * BUSCAR ORDEM POR ID
 * ============================
 */
export const buscarOrdemPorId = async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    `
    SELECT
      o.*,
      c.nome AS cliente_nome,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'tipo', oi.tipo,
            'descricao',
              CASE
                WHEN oi.tipo = 'produto' THEN p.nome
                ELSE oi.servico_descricao
              END,
            'quantidade', oi.quantidade,
            'preco_unitario', oi.preco_unitario,
            'total_item', oi.quantidade * oi.preco_unitario
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS itens
    FROM ordens o
    LEFT JOIN clientes c ON c.id = o.cliente_id
    LEFT JOIN ordem_itens oi ON oi.ordem_id = o.id
    LEFT JOIN produtos p ON p.id = oi.produto_id
    WHERE o.id = $1
    GROUP BY o.id, c.nome
    `,
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'Ordem não encontrada' });
  }

  res.json(rows[0]);
};

/**
 * ============================
 * CANCELAR ORDEM
 * ============================
 */
export const cancelarOrdem = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: itens } = await client.query(
      `SELECT * FROM ordem_itens WHERE ordem_id = $1`,
      [id]
    );

    for (const item of itens) {
      if (item.tipo === 'produto' && item.produto_id) {
        await client.query(
          `UPDATE produtos SET quantidade = quantidade + $1 WHERE id = $2`,
          [item.quantidade, item.produto_id]
        );
      }
    }

    await client.query(
      `UPDATE ordens SET status = 'cancelada' WHERE id = $1`,
      [id]
    );

    await client.query(
      `
      INSERT INTO ordem_historico
        (ordem_id, acao, usuario_id, observacao)
      VALUES ($1,'cancelada',$2,'Ordem cancelada')
      `,
      [id, usuario_id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Ordem cancelada' });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};
