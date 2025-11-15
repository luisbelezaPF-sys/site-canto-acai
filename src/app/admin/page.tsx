'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/custom/navbar'
import { Download, Printer, TrendingUp, Package, DollarSign, Calendar, FileText, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'

interface Pedido {
  id: string
  nome_cliente: string
  endereco: string
  itens: any[]
  total: number
  taxa_entrega: number
  data_hora: string
  entregue: boolean
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [faturamentoTotal, setFaturamentoTotal] = useState(0)
  const [faturamentoDiario, setFaturamentoDiario] = useState(0)
  const [faturamentoMensal, setFaturamentoMensal] = useState(0)
  const [produtosRanking, setProdutosRanking] = useState<any[]>([])
  const [carregando, setCarregando] = useState(false)

  const fazerLogin = async () => {
    if (username === 'admin' && senha === 'jonjon25') {
      setAutenticado(true)
      carregarDados()
    } else {
      alert('Usuário ou senha incorretos!')
    }
  }

  const carregarDados = async () => {
    setCarregando(true)

    // Carregar pedidos
    const { data: pedidosData } = await supabase
      .from('pedidos')
      .select('*')
      .order('data_hora', { ascending: false })

    if (pedidosData) {
      setPedidos(pedidosData)

      // Calcular faturamento total
      const total = pedidosData.reduce((acc, p) => acc + parseFloat(p.total.toString()), 0)
      setFaturamentoTotal(total)

      // Calcular faturamento diário
      const hoje = new Date().toISOString().split('T')[0]
      const pedidosHoje = pedidosData.filter((p) => p.data_hora.startsWith(hoje))
      const totalHoje = pedidosHoje.reduce((acc, p) => acc + parseFloat(p.total.toString()), 0)
      setFaturamentoDiario(totalHoje)

      // Calcular faturamento mensal
      const mesAtual = new Date().toISOString().slice(0, 7)
      const pedidosMes = pedidosData.filter((p) => p.data_hora.startsWith(mesAtual))
      const totalMes = pedidosMes.reduce((acc, p) => acc + parseFloat(p.total.toString()), 0)
      setFaturamentoMensal(totalMes)

      // Calcular ranking de produtos
      const contagem: any = {}
      pedidosData.forEach((pedido) => {
        pedido.itens.forEach((item: any) => {
          const chave = item.nome
          if (!contagem[chave]) {
            contagem[chave] = { nome: chave, quantidade: 0 }
          }
          contagem[chave].quantidade += item.quantidade
        })
      })
      const ranking = Object.values(contagem).sort((a: any, b: any) => b.quantidade - a.quantidade)
      setProdutosRanking(ranking.slice(0, 10))
    }

    setCarregando(false)
  }

  const gerarPDF = (pedido: Pedido) => {
    const doc = new jsPDF({
      format: [80, 200],
      unit: 'mm',
    })

    doc.setFontSize(12)
    doc.text('CANTO DO ACAI', 40, 10, { align: 'center' })
    doc.setFontSize(8)
    doc.text('Cupom Fiscal', 40, 15, { align: 'center' })
    doc.text('--------------------------------', 5, 18)
    
    doc.text(`Pedido: #${pedido.id.slice(0, 8)}`, 5, 23)
    doc.text(`Data: ${new Date(pedido.data_hora).toLocaleString('pt-BR')}`, 5, 28)
    doc.text(`Cliente: ${pedido.nome_cliente}`, 5, 33)
    doc.text(`Endereco: ${pedido.endereco}`, 5, 38)
    doc.text('--------------------------------', 5, 43)
    
    let y = 48
    doc.text('ITENS:', 5, y)
    y += 5

    pedido.itens.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.nome}`, 5, y)
      y += 4
      if (item.tamanho) {
        doc.text(`   ${item.tamanho}`, 5, y)
        y += 4
      }
      if (item.sabor) {
        doc.text(`   Sabor: ${item.sabor}`, 5, y)
        y += 4
      }
      if (item.acompanhamentos && item.acompanhamentos.length > 0) {
        doc.text(`   Acomp: ${item.acompanhamentos.join(', ')}`, 5, y)
        y += 4
      }
      if (item.frutas && item.frutas.length > 0) {
        doc.text(`   Frutas: ${item.frutas.join(', ')}`, 5, y)
        y += 4
      }
      if (item.cobertura) {
        doc.text(`   Cobertura: ${item.cobertura}`, 5, y)
        y += 4
      }
      if (item.cremes && item.cremes.length > 0) {
        doc.text(`   Cremes: ${item.cremes.join(', ')}`, 5, y)
        y += 4
      }
      if (item.sorvete) {
        doc.text(`   Sorvete: ${item.sorvete}`, 5, y)
        y += 4
      }
      doc.text(`   ${item.quantidade}x R$ ${item.preco.toFixed(2)}`, 5, y)
      y += 5
    })

    doc.text('--------------------------------', 5, y)
    y += 5
    doc.text(`Subtotal: R$ ${(pedido.total - pedido.taxa_entrega).toFixed(2)}`, 5, y)
    y += 5
    doc.text(`Taxa Entrega: R$ ${pedido.taxa_entrega.toFixed(2)}`, 5, y)
    y += 5
    doc.setFontSize(10)
    doc.text(`TOTAL: R$ ${pedido.total.toFixed(2)}`, 5, y)

    doc.save(`cupom-${pedido.id.slice(0, 8)}.pdf`)
  }

  const imprimirCupom = (pedido: Pedido) => {
    const conteudo = `
      <html>
        <head>
          <title>Cupom Fiscal - #${pedido.id.slice(0, 8)}</title>
          <style>
            body { font-family: monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 10px; }
            h1 { text-align: center; font-size: 16px; margin: 5px 0; }
            h2 { text-align: center; font-size: 12px; margin: 5px 0; }
            hr { border: 1px dashed #000; }
            .item { margin: 10px 0; }
            .total { font-size: 14px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>CANTO DO AÇAÍ</h1>
          <h2>Cupom Fiscal</h2>
          <hr>
          <p><strong>Pedido:</strong> #${pedido.id.slice(0, 8)}</p>
          <p><strong>Data:</strong> ${new Date(pedido.data_hora).toLocaleString('pt-BR')}</p>
          <p><strong>Cliente:</strong> ${pedido.nome_cliente}</p>
          <p><strong>Endereço:</strong> ${pedido.endereco}</p>
          <hr>
          <h2>ITENS:</h2>
          ${pedido.itens.map((item, index) => `
            <div class="item">
              <strong>${index + 1}. ${item.nome}</strong>
              ${item.tamanho ? `<br>&nbsp;&nbsp;${item.tamanho}` : ''}
              ${item.sabor ? `<br>&nbsp;&nbsp;Sabor: ${item.sabor}` : ''}
              ${item.acompanhamentos && item.acompanhamentos.length > 0 ? `<br>&nbsp;&nbsp;Acompanhamentos: ${item.acompanhamentos.join(', ')}` : ''}
              ${item.frutas && item.frutas.length > 0 ? `<br>&nbsp;&nbsp;Frutas: ${item.frutas.join(', ')}` : ''}
              ${item.cobertura ? `<br>&nbsp;&nbsp;Cobertura: ${item.cobertura}` : ''}
              ${item.cremes && item.cremes.length > 0 ? `<br>&nbsp;&nbsp;Cremes: ${item.cremes.join(', ')}` : ''}
              ${item.sorvete ? `<br>&nbsp;&nbsp;Sorvete: ${item.sorvete}` : ''}
              <br>&nbsp;&nbsp;${item.quantidade}x R$ ${item.preco.toFixed(2)}
            </div>
          `).join('')}
          <hr>
          <p>Subtotal: R$ ${(pedido.total - pedido.taxa_entrega).toFixed(2)}</p>
          <p>Taxa de Entrega: R$ ${pedido.taxa_entrega.toFixed(2)}</p>
          <p class="total">TOTAL: R$ ${pedido.total.toFixed(2)}</p>
        </body>
      </html>
    `

    const janela = window.open('', '_blank')
    if (janela) {
      janela.document.write(conteudo)
      janela.document.close()
      janela.print()
    }
  }

  const marcarComoEntregue = async (id: string) => {
    await supabase.from('pedidos').update({ entregue: true }).eq('id', id)
    carregarDados()
  }

  const exportarCSV = () => {
    let csv = 'ID,Cliente,Endereco,Total,Taxa Entrega,Data/Hora,Entregue\n'
    pedidos.forEach((p) => {
      csv += `${p.id},${p.nome_cliente},${p.endereco},${p.total},${p.taxa_entrega},${p.data_hora},${p.entregue ? 'Sim' : 'Nao'}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (!autenticado) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-8 px-4 relative z-10 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 max-w-md w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6 text-center">
              Painel Admin
            </h1>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Usuário:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-yellow-400 focus:outline-none"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Senha:</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-yellow-400 focus:outline-none"
                  placeholder="••••••"
                  onKeyPress={(e) => e.key === 'Enter' && fazerLogin()}
                />
              </div>
              <button
                onClick={fazerLogin}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 px-6 rounded-xl transition-all"
              >
                Entrar
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-8 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-8 text-center">
            Painel Administrativo
          </h1>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center space-x-4">
              <DollarSign className="w-12 h-12 text-yellow-400" />
              <div>
                <p className="text-white/70 text-sm">Faturamento Total</p>
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {faturamentoTotal.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center space-x-4">
              <Calendar className="w-12 h-12 text-yellow-400" />
              <div>
                <p className="text-white/70 text-sm">Faturamento Hoje</p>
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {faturamentoDiario.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center space-x-4">
              <TrendingUp className="w-12 h-12 text-yellow-400" />
              <div>
                <p className="text-white/70 text-sm">Faturamento Mensal</p>
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {faturamentoMensal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico de Produtos Mais Vendidos */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Produtos Mais Vendidos
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={produtosRanking}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="nome" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#581c87', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#facc15' }}
                />
                <Bar dataKey="quantidade" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Botão Exportar CSV */}
          <div className="mb-6">
            <button
              onClick={exportarCSV}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Lista de Pedidos */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Todos os Pedidos</h2>
            {carregando ? (
              <p className="text-white text-center">Carregando...</p>
            ) : pedidos.length === 0 ? (
              <p className="text-white text-center">Nenhum pedido encontrado</p>
            ) : (
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className={`bg-white/5 rounded-xl p-4 ${
                      pedido.entregue ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Pedido #{pedido.id.slice(0, 8)}
                          {pedido.entregue && (
                            <span className="ml-2 text-green-400 text-sm">(Entregue)</span>
                          )}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {new Date(pedido.data_hora).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => gerarPDF(pedido)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => imprimirCupom(pedido)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Imprimir</span>
                        </button>
                        {!pedido.entregue && (
                          <button
                            onClick={() => marcarComoEntregue(pedido.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Entregue</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-white/80 text-sm">
                      <p>
                        <strong>Cliente:</strong> {pedido.nome_cliente}
                      </p>
                      <p>
                        <strong>Endereço:</strong> {pedido.endereco}
                      </p>
                      <p>
                        <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
                      </p>
                      <p>
                        <strong>Itens:</strong> {pedido.itens.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
