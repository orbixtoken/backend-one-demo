import pool from '../config/db.js'

/**
 * ============================
 * LISTAR MOVIMENTOS FINANCEIROS (CONSOLIDADO)
 * ============================
 */
export const listarMovimentos = async (req, res) => {

  try {

    const { rows } = await pool.query(`
      SELECT
        fm.id,
        fm.ordem_id,
        fm.tipo,
        fm.valor,
        fm.descricao,
        fm.usuario_id,
        fm.criado_em,

        o.status AS ordem_status,

        CASE
          WHEN EXISTS (
            SELECT 1 FROM ordem_itens oi
            WHERE oi.ordem_id = o.id AND oi.produto_id IS NOT NULL
          )
          AND EXISTS (
            SELECT 1 FROM ordem_itens oi
            WHERE oi.ordem_id = o.id AND oi.servico_descricao IS NOT NULL
          )
          THEN 'produto+servico'

          WHEN EXISTS (
            SELECT 1 FROM ordem_itens oi
            WHERE oi.ordem_id = o.id AND oi.servico_descricao IS NOT NULL
          )
          THEN 'servico'

          ELSE 'produto'
        END AS tipo_composicao,

        CASE
          WHEN o.status = 'cancelada' THEN 'CANCELADA'
          WHEN EXISTS (
            SELECT 1 FROM financeiro_movimentos f2
            WHERE f2.ordem_id = o.id AND f2.tipo = 'estorno'
          ) THEN 'ESTORNADA'
          ELSE 'ATIVA'
        END AS status_financeiro

      FROM financeiro_movimentos fm
      LEFT JOIN ordens o ON o.id = fm.ordem_id
      ORDER BY fm.criado_em DESC
    `)

    res.json(rows)

  } catch (err) {

    console.error('Erro ao listar financeiro:', err)
    res.status(500).json({ message: 'Erro ao listar financeiro' })

  }

}


/**
 * ============================
 * LISTAR MOVIMENTOS POR ORDEM
 * ============================
 */
export const listarMovimentosPorOrdem = async (req, res) => {

  const { ordem_id } = req.params

  try {

    const { rows } = await pool.query(`
      SELECT
        fm.id,
        fm.tipo,
        fm.valor,
        fm.descricao,
        fm.usuario_id,
        fm.criado_em,
        o.status AS ordem_status,

        CASE
          WHEN o.status = 'cancelada' THEN 'CANCELADA'
          WHEN fm.tipo = 'estorno' THEN 'ESTORNADA'
          ELSE 'ATIVA'
        END AS status_financeiro

      FROM financeiro_movimentos fm
      LEFT JOIN ordens o ON o.id = fm.ordem_id
      WHERE fm.ordem_id = $1
      ORDER BY fm.criado_em ASC
    `, [ordem_id])

    res.json(rows)

  } catch (err) {

    console.error('Erro ao listar financeiro da ordem:', err)
    res.status(500).json({ message: 'Erro ao listar financeiro da ordem' })

  }

}


/**
 * ============================
 * CRIAR ENTRADA MANUAL
 * ============================
 */
export const criarEntradaManual = async (req, res) => {

  const { valor, descricao } = req.body
  const usuario_id = req.usuario?.id || null

  try {

    if (!valor) {
      return res.status(400).json({ message: 'Valor é obrigatório' })
    }

    const { rows } = await pool.query(`
      INSERT INTO financeiro_movimentos
      (ordem_id, tipo, valor, descricao, usuario_id)
      VALUES (NULL, 'entrada', $1, $2, $3)
      RETURNING *
    `, [
      valor,
      descricao || 'MANUAL: entrada de caixa',
      usuario_id
    ])

    res.status(201).json(rows[0])

  } catch (err) {

    console.error('Erro ao criar entrada manual:', err)
    res.status(500).json({ message: 'Erro ao criar entrada manual' })

  }

}


/**
 * ============================
 * CRIAR DESPESA FINANCEIRA
 * ============================
 */
export const criarDespesaFinanceira = async (req, res) => {

  const { valor, descricao } = req.body
  const usuario_id = req.usuario?.id || null

  try {

    if (!valor) {
      return res.status(400).json({ message: 'Valor é obrigatório' })
    }

    const { rows } = await pool.query(`
      INSERT INTO financeiro_movimentos
      (ordem_id, tipo, valor, descricao, usuario_id)
      VALUES (NULL, 'despesa', $1, $2, $3)
      RETURNING *
    `, [
      valor,
      descricao || 'DESPESA',
      usuario_id
    ])

    res.status(201).json(rows[0])

  } catch (err) {

    console.error('Erro ao registrar despesa:', err)
    res.status(500).json({ message: 'Erro ao registrar despesa' })

  }

}


/**
 * ============================
 * RESUMO FINANCEIRO COMPLETO
 * ============================
 */
export const resumoFinanceiro = async (req, res) => {

  try {

    const { rows } = await pool.query(`
      SELECT
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) entradas,
        SUM(CASE WHEN tipo='despesa' THEN valor ELSE 0 END) despesas,
        SUM(CASE WHEN tipo='estorno' THEN valor ELSE 0 END) estornos
      FROM financeiro_movimentos
    `)

    const entradas = Number(rows[0].entradas || 0)
    const despesas = Number(rows[0].despesas || 0)
    const estornos = Number(rows[0].estornos || 0)

    const saldo = entradas - despesas - estornos

    res.json({
      total_entradas: entradas,
      total_despesas: despesas,
      total_estornos: estornos,
      saldo
    })

  } catch (err) {

    console.error('Erro ao gerar resumo financeiro:', err)
    res.status(500).json({ message: 'Erro ao gerar resumo financeiro' })

  }

}


/**
 * ============================
 * RELATÓRIO FINANCEIRO PROFISSIONAL
 * ============================
 */
export const relatorioFinanceiro = async (req, res) => {

  try {

    /* TOTAIS */

    const totaisQuery = await pool.query(`
      SELECT
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) entradas,
        SUM(CASE WHEN tipo='despesa' THEN valor ELSE 0 END) despesas
      FROM financeiro_movimentos
    `)

    const entradas = Number(totaisQuery.rows[0].entradas || 0)
    const despesas = Number(totaisQuery.rows[0].despesas || 0)

    const resultado = entradas - despesas
    const margem = entradas > 0 ? ((resultado / entradas) * 100) : 0


    /* ENTRADAS DETALHADAS */

    const entradasOrigem = await pool.query(`
      SELECT
        criado_em AS data,
        descricao,
        valor AS total
      FROM financeiro_movimentos
      WHERE tipo='entrada'
      ORDER BY criado_em DESC
      LIMIT 100
    `)


    /* DESPESAS DETALHADAS */

    const despesasOrigem = await pool.query(`
      SELECT
        criado_em AS data,
        descricao,
        valor AS total
      FROM financeiro_movimentos
      WHERE tipo='despesa'
      ORDER BY criado_em DESC
      LIMIT 100
    `)


    /* LINHA DO TEMPO */

    const linhaTempo = await pool.query(`
      SELECT
        criado_em,
        tipo,
        descricao,
        valor
      FROM financeiro_movimentos
      ORDER BY criado_em DESC
      LIMIT 200
    `)


    res.json({

      totais: {
        entradas,
        despesas,
        resultado,
        margem
      },

      entradas_origem: entradasOrigem.rows,
      despesas_origem: despesasOrigem.rows,
      linha_tempo: linhaTempo.rows

    })

  } catch (err) {

    console.error('Erro ao gerar relatório financeiro:', err)
    res.status(500).json({ message: 'Erro ao gerar relatório financeiro' })

  }

}