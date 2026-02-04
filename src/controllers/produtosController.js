import pool from '../config/db.js';

/**
 * ============================
 * CRIAR PRODUTO
 * ============================
 */
export const criarProduto = async (req, res) => {
  const {
    nome,
    descricao,
    categoria,
    quantidade,
    valor_pago,
    valor_final,
    data_validade,
    alerta_validade_dias
  } = req.body;

  if (!nome || valor_final == null) {
    return res
      .status(400)
      .json({ message: 'Nome e valor final são obrigatórios' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO produtos
        (nome, descricao, categoria, quantidade, valor_pago, valor_final, data_validade, alerta_validade_dias)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        nome,
        descricao || null,
        categoria || null,
        quantidade || 0,
        valor_pago || 0,
        valor_final,
        data_validade || null,
        alerta_validade_dias || null
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

/**
 * ============================
 * LISTAR PRODUTOS
 * ============================
 */
export const listarProdutos = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM produtos
      ORDER BY nome
      `
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

/**
 * ============================
 * BUSCAR PRODUTO POR ID
 * (USADO NA CRIAÇÃO DA ORDEM)
 * ============================
 */
export const buscarProdutoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        nome,
        quantidade,
        valor_final,
        ativo
      FROM produtos
      WHERE id = $1
      `,
      [id]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ message: 'Produto não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};

/**
 * ============================
 * ATUALIZAR PRODUTO
 * ============================
 */
export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    descricao,
    categoria,
    quantidade,
    valor_pago,
    valor_final,
    data_validade,
    alerta_validade_dias,
    ativo
  } = req.body;

  try {
    const { rows } = await pool.query(
      `
      UPDATE produtos
      SET
        nome = $1,
        descricao = $2,
        categoria = $3,
        quantidade = $4,
        valor_pago = $5,
        valor_final = $6,
        data_validade = $7,
        alerta_validade_dias = $8,
        ativo = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        nome,
        descricao || null,
        categoria || null,
        quantidade || 0,
        valor_pago || 0,
        valor_final,
        data_validade || null,
        alerta_validade_dias || null,
        ativo,
        id
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};
