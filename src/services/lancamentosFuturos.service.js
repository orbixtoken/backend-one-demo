import pool from '../config/db.js'

/* =========================
   LISTAR LANÇAMENTOS
========================= */

export async function listarLancamentos(periodo) {

  let query = `
    SELECT
      lf.*,
      c.nome AS categoria_nome
    FROM lancamentos_futuros lf
    LEFT JOIN categorias_financeiras c
      ON c.id = lf.categoria_id
    WHERE lf.status = 'previsto'
  `

  if (periodo === 'semana') {
    query += ` AND lf.data_prevista <= CURRENT_DATE + INTERVAL '7 days'`
  }

  query += ` ORDER BY lf.data_prevista ASC`

  const { rows } = await pool.query(query)

  return rows

}


/* =========================
   CRIAR LANÇAMENTO
========================= */

export async function criarLancamento(data) {

  const {
    tipo,
    categoria_id,
    descricao,
    valor,
    data_prevista
  } = data

  const { rows } = await pool.query(
    `
    INSERT INTO lancamentos_futuros
    (tipo, categoria_id, descricao, valor, data_prevista)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [tipo, categoria_id, descricao, valor, data_prevista]
  )

  return rows[0]

}


/* =========================
   REALIZAR LANÇAMENTO
   (PAGO / RECEBIDO)
========================= */

export async function realizarLancamento(id) {

  const { rows } = await pool.query(
    `SELECT * FROM lancamentos_futuros WHERE id=$1`,
    [id]
  )

  const lancamento = rows[0]

  if (!lancamento) {
    throw new Error('Lançamento não encontrado')
  }

  /* inserir no fluxo financeiro */

  await pool.query(
    `
    INSERT INTO financeiro_movimentos
    (ordem_id, tipo, valor, descricao)
    VALUES (NULL,$1,$2,$3)
    `,
    [
      lancamento.tipo,
      lancamento.valor,
      lancamento.descricao
    ]
  )

  /* marcar como realizado */

  await pool.query(
    `
    UPDATE lancamentos_futuros
    SET status='realizado'
    WHERE id=$1
    `,
    [id]
  )

}