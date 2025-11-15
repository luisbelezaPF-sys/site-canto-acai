'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Home, User } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 to-purple-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">
              Canto do Açaí
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-yellow-400 text-purple-900 font-bold'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Cardápio</span>
            </Link>
            <Link
              href="/pedido"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/pedido')
                  ? 'bg-yellow-400 text-purple-900 font-bold'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Pedido</span>
            </Link>
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/admin')
                  ? 'bg-yellow-400 text-purple-900 font-bold'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Menu Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              href="/"
              className={`p-3 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-yellow-400 text-purple-900'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <Home className="w-6 h-6" />
            </Link>
            <Link
              href="/pedido"
              className={`p-3 rounded-lg transition-all ${
                isActive('/pedido')
                  ? 'bg-yellow-400 text-purple-900'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
            </Link>
            <Link
              href="/admin"
              className={`p-3 rounded-lg transition-all ${
                isActive('/admin')
                  ? 'bg-yellow-400 text-purple-900'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
