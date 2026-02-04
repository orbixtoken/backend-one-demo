import pool from '../config/db.js';
import { gerarOrcamentoPdf } from '../services/pdf/gerarOrcamentoPdf.js';

/**
 * Busca orçamento + itens + cliente
 */
async function buscarOrcamentoCompleto(id) {
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

  return rows[0];
}


/**
 * Busca configuração ativa da empresa
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
 * ABRIR PDF NO NAVEGADOR
 * ============================
 */
export const abrirPdfOrcamento = async (req, res) => {
  const { id } = req.params;

  try {
    const orcamento = await buscarOrcamentoCompleto(id);
    if (!orcamento) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }

    const empresa = await buscarEmpresaConfig();
    if (!empresa) {
      return res.status(400).json({
        message: 'Configuração da empresa não encontrada'
      });
    }

    const pdfBuffer = await gerarOrcamentoPdf(orcamento, empresa);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=orcamento-${orcamento.id}.pdf`
    );

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    res.status(500).json({ message: 'Erro ao gerar PDF' });
  }
};

/**
 * ============================
 * BAIXAR PDF
 * ============================
 */
export const baixarPdfOrcamento = async (req, res) => {
  const { id } = req.params;

  try {
    const orcamento = await buscarOrcamentoCompleto(id);
    if (!orcamento) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }

    const empresa = await buscarEmpresaConfig();
    if (!empresa) {
      return res.status(400).json({
        message: 'Configuração da empresa não encontrada'
      });
    }

    const pdfBuffer = await gerarOrcamentoPdf(orcamento, empresa);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=orcamento-${orcamento.id}.pdf`
    );

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Erro ao baixar PDF:', err);
    res.status(500).json({ message: 'Erro ao baixar PDF' });
  }
};
