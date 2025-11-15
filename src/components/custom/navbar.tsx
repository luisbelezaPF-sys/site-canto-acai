'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#4B0082] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl md:text-3xl font-bold text-[#FFC300]">
              Canto do Açaí
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-[#FFC300] text-[#4B0082] font-bold'
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
                  ? 'bg-[#FFC300] text-[#4B0082] font-bold'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>Pedido</span>
            </Link>
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/admin')
                  ? 'bg-[#FFC300] text-[#4B0082] font-bold'
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
                  ? 'bg-[#FFC300] text-[#4B0082]'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <Home className="w-6 h-6" />
            </Link>
            <Link
              href="/pedido"
              className={`p-3 rounded-lg transition-all ${
                isActive('/pedido')
                  ? 'bg-[#FFC300] text-[#4B0082]'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
            <Link
              href="/admin"
              className={`p-3 rounded-lg transition-all ${
                isActive('/admin')
                  ? 'bg-[#FFC300] text-[#4B0082]'
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
