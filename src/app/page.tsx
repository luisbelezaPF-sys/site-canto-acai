'use client'

import { useState } from 'react'
import { cardapioData } from '@/lib/cardapio-data'
import { MenuItem, ItemCarrinho } from '@/lib/types'
import { Plus, ShoppingCart } from 'lucide-react'
import Navbar from '@/components/custom/navbar'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState<MenuItem | null>(null)
  const [configuracao, setConfiguracao] = useState<any>({})

  const abrirModal = (item: MenuItem) => {
    setItemSelecionado(item)
    setConfiguracao({
      tamanho: item.tamanhos?.[0],
      sabor: item.sabores?.[0] || '',
      acompanhamentos: [],
      frutas: [],
      cobertura: '',
      cremes: [],
      sorvete: '',
      quantidade: 1,
    })
    setModalAberto(true)
  }

  const adicionarAoCarrinho = () => {
    if (!itemSelecionado) return

    let preco = itemSelecionado.preco || configuracao.tamanho?.preco || 0
    
    // Adicionar preço do sorvete se selecionado
    if (configuracao.sorvete) {
      preco += 4
    }

    const novoItem: ItemCarrinho = {
      id: `${itemSelecionado.id}-${Date.now()}`,
      nome: itemSelecionado.nome,
      tamanho: configuracao.tamanho?.ml,
      sabor: configuracao.sabor,
      acompanhamentos: configuracao.acompanhamentos,
      frutas: configuracao.frutas,
      cobertura: configuracao.cobertura,
      cremes: configuracao.cremes,
      sorvete: configuracao.sorvete,
      preco,
      quantidade: configuracao.quantidade,
    }

    setCarrinho([...carrinho, novoItem])
    setModalAberto(false)
    setItemSelecionado(null)
  }

  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0)

  const irParaPedido = () => {
    if (carrinho.length > 0) {
      localStorage.setItem('carrinho', JSON.stringify(carrinho))
      router.push('/pedido')
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-24 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2 md:mb-4">
              Canto do Açaí
            </h1>
            <p className="text-lg md:text-xl text-white">
              Sabor e qualidade em cada pedido
            </p>
          </div>

          {/* Cardápio por Categoria */}
          {['acai', 'milkshake', 'brownie', 'bebida'].map((categoria) => {
            const itens = cardapioData.filter((item) => item.categoria === categoria)
            const titulos: any = {
              acai: 'Açaí',
              milkshake: 'Milkshakes',
              brownie: 'Brownies',
              bebida: 'Bebidas',
            }

            return (
              <div key={categoria} className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-yellow-400 mb-4 md:mb-6">
                  {titulos[categoria]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    >
                      <h3 className="text-xl md:text-2xl font-bold text-yellow-400 mb-2 md:mb-3">
                        {item.nome}
                      </h3>
                      
                      {item.tamanhos && (
                        <div className="mb-3 md:mb-4">
                          <p className="text-white font-semibold mb-2">Tamanhos:</p>
                          {item.tamanhos.map((t) => (
                            <p key={t.ml} className="text-white text-sm md:text-base">
                              {t.ml} - R$ {t.preco.toFixed(2)}
                            </p>
                          ))}
                        </div>
                      )}

                      {item.preco && (
                        <p className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3 md:mb-4">
                          R$ {item.preco.toFixed(2)}
                        </p>
                      )}

                      {item.sabores && (
                        <p className="text-white text-sm md:text-base mb-2">
                          Sabores: {item.sabores.join(', ')}
                        </p>
                      )}

                      <button
                        onClick={() => abrirModal(item)}
                        className="w-full mt-3 md:mt-4 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all flex items-center justify-center space-x-2 text-base md:text-lg"
                      >
                        <Plus className="w-5 h-5 md:w-6 md:h-6" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Botão Carrinho Flutuante */}
        {carrinho.length > 0 && (
          <button
            onClick={irParaPedido}
            className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold p-4 md:p-5 rounded-full shadow-2xl transition-all hover:scale-110 z-50"
          >
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-lg md:text-xl">{carrinho.length}</span>
            </div>
          </button>
        )}

        {/* Modal de Configuração */}
        {modalAberto && itemSelecionado && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-purple-900 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4 md:mb-6">
                {itemSelecionado.nome}
              </h2>

              {/* Tamanhos */}
              {itemSelecionado.tamanhos && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    Tamanho:
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {itemSelecionado.tamanhos.map((t) => (
                      <button
                        key={t.ml}
                        onClick={() => setConfiguracao({ ...configuracao, tamanho: t })}
                        className={`p-3 md:p-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
                          configuracao.tamanho?.ml === t.ml
                            ? 'bg-yellow-400 text-purple-900'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {t.ml} - R$ {t.preco.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sabores */}
              {itemSelecionado.sabores && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    Sabor:
                  </label>
                  <select
                    value={configuracao.sabor}
                    onChange={(e) => setConfiguracao({ ...configuracao, sabor: e.target.value })}
                    className="w-full p-3 md:p-4 rounded-xl bg-white/10 text-white border border-white/20 text-sm md:text-base"
                  >
                    {itemSelecionado.sabores.map((s) => (
                      <option key={s} value={s} className="bg-purple-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Acompanhamentos */}
              {itemSelecionado.acompanhamentos && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    Acompanhamentos (opcional):
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {itemSelecionado.acompanhamentos.map((a) => (
                      <button
                        key={a}
                        onClick={() => {
                          const atual = configuracao.acompanhamentos || []
                          const novo = atual.includes(a)
                            ? atual.filter((x: string) => x !== a)
                            : [...atual, a]
                          setConfiguracao({ ...configuracao, acompanhamentos: novo })
                        }}
                        className={`p-2 md:p-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                          configuracao.acompanhamentos?.includes(a)
                            ? 'bg-yellow-400 text-purple-900'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Frutas */}
              {itemSelecionado.frutas && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    Frutas (opcional):
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {itemSelecionado.frutas.map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          const atual = configuracao.frutas || []
                          const novo = atual.includes(f)
                            ? atual.filter((x: string) => x !== f)
                            : [...atual, f]
                          setConfiguracao({ ...configuracao, frutas: novo })
                        }}
                        className={`p-2 md:p-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                          configuracao.frutas?.includes(f)
                            ? 'bg-yellow-400 text-purple-900'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Coberturas */}
              {itemSelecionado.coberturas && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    Cobertura (opcional):
                  </label>
                  <select
                    value={configuracao.cobertura}
                    onChange={(e) => setConfiguracao({ ...configuracao, cobertura: e.target.value })}
                    className="w-full p-3 md:p-4 rounded-xl bg-white/10 text-white border border-white/20 text-sm md:text-base"
                  >
                    <option value="" className="bg-purple-900">Nenhuma</option>
                    {itemSelecionado.coberturas.map((c) => (
                      <option key={c} value={c} className="bg-purple-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cremes (Brownie) */}
              {itemSelecionado.cremes && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    Cremes (escolha 2):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {itemSelecionado.cremes.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          const atual = configuracao.cremes || []
                          if (atual.includes(c)) {
                            setConfiguracao({ ...configuracao, cremes: atual.filter((x: string) => x !== c) })
                          } else if (atual.length < 2) {
                            setConfiguracao({ ...configuracao, cremes: [...atual, c] })
                          }
                        }}
                        className={`p-2 md:p-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                          configuracao.cremes?.includes(c)
                            ? 'bg-yellow-400 text-purple-900'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sorvete (Brownie) */}
              {itemSelecionado.sorvetes && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    Adicionar Sorvete (+R$ 4,00):
                  </label>
                  <select
                    value={configuracao.sorvete}
                    onChange={(e) => setConfiguracao({ ...configuracao, sorvete: e.target.value })}
                    className="w-full p-3 md:p-4 rounded-xl bg-white/10 text-white border border-white/20 text-sm md:text-base"
                  >
                    <option value="" className="bg-purple-900">Sem sorvete</option>
                    {itemSelecionado.sorvetes.map((s) => (
                      <option key={s} value={s} className="bg-purple-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantidade */}
              <div className="mb-6 md:mb-8">
                <label className="block text-white font-semibold mb-2 md:mb-3 text-base md:text-lg">
                  Quantidade:
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setConfiguracao({ ...configuracao, quantidade: Math.max(1, configuracao.quantidade - 1) })}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold w-12 h-12 md:w-14 md:h-14 rounded-xl text-xl md:text-2xl"
                  >
                    -
                  </button>
                  <span className="text-2xl md:text-3xl font-bold text-white min-w-[3rem] text-center">
                    {configuracao.quantidade}
                  </span>
                  <button
                    onClick={() => setConfiguracao({ ...configuracao, quantidade: configuracao.quantidade + 1 })}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold w-12 h-12 md:w-14 md:h-14 rounded-xl text-xl md:text-2xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => setModalAberto(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all text-base md:text-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={adicionarAoCarrinho}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all text-base md:text-lg"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
