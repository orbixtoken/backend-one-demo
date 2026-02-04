import PDFDocument from 'pdfkit';

/**
 * Gera PDF de orçamento
 */
export function gerarOrcamentoPdf(orcamento, empresa) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      /* ============================
         CABEÇALHO EMPRESA
      ============================ */
      doc
        .fontSize(18)
        .text(empresa.nome || 'Empresa', { align: 'center' })
        .moveDown(0.5);

      doc.fontSize(10).text(empresa.endereco || '', { align: 'center' });

      if (empresa.telefone) {
        doc.text(`Telefone: ${empresa.telefone}`, { align: 'center' });
      }

      if (empresa.whatsapp) {
        doc.text(`WhatsApp: ${empresa.whatsapp}`, { align: 'center' });
      }

      doc.moveDown(2);

      /* ============================
         DADOS DO ORÇAMENTO
      ============================ */
      doc
        .fontSize(14)
        .text(`Orçamento #${orcamento.id}`)
        .moveDown(0.5);

      doc.fontSize(10);
      doc.text(`Data: ${new Date(orcamento.criado_em).toLocaleString()}`);

      if (orcamento.validade) {
        doc.text(
          `Validade: ${new Date(orcamento.validade).toLocaleDateString()}`
        );
      }

      doc.moveDown();

      if (orcamento.cliente_nome) {
        doc.text(`Cliente: ${orcamento.cliente_nome}`);
        doc.moveDown();
      }

      /* ============================
         ITENS DO ORÇAMENTO
      ============================ */
      doc.fontSize(12).text('Itens do Orçamento');
      doc.moveDown(0.5);

      orcamento.itens.forEach(item => {
        const descricao =
          item.tipo === 'produto'
            ? item.produto_nome || `Produto #${item.produto_id}`
            : item.servico_descricao;

        doc
          .fontSize(10)
          .text(
            `${descricao} — ${item.quantidade} x R$ ${Number(
              item.preco_unitario
            ).toFixed(2)} = R$ ${Number(item.total_item).toFixed(2)}`
          );
      });

      doc.moveDown();
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown();

      /* ============================
         TOTAIS
      ============================ */
      doc
        .fontSize(10)
        .text(`Subtotal: R$ ${Number(orcamento.subtotal).toFixed(2)}`);

      if (orcamento.desconto_tipo) {
        doc.text(
          `Desconto: ${
            orcamento.desconto_tipo === 'percentual'
              ? `${orcamento.desconto_valor}%`
              : `R$ ${Number(orcamento.desconto_valor).toFixed(2)}`
          }`
        );
      }

      doc.moveDown(0.5);

      doc
        .fontSize(13)
        .text(`Total: R$ ${Number(orcamento.valor_total).toFixed(2)}`, {
          underline: true
        });

      /* ============================
         OBSERVAÇÕES
      ============================ */
      if (orcamento.observacoes) {
        doc.moveDown();
        doc.fontSize(10).text('Observações:');
        doc.text(orcamento.observacoes);
      }

      doc.moveDown(2);

      /* ============================
         MENSAGEM PADRÃO DA EMPRESA
      ============================ */
      doc
        .fontSize(8)
        .fillColor('gray')
        .text(
          empresa.mensagem_orcamento ||
            'Este orçamento é apenas uma estimativa. Valores podem sofrer alterações sem aviso prévio.'
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
