'use client'

/**
 * ContractorSidebar Component
 *
 * Responsive sidebar navigation component for contractor dashboard pages.
 * Shows desktop sidebar and mobile drawer menu.
 * Mobile menu state is controlled by parent component.
 *
 * @param {Object} props - Component props
 * @param {string} props.activePath - Current active path to highlight
 * @param {boolean} props.isMobileMenuOpen - Mobile menu open state
 * @param {function} props.onMobileMenuClose - Function to close mobile menu
 * @returns {JSX.Element} Responsive sidebar for contractor pages
 */
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wrench, Home, Search, User, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContractorSidebarProps {
  activePath: string
  isMobileMenuOpen: boolean
  onMobileMenuClose: () => void
}

export const ContractorSidebar: React.FC<ContractorSidebarProps> = ({
  activePath,
  isMobileMenuOpen,
  onMobileMenuClose,
}) => {
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

  const navigationItems = [
    {
      href: '/contractor/dashboard',
      icon: Home,
      label: 'Inicio',
      isActive: activePath === '/contractor/dashboard',
    },
    {
      href: '/contractor/dashboard/explore',
      icon: Search,
      label: 'Explorar solicitudes',
      isActive: activePath === '/contractor/dashboard/explore',
    },
    {
      href: '/contractor/dashboard/profile',
      icon: User,
      label: 'Mi perfil',
      isActive: activePath === '/contractor/dashboard/profile',
    },
  ]

  // Navigation Link Component
  const NavLink: React.FC<{
    href: string
    icon: React.ElementType
    label: string
    isActive: boolean
    onClick?: () => void
  }> = ({ href, icon: Icon, label, isActive, onClick }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-medium'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-background/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-r border-border p-4 hidden md:block text-foreground dark:text-foreground">
        <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-border">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-xl text-foreground dark:text-white">Portal Contratista</h1>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
            />
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileMenuClose} />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-background dark:bg-background shadow-xl border-r border-border">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-6 w-6 text-primary" />
                  <h1 className="font-bold text-lg text-foreground dark:text-white">
                    Portal Contratista
                  </h1>
                </div>
                <Button variant="ghost" size="icon" onClick={onMobileMenuClose}>
                  <X className="h-4 w-4 text-foreground dark:text-white" />
                  <span className="sr-only">Cerrar menú</span>
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={item.isActive}
                    onClick={onMobileMenuClose}
                  />
                ))}

                <button
                  onClick={() => {
                    handleLogout()
                    onMobileMenuClose()
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span>Cerrar sesión</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
