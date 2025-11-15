export interface MenuItem {
  id: string
  categoria: 'acai' | 'milkshake' | 'brownie' | 'bebida'
  nome: string
  tamanhos?: { ml: string; preco: number }[]
  preco?: number
  sabores?: string[]
  acompanhamentos?: string[]
  frutas?: string[]
  coberturas?: string[]
  cremes?: string[]
  sorvetes?: string[]
}

export interface ItemCarrinho {
  id: string
  nome: string
  tamanho?: string
  sabor?: string
  acompanhamentos?: string[]
  frutas?: string[]
  cobertura?: string
  cremes?: string[]
  sorvete?: string
  preco: number
  quantidade: number
}

export interface Pedido {
  id?: string
  nome_cliente: string
  endereco: string
  itens: ItemCarrinho[]
  total: number
  taxa_entrega: number
  data_hora?: string
  entregue?: boolean
}
