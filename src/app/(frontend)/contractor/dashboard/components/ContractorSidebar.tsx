'use client'

/**
 * ContractorSidebar Component
 *
 * Sidebar navigation component for contractor dashboard pages.
 * Shows links to all contractor features and logout button.
 *
 * @param {Object} props - Component props
 * @param {string} props.activePath - Current active path to highlight
 * @returns {JSX.Element} Sidebar for contractor pages
 */
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wrench, Home, Search, User, LogOut } from 'lucide-react'

interface ContractorSidebarProps {
  activePath: string
}

export const ContractorSidebar: React.FC<ContractorSidebarProps> = ({ activePath }) => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/contractor/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="w-64 bg-white shadow-sm p-4 hidden md:block">
      <div className="flex items-center space-x-2 pb-4 mb-4 border-b">
        <Wrench className="h-6 w-6 text-primary" />
        <h1 className="font-bold text-xl">Portal Contratista</h1>
      </div>

      <nav className="space-y-2">
        <Link
          href="/contractor/dashboard"
          className={`flex items-center space-x-2 p-2 rounded-md ${
            activePath === '/contractor/dashboard'
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Inicio</span>
        </Link>

        <Link
          href="/contractor/dashboard/explore"
          className={`flex items-center space-x-2 p-2 rounded-md ${
            activePath === '/contractor/dashboard/explore'
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Search className="h-5 w-5" />
          <span>Explorar solicitudes</span>
        </Link>

        <Link
          href="/contractor/dashboard/profile"
          className={`flex items-center space-x-2 p-2 rounded-md ${
            activePath === '/contractor/dashboard/profile'
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <User className="h-5 w-5" />
          <span>Mi perfil</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 text-gray-700"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </div>
  )
}
