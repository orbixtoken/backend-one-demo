import pool from '../config/db.js';

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

        -- composição da ordem
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

        -- STATUS FINANCEIRO REAL
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
    `);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar financeiro:', err);
    res.status(500).json({ message: 'Erro ao listar financeiro' });
  }
};

/**
 * ============================
 * LISTAR MOVIMENTOS POR ORDEM
 * ============================
 */
export const listarMovimentosPorOrdem = async (req, res) => {
  const { ordem_id } = req.params;

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
    `, [ordem_id]);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar financeiro da ordem:', err);
    res.status(500).json({ message: 'Erro ao listar financeiro da ordem' });
  }
};

/**
 * ============================
 * RESUMO FINANCEIRO REAL
 * ============================
 */
export const resumoFinanceiro = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        SUM(
          CASE
            WHEN fm.tipo = 'entrada' AND o.status <> 'cancelada'
            THEN fm.valor ELSE 0
          END
        ) AS entradas_validas,

        SUM(
          CASE
            WHEN fm.tipo = 'estorno'
            THEN fm.valor ELSE 0
          END
        ) AS estornos,

        SUM(
          CASE
            WHEN fm.tipo = 'entrada' AND o.status = 'cancelada'
            THEN fm.valor ELSE 0
          END
        ) AS entradas_canceladas

      FROM financeiro_movimentos fm
      LEFT JOIN ordens o ON o.id = fm.ordem_id
    `);

    const entradasValidas = Number(rows[0].entradas_validas || 0);
    const estornos = Number(rows[0].estornos || 0);
    const entradasCanceladas = Number(rows[0].entradas_canceladas || 0);

    res.json({
      entradas_validas: entradasValidas,
      entradas_canceladas: entradasCanceladas,
      estornos,
      saldo_real: entradasValidas - estornos
    });
  } catch (err) {
    console.error('Erro ao gerar resumo financeiro:', err);
    res.status(500).json({ message: 'Erro ao gerar resumo financeiro' });
  }
};
