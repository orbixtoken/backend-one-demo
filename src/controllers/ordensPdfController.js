import pool from '../config/db.js';
import { gerarOrdemPdf } from '../services/pdf/gerarOrdemPdf.js';

/**
 * ============================
 * BUSCAR ORDEM COMPLETA (PDF)
 * ============================
 */
async function buscarOrdemCompleta(id) {
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
            'total_item', oi.preco_unitario * oi.quantidade
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS itens
    FROM ordens o
    LEFT JOIN ordem_itens oi ON oi.ordem_id = o.id
    LEFT JOIN produtos p ON p.id = oi.produto_id
    LEFT JOIN clientes c ON c.id = o.cliente_id
    WHERE o.id = $1
    GROUP BY o.id, c.nome
    `,
    [id]
  );

  return rows[0];
}

/**
 * ============================
 * BUSCAR FINANCEIRO DA ORDEM
 * ============================
 */
async function buscarFinanceiroOrdem(ordemId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM financeiro_movimentos
    WHERE ordem_id = $1
    ORDER BY id ASC
    `,
    [ordemId]
  );

  return rows;
}

/**
 * ============================
 * BUSCAR CONFIG DA EMPRESA
 * ============================
 */
async function buscarEmpresaConfig() {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM empresa_config
    WHERE ativo = true
    ORDER BY id DESC
    LIMIT 1
    `
  );

  return rows[0];
}

/**
 * ============================
 * ABRIR PDF DA ORDEM
 * ============================
 */
export const abrirPdfOrdem = async (req, res) => {
  const { id } = req.params;

  try {
    const ordem = await buscarOrdemCompleta(id);
    if (!ordem) {
      return res.status(404).json({ message: 'Ordem não encontrada' });
    }

    const empresa = await buscarEmpresaConfig();
    if (!empresa) {
      return res
        .status(400)
        .json({ message: 'Configuração da empresa não encontrada' });
    }

    const financeiro = await buscarFinanceiroOrdem(id);

    const pdfBuffer = await gerarOrdemPdf(ordem, empresa, financeiro);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=ordem-${ordem.id}.pdf`
    );

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Erro ao gerar PDF da ordem:', err);
    res.status(500).json({ message: 'Erro ao gerar PDF da ordem' });
  }
};

/**
 * ============================
 * BAIXAR PDF DA ORDEM
 * ============================
 */
export const baixarPdfOrdem = async (req, res) => {
  const { id } = req.params;

  try {
    const ordem = await buscarOrdemCompleta(id);
    if (!ordem) {
      return res.status(404).json({ message: 'Ordem não encontrada' });
    }

    const empresa = await buscarEmpresaConfig();
    if (!empresa) {
      return res
        .status(400)
        .json({ message: 'Configuração da empresa não encontrada' });
    }

    const financeiro = await buscarFinanceiroOrdem(id);

    const pdfBuffer = await gerarOrdemPdf(ordem, empresa, financeiro);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ordem-${ordem.id}.pdf`
    );

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Erro ao baixar PDF da ordem:', err);
    res.status(500).json({ message: 'Erro ao baixar PDF da ordem' });
  }
};
