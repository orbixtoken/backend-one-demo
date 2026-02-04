// controllers/auditoriaController.js
import pool from '../config/db.js';

/**
 * ============================
 * LISTAR AUDITORIA GERAL
 * ============================
 */
export const listarAuditoria = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM (
        -- CLIENTES
        SELECT
          ch.criado_em AS data,
          'cliente' AS tipo,
          ch.descricao,
          ch.cliente_id,
          NULL::INTEGER AS ordem_id,
          NULL::NUMERIC AS valor,
          NULL::INTEGER AS responsavel_id,
          NULL::VARCHAR AS responsavel_nome
        FROM cliente_historico ch

        UNION ALL

        -- ORDENS
        SELECT
          oh.criado_em AS data,
          'ordem' AS tipo,
          oh.observacao AS descricao,
          o.cliente_id,
          oh.ordem_id,
          o.valor_total AS valor,
          u.id AS responsavel_id,
          u.nome AS responsavel_nome
        FROM ordem_historico oh
        JOIN ordens o ON o.id = oh.ordem_id
        LEFT JOIN usuarios u ON u.id = oh.usuario_id

        UNION ALL

        -- FINANCEIRO
        SELECT
          fm.criado_em AS data,
          'financeiro' AS tipo,
          fm.descricao,
          o.cliente_id,
          fm.ordem_id,
          CASE
            WHEN fm.tipo = 'estorno' THEN -fm.valor
            ELSE fm.valor
          END AS valor,
          u.id AS responsavel_id,
          u.nome AS responsavel_nome
        FROM financeiro_movimentos fm
        JOIN ordens o ON o.id = fm.ordem_id
        LEFT JOIN usuarios u ON u.id = fm.usuario_id
      ) auditoria
      ORDER BY data DESC
      LIMIT 500
    `);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar auditoria:', err);
    res.status(500).json({ message: 'Erro ao listar auditoria' });
  }
};
