import jsPDF from 'jspdf'
import { ItemCarrinho } from './types'

export interface CupomData {
  pedidoId: string
  nomeCliente: string
  endereco: string
  itens: ItemCarrinho[]
  subtotal: number
  taxaEntrega: number
  total: number
  dataHora: string
}

export function gerarCupomPDF(data: CupomData): Blob {
  const doc = new jsPDF({
    format: [80, 297], // 80mm de largura (cupom térmico)
    unit: 'mm',
  })

  let y = 10

  // Cabeçalho
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CANTO DO ACAI', 40, y, { align: 'center' })
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Cupom Fiscal', 40, y, { align: 'center' })
  y += 5

  doc.text('================================', 5, y)
  y += 5

  // Informações do Pedido
  doc.setFontSize(8)
  doc.text(`Pedido: #${data.pedidoId}`, 5, y)
  y += 4
  doc.text(`Data: ${data.dataHora}`, 5, y)
  y += 4
  doc.text(`Cliente: ${data.nomeCliente}`, 5, y)
  y += 4
  
  // Quebrar endereço em múltiplas linhas se necessário
  const enderecoLines = doc.splitTextToSize(`Endereco: ${data.endereco}`, 70)
  enderecoLines.forEach((line: string) => {
    doc.text(line, 5, y)
    y += 4
  })

  doc.text('================================', 5, y)
  y += 5

  // Itens
  doc.setFont('helvetica', 'bold')
  doc.text('ITENS:', 5, y)
  y += 5
  doc.setFont('helvetica', 'normal')

  data.itens.forEach((item, index) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${item.nome}`, 5, y)
    y += 4
    doc.setFont('helvetica', 'normal')

    if (item.tamanho) {
      doc.text(`   ${item.tamanho}`, 5, y)
      y += 3
    }
    if (item.sabor) {
      doc.text(`   Sabor: ${item.sabor}`, 5, y)
      y += 3
    }
    if (item.acompanhamentos && item.acompanhamentos.length > 0) {
      const acomp = doc.splitTextToSize(`   Acomp: ${item.acompanhamentos.join(', ')}`, 70)
      acomp.forEach((line: string) => {
        doc.text(line, 5, y)
        y += 3
      })
    }
    if (item.frutas && item.frutas.length > 0) {
      const frutas = doc.splitTextToSize(`   Frutas: ${item.frutas.join(', ')}`, 70)
      frutas.forEach((line: string) => {
        doc.text(line, 5, y)
        y += 3
      })
    }
    if (item.cobertura) {
      doc.text(`   Cobertura: ${item.cobertura}`, 5, y)
      y += 3
    }
    if (item.cremes && item.cremes.length > 0) {
      const cremes = doc.splitTextToSize(`   Cremes: ${item.cremes.join(', ')}`, 70)
      cremes.forEach((line: string) => {
        doc.text(line, 5, y)
        y += 3
      })
    }
    if (item.sorvete) {
      doc.text(`   Sorvete: ${item.sorvete}`, 5, y)
      y += 3
    }

    doc.text(`   ${item.quantidade}x R$ ${item.preco.toFixed(2)}`, 5, y)
    y += 5
  })

  doc.text('================================', 5, y)
  y += 5

  // Totais
  doc.text(`Subtotal: R$ ${data.subtotal.toFixed(2)}`, 5, y)
  y += 4
  doc.text(`Taxa de Entrega: R$ ${data.taxaEntrega.toFixed(2)}`, 5, y)
  y += 5

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL: R$ ${data.total.toFixed(2)}`, 5, y)
  y += 8

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Obrigado por comprar no', 40, y, { align: 'center' })
  y += 4
  doc.text('Canto do Acai!', 40, y, { align: 'center' })

  return doc.output('blob')
}

export function imprimirCupom(url: string) {
  const win = window.open(url, '_blank')
  if (win) {
    win.onload = () => {
      win.print()
    }
  }
}
