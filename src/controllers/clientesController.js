import pool from '../config/db.js';

/**
 * ============================
 * CRIAR CLIENTE
 * ============================
 */
export const criarCliente = async (req, res) => {
  const { nome, telefone, endereco, documento } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'Nome é obrigatório' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO clientes (nome, telefone, endereco, documento)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [nome, telefone || null, endereco || null, documento || null]
    );

    await pool.query(
      `
      INSERT INTO cliente_historico (cliente_id, descricao)
      VALUES ($1, 'Cliente cadastrado')
      `,
      [rows[0].id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).json({ message: 'Erro ao criar cliente' });
  }
};

/**
 * ============================
 * LISTAR CLIENTES
 * ============================
 */
export const listarClientes = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM clientes
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ message: 'Erro ao listar clientes' });
  }
};

/**
 * ============================
 * BUSCAR CLIENTE POR ID
 * ============================
 */
export const buscarClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM clientes WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ message: 'Erro ao buscar cliente' });
  }
};

/**
 * ============================
 * ATUALIZAR CLIENTE
 * ============================
 */
export const atualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, endereco, documento, ativo } = req.body;

  try {
    const { rows } = await pool.query(
      `
      UPDATE clientes
      SET
        nome = $1,
        telefone = $2,
        endereco = $3,
        documento = $4,
        ativo = $5
      WHERE id = $6
      RETURNING *
      `,
      [nome, telefone || null, endereco || null, documento || null, ativo, id]
    );

    await pool.query(
      `
      INSERT INTO cliente_historico (cliente_id, descricao)
      VALUES ($1, 'Cliente atualizado')
      `,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
};

/**
 * ============================
 * HISTÓRICO ADMINISTRATIVO
 * ============================
 */
export const listarHistoricoCliente = async (req, res) => {
  const { cliente_id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM cliente_historico
      WHERE cliente_id = $1
      ORDER BY criado_em DESC
      `,
      [cliente_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar histórico do cliente:', err);
    res.status(500).json({ message: 'Erro ao listar histórico' });
  }
};

/**
 * ============================
 * HISTÓRICO COMPLETO DO CLIENTE
 * ============================
 */
export const listarHistoricoCompletoCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT * FROM (
        -- cadastro / edições
        SELECT
          ch.criado_em AS data,
          'cadastro' AS tipo,
          ch.descricao,
          NULL::INTEGER AS ordem_id,
          NULL::NUMERIC AS valor
        FROM cliente_historico ch
        WHERE ch.cliente_id = $1

        UNION ALL

        -- ordens criadas / canceladas
        SELECT
          oh.criado_em AS data,
          'ordem' AS tipo,
          oh.observacao AS descricao,
          oh.ordem_id,
          o.valor_total AS valor
        FROM ordem_historico oh
        JOIN ordens o ON o.id = oh.ordem_id
        WHERE o.cliente_id = $1

        UNION ALL

        -- itens (produto / serviço)
        SELECT
          o.data_abertura AS data,
          oi.tipo AS tipo,
          COALESCE(oi.servico_descricao, p.nome) AS descricao,
          o.id AS ordem_id,
          oi.preco_unitario * oi.quantidade AS valor
        FROM ordens o
        JOIN ordem_itens oi ON oi.ordem_id = o.id
        LEFT JOIN produtos p ON p.id = oi.produto_id
        WHERE o.cliente_id = $1

        UNION ALL

        -- financeiro
        SELECT
          fm.criado_em AS data,
          'financeiro' AS tipo,
          fm.descricao,
          fm.ordem_id,
          CASE
            WHEN fm.tipo = 'estorno' THEN -fm.valor
            ELSE fm.valor
          END AS valor
        FROM financeiro_movimentos fm
        JOIN ordens o ON o.id = fm.ordem_id
        WHERE o.cliente_id = $1
      ) historico
      ORDER BY data DESC
      `,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro ao gerar histórico completo:', err);
    res.status(500).json({ message: 'Erro ao gerar histórico completo' });
  }
};
