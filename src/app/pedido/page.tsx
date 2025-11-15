'use client'

import { useState, useEffect } from 'react'
import { ItemCarrinho } from '@/lib/types'
import { Trash2, Send } from 'lucide-react'
import Navbar from '@/components/custom/navbar'
import { supabase } from '@/lib/supabase'

export default function PedidoPage() {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [nomeCliente, setNomeCliente] = useState('')
  const [endereco, setEndereco] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho')
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo))
    }
  }, [])

  const removerItem = (id: string) => {
    const novoCarrinho = carrinho.filter((item) => item.id !== id)
    setCarrinho(novoCarrinho)
    localStorage.setItem('carrinho', JSON.stringify(novoCarrinho))
  }

  const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  const taxaEntrega = 2.0
  const total = subtotal + taxaEntrega

  const finalizarPedido = async () => {
    if (!nomeCliente || !endereco || carrinho.length === 0) {
      alert('Por favor, preencha todos os campos!')
      return
    }

    setEnviando(true)

    try {
      // 1. Registrar pedido no Supabase
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          nome_cliente: nomeCliente,
          endereco: endereco,
          itens: carrinho,
          total: total,
          taxa_entrega: taxaEntrega,
        })
        .select()
        .single()

      if (pedidoError) {
        console.error('Erro ao salvar pedido:', pedidoError)
      }

      const numeroPedido = pedidoData?.id?.slice(0, 8) || Date.now().toString().slice(-8)

      // 2. Registrar no faturamento
      await supabase.from('faturamento').insert({
        valor: total,
      })

      // 3. Montar mensagem WhatsApp
      let mensagem = `*NOVO PEDIDO - #${numeroPedido}*\n\n`
      mensagem += `*Cliente:* ${nomeCliente}\n`
      mensagem += `*Endereco:* ${endereco}\n`
      mensagem += `*Data/Hora:* ${new Date().toLocaleString('pt-BR')}\n\n`
      mensagem += `*ITENS:*\n`

      carrinho.forEach((item, index) => {
        mensagem += `\n${index + 1}. ${item.nome}`
        if (item.tamanho) mensagem += ` - ${item.tamanho}`
        if (item.sabor) mensagem += `\n   Sabor: ${item.sabor}`
        if (item.acompanhamentos && item.acompanhamentos.length > 0) {
          mensagem += `\n   Acompanhamentos: ${item.acompanhamentos.join(', ')}`
        }
        if (item.frutas && item.frutas.length > 0) {
          mensagem += `\n   Frutas: ${item.frutas.join(', ')}`
        }
        if (item.cobertura) mensagem += `\n   Cobertura: ${item.cobertura}`
        if (item.cremes && item.cremes.length > 0) {
          mensagem += `\n   Cremes: ${item.cremes.join(', ')}`
        }
        if (item.sorvete) mensagem += `\n   Sorvete: ${item.sorvete} (+R$ 4,00)`
        mensagem += `\n   Quantidade: ${item.quantidade}x`
        mensagem += `\n   Subtotal: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
      })

      mensagem += `\n*SUBTOTAL:* R$ ${subtotal.toFixed(2)}`
      mensagem += `\n*Taxa de Entrega:* R$ ${taxaEntrega.toFixed(2)}`
      mensagem += `\n*TOTAL:* R$ ${total.toFixed(2)}`

      // 4. Enviar para WhatsApp
      const telefone = '5535997440729'
      const urlWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
      window.open(urlWhatsApp, '_blank')

      // 5. Limpar carrinho e mostrar sucesso
      setCarrinho([])
      localStorage.removeItem('carrinho')
      setSucesso(true)
      setNomeCliente('')
      setEndereco('')

      setTimeout(() => {
        setSucesso(false)
      }, 5000)
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      alert('Erro ao finalizar pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-8 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-6 md:mb-8 text-center">
            Seu Pedido
          </h1>

          {sucesso && (
            <div className="bg-green-500 text-white p-4 md:p-6 rounded-xl mb-6 text-center font-semibold text-base md:text-lg">
              Pedido enviado com sucesso! Aguarde o contato via WhatsApp.
            </div>
          )}

          {carrinho.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center">
              <p className="text-xl md:text-2xl text-white mb-4">
                Seu carrinho está vazio
              </p>
              <a
                href="/"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all text-base md:text-lg"
              >
                Ver Cardápio
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Itens do Carrinho */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-4">
                  Itens do Pedido
                </h2>
                <div className="space-y-4">
                  {carrinho.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                          {item.nome}
                          {item.tamanho && ` - ${item.tamanho}`}
                        </h3>
                        {item.sabor && (
                          <p className="text-white/80 text-sm md:text-base">
                            Sabor: {item.sabor}
                          </p>
                        )}
                        {item.acompanhamentos && item.acompanhamentos.length > 0 && (
                          <p className="text-white/80 text-sm md:text-base">
                            Acompanhamentos: {item.acompanhamentos.join(', ')}
                          </p>
                        )}
                        {item.frutas && item.frutas.length > 0 && (
                          <p className="text-white/80 text-sm md:text-base">
                            Frutas: {item.frutas.join(', ')}
                          </p>
                        )}
                        {item.cobertura && (
                          <p className="text-white/80 text-sm md:text-base">
                            Cobertura: {item.cobertura}
                          </p>
                        )}
                        {item.cremes && item.cremes.length > 0 && (
                          <p className="text-white/80 text-sm md:text-base">
                            Cremes: {item.cremes.join(', ')}
                          </p>
                        )}
                        {item.sorvete && (
                          <p className="text-white/80 text-sm md:text-base">
                            Sorvete: {item.sorvete} (+R$ 4,00)
                          </p>
                        )}
                        <p className="text-white font-semibold mt-2 text-sm md:text-base">
                          Quantidade: {item.quantidade}x - R${' '}
                          {(item.preco * item.quantidade).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removerItem(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-all self-start sm:self-center"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Totais */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex justify-between text-white mb-2 text-base md:text-lg">
                    <span>Subtotal:</span>
                    <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white mb-2 text-base md:text-lg">
                    <span>Taxa de Entrega:</span>
                    <span className="font-semibold">R$ {taxaEntrega.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 text-xl md:text-2xl font-bold">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Formulário de Entrega */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-4">
                  Dados para Entrega
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2 text-base md:text-lg">
                      Nome Completo:
                    </label>
                    <input
                      type="text"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      className="w-full p-3 md:p-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-yellow-400 focus:outline-none text-base md:text-lg"
                      placeholder="Digite seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2 text-base md:text-lg">
                      Endereço Completo:
                    </label>
                    <textarea
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="w-full p-3 md:p-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-yellow-400 focus:outline-none min-h-[100px] text-base md:text-lg"
                      placeholder="Rua, número, bairro, complemento..."
                    />
                  </div>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={finalizarPedido}
                disabled={enviando}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-purple-900 font-bold py-4 md:py-5 px-6 md:px-8 rounded-xl transition-all flex items-center justify-center space-x-3 text-lg md:text-xl shadow-xl"
              >
                <Send className="w-6 h-6 md:w-7 md:h-7" />
                <span>{enviando ? 'Enviando...' : 'Finalizar Pedido'}</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
