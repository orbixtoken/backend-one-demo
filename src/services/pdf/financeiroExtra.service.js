import pool from '../config/db.js';

export async function listarCategorias() {
  const { rows } = await pool.query(
    `SELECT * FROM categorias_financeiras ORDER BY nome`
  );
  return rows;
}

export async function criarCategoria({ nome, tipo }) {
  const { rows } = await pool.query(
    `INSERT INTO categorias_financeiras (nome, tipo)
     VALUES ($1, $2)
     RETURNING *`,
    [nome, tipo]
  );
  return rows[0];
}

export async function atualizarCategoria(id, { nome, tipo }) {
  const { rows } = await pool.query(
    `UPDATE categorias_financeiras
     SET nome = $1, tipo = $2
     WHERE id = $3
     RETURNING *`,
    [nome, tipo, id]
  );
  return rows[0];
}

export async function removerCategoria(id) {
  await pool.query(
    `DELETE FROM categorias_financeiras WHERE id = $1`,
    [id]
  );
}

export async function listarMovimentacoes({ tipo, periodo }) {
  let query = `
    SELECT m.*, c.nome AS categoria_nome
    FROM movimentacoes_financeiras m
    LEFT JOIN categorias_financeiras c
      ON c.id = m.categoria_id
    WHERE 1=1
  `;
  const params = [];

  if (tipo) {
    params.push(tipo);
    query += ` AND m.tipo = $${params.length}`;
  }

  if (periodo === 'semana') {
    query += ` AND m.data >= CURRENT_DATE - INTERVAL '7 days'`;
  }

  if (periodo === 'mes') {
    query += `
      AND date_trunc('month', m.data) =
          date_trunc('month', CURRENT_DATE)
    `;
  }

  query += ` ORDER BY m.data DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
}

export async function criarMovimentacao(data) {
  const {
    tipo,
    categoria_id,
    descricao,
    valor,
    data_lancamento,
    data_vencimento,
    status,
    observacao
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO movimentacoes_financeiras
     (tipo, categoria_id, descricao, valor, data, data_vencimento, status, observacao)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      tipo,
      categoria_id,
      descricao,
      valor,
      data_lancamento,
      data_vencimento,
      status || 'pendente',
      observacao
    ]
  );

  return rows[0];
}

export async function atualizarMovimentacao(id, data) {
  const {
    tipo,
    categoria_id,
    descricao,
    valor,
    data_lancamento,
    data_vencimento,
    status,
    observacao
  } = data;

  const { rows } = await pool.query(
    `UPDATE movimentacoes_financeiras
     SET tipo=$1,
         categoria_id=$2,
         descricao=$3,
         valor=$4,
         data=$5,
         data_vencimento=$6,
         status=$7,
         observacao=$8
     WHERE id=$9
     RETURNING *`,
    [
      tipo,
      categoria_id,
      descricao,
      valor,
      data_lancamento,
      data_vencimento,
      status,
      observacao,
      id
    ]
  );

  return rows[0];
}

export async function removerMovimentacao(id) {
  await pool.query(
    `DELETE FROM movimentacoes_financeiras WHERE id = $1`,
    [id]
  );
}
