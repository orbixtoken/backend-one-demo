import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export function gerarPDFOrdem(ordem, itens, cliente = null) {
  const doc = new PDFDocument({ margin: 50 });

  const fileName = `ordem_${ordem.id}.pdf`;
  const outputPath = path.resolve('tmp', fileName);

  // cria pasta tmp se não existir
  if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
  }

  doc.pipe(fs.createWriteStream(outputPath));

  // Cabeçalho
  doc.fontSize(18).text('Ordem de Serviço / Venda', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Ordem Nº: ${ordem.id}`);
  doc.text(`Data: ${new Date(ordem.criado_em).toLocaleString()}`);
  doc.moveDown();

  if (cliente) {
    doc.text(`Cliente: ${cliente.nome}`);
    doc.text(`Telefone: ${cliente.telefone || '-'}`);
    doc.moveDown();
  }

  // Itens
  doc.fontSize(14).text('Itens', { underline: true });
  doc.moveDown(0.5);

  itens.forEach(item => {
    doc
      .fontSize(12)
      .text(
        `${item.nome_produto} | Qtd: ${item.quantidade} | Valor: R$ ${item.valor_unitario}`
      );
  });

  doc.moveDown();

  doc
    .fontSize(14)
    .text(`Total: R$ ${ordem.valor_total}`, { align: 'right' });

  doc.end();

  return outputPath;
}
