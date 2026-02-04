import PDFDocument from 'pdfkit';

/**
 * Gera PDF da ordem
 */
export function gerarOrdemPdf(ordem, empresa, financeiro = []) {
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
         DADOS DA ORDEM
      ============================ */
      doc.fontSize(14).text(`Ordem #${ordem.id}`);
      doc.moveDown(0.5);

      doc.fontSize(10);

      if (ordem.data_abertura) {
        doc.text(
          `Data de abertura: ${new Date(ordem.data_abertura).toLocaleString()}`
        );
      }

      if (ordem.cliente_nome) {
        doc.text(`Cliente: ${ordem.cliente_nome}`);
      }

      doc.moveDown();

      /* ============================
         ITENS DA ORDEM
      ============================ */
      doc.fontSize(12).text('Itens da Ordem');
      doc.moveDown(0.5);

      ordem.itens.forEach(item => {
        const descricao =
          item.produto_nome
            ? item.produto_nome
            : item.produto_id
            ? `Produto #${item.produto_id}`
            : item.servico_descricao;

        const totalItem = item.quantidade * item.preco_unitario;

        doc
          .fontSize(10)
          .text(
            `${descricao} — ${item.quantidade} x R$ ${Number(
              item.preco_unitario
            ).toFixed(2)} = R$ ${totalItem.toFixed(2)}`
          );
      });

      doc.moveDown();
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown();

      /* ============================
         RESUMO FINANCEIRO
      ============================ */
      doc.fontSize(10);

      if (ordem.subtotal != null) {
        doc.text(`Subtotal: R$ ${Number(ordem.subtotal).toFixed(2)}`);
      }

      if (ordem.desconto_tipo && Number(ordem.desconto_valor) > 0) {
        const textoDesconto =
          ordem.desconto_tipo === 'percentual'
            ? `${ordem.desconto_valor}%`
            : `R$ ${Number(ordem.desconto_valor).toFixed(2)}`;

        doc.text(`Desconto: - ${textoDesconto}`);
      }

      doc.moveDown(0.5);

      doc
        .fontSize(13)
        .text(`Total da Ordem: R$ ${Number(ordem.valor_total).toFixed(2)}`);

      /* ============================
         FINANCEIRO (SALDO)
      ============================ */
      const totalEntrada = financeiro
        .filter(f => f.tipo === 'entrada')
        .reduce((t, f) => t + Number(f.valor), 0);

      const totalEstorno = financeiro
        .filter(f => f.tipo === 'estorno')
        .reduce((t, f) => t + Number(f.valor), 0);

      const saldo = totalEntrada - totalEstorno;

      doc
        .fontSize(12)
        .text(`Saldo Financeiro: R$ ${saldo.toFixed(2)}`, {
          underline: true
        });

      doc.moveDown(2);

      /* ============================
         TEXTO LEGAL
      ============================ */
      doc
        .fontSize(8)
        .fillColor('gray')
        .text(
          empresa.observacoes ||
            'Documento referente à ordem executada. Este documento possui validade legal.'
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
