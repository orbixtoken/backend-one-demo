// src/controllers/orcamentosController.js
import pool from '../config/db.js';

/**
 * ============================
 * CRIAR ORÇAMENTO
 * ============================
 */
export const criarOrcamento = async (req, res) => {
  const usuario_id = req.usuario.id;

  const {
    cliente_id,
    itens,
    desconto_tipo,
    desconto_valor,
    validade,
    observacoes
  } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      message: 'Informe ao menos um item (produto ou serviço)'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    /* ============================
       CRIA ORÇAMENTO
    ============================ */
    const { rows: orcRows } = await client.query(
      `
      INSERT INTO orcamentos
        (cliente_id, usuario_id, desconto_tipo, desconto_valor, validade, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        cliente_id || null,
        usuario_id,
        desconto_tipo || null,
        desconto_valor || 0,
        validade || null,
        observacoes || null
      ]
    );

    const orcamento = orcRows[0];
    let subtotal = 0;

    /* ============================
       ITENS DO ORÇAMENTO
    ============================ */
    for (const item of itens) {
      if (!item.tipo || !item.preco_unitario) {
        throw new Error('Item inválido no orçamento');
      }

      const quantidade = Number(item.quantidade || 1);
      const preco = Number(item.preco_unitario);
      const totalItem = quantidade * preco;

      subtotal += totalItem;

      // 👉 PRODUTO
      if (item.tipo === 'produto') {
        if (!item.produto_id) {
          throw new Error('Produto inválido no orçamento');
        }

        const { rows: prodRows } = await client.query(
          `SELECT nome FROM produtos WHERE id = $1`,
          [item.produto_id]
        );

        if (!prodRows.length) {
          throw new Error('Produto não encontrado');
        }

        const produtoNome = prodRows[0].nome;

        await client.query(
          `
          INSERT INTO orcamento_itens
            (orcamento_id, tipo, produto_id, produto_nome, quantidade, preco_unitario, total_item)
          VALUES ($1, 'produto', $2, $3, $4, $5, $6)
          `,
          [
            orcamento.id,
            item.produto_id,
            produtoNome,
            quantidade,
            preco,
            totalItem
          ]
        );
      }

      // 👉 SERVIÇO
      if (item.tipo === 'servico') {
        if (!item.servico_descricao) {
          throw new Error('Descrição do serviço é obrigatória');
        }

        await client.query(
          `
          INSERT INTO orcamento_itens
            (orcamento_id, tipo, servico_descricao, quantidade, preco_unitario, total_item)
          VALUES ($1, 'servico', $2, $3, $4, $5)
          `,
          [
            orcamento.id,
            item.servico_descricao,
            quantidade,
            preco,
            totalItem
          ]
        );
      }
    }

    /* ============================
       CÁLCULO DO TOTAL
    ============================ */
    let valorTotal = subtotal;

    if (desconto_tipo === 'percentual') {
      valorTotal -= subtotal * (Number(desconto_valor) / 100);
    }

    if (desconto_tipo === 'valor') {
      valorTotal -= Number(desconto_valor);
    }

    if (valorTotal < 0) valorTotal = 0;

    await client.query(
      `
      UPDATE orcamentos
      SET subtotal = $1,
          valor_total = $2
      WHERE id = $3
      `,
      [subtotal, valorTotal, orcamento.id]
    );

    /* ============================
       HISTÓRICO
    ============================ */
    await client.query(
      `
      INSERT INTO orcamento_historico
        (orcamento_id, acao, usuario_id, observacao)
      VALUES ($1, 'criado', $2, 'Orçamento criado')
      `,
      [orcamento.id, usuario_id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      id: orcamento.id,
      subtotal,
      valor_total: valorTotal
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar orçamento:', err);
    return res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};

/**
 * ============================
 * LISTAR ORÇAMENTOS
 * ============================
 */
export const listarOrcamentos = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        o.id,
        o.cliente_id,
        c.nome AS cliente_nome,
        o.status,
        o.valor_total,
        o.validade,
        o.criado_em
      FROM orcamentos o
      LEFT JOIN clientes c ON c.id = o.cliente_id
      ORDER BY o.criado_em DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar orçamentos' });
  }
};

/**
 * ============================
 * BUSCAR ORÇAMENTO POR ID
 * ============================
 */
export const buscarOrcamento = async (req, res) => {
  const { id } = req.params;

  try {
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
              'produto_id', oi.produto_id,
              'produto_nome', p.nome,
              'servico_descricao', oi.servico_descricao,
              'quantidade', oi.quantidade,
              'preco_unitario', oi.preco_unitario,
              'total_item', oi.total_item
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS itens
      FROM orcamentos o
      LEFT JOIN orcamento_itens oi ON oi.orcamento_id = o.id
      LEFT JOIN produtos p ON p.id = oi.produto_id
      LEFT JOIN clientes c ON c.id = o.cliente_id
      WHERE o.id = $1
      GROUP BY o.id, c.nome
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar orçamento' });
  }
};


/**
 * ============================
 * CANCELAR ORÇAMENTO
 * ============================
 */
export const cancelarOrcamento = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    await pool.query(
      `UPDATE orcamentos SET status = 'cancelado' WHERE id = $1`,
      [id]
    );

    await pool.query(
      `
      INSERT INTO orcamento_historico
        (orcamento_id, acao, usuario_id, observacao)
      VALUES ($1, 'cancelado', $2, 'Orçamento cancelado')
      `,
      [id, usuario_id]
    );

    res.json({ message: 'Orçamento cancelado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao cancelar orçamento' });
  }
};
