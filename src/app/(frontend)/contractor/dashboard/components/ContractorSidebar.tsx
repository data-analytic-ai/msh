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
import { Wrench, Home, Search, User, LogOut, X, Menu, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/AuthProvider'
import { useLayoutDimensions } from '../hooks/useLayoutDimensions'
import styles from './ContractorSidebar.module.css'

interface ContractorSidebarProps {
  activePath: string
  isMobileMenuOpen: boolean
  onMobileMenuClose: () => void
  isDesktopSidebarOpen: boolean
  onDesktopSidebarToggle: () => void
}

export const ContractorSidebar: React.FC<ContractorSidebarProps> = ({
  activePath,
  isMobileMenuOpen,
  onMobileMenuClose,
  isDesktopSidebarOpen,
  onDesktopSidebarToggle,
}) => {
  const router = useRouter()
  const { logout, user } = useAuth()
  const { sidebarTopOffset, sidebarBottomOffset, availableHeight } = useLayoutDimensions()

  const handleLogout = async () => {
    try {
      // Use AuthProvider logout method for consistency
      await logout()
      // Logout handles the full page refresh and redirect
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Fallback: Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/contractor/login'
      }
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
  }> = ({ href, icon: Icon, label, isActive, onClick }) => {
    const isSmallHeight = availableHeight < 500

    return (
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center space-x-3 rounded-lg transition-colors ${
          isSmallHeight ? 'px-2 py-1.5' : 'px-3 py-2.5'
        } ${
          isActive
            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-medium'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        <Icon className={`flex-shrink-0 ${isSmallHeight ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className={isSmallHeight ? 'text-sm' : ''}>{label}</span>
      </Link>
    )
  }

  // Sidebar content
  const SidebarContent = ({ isDesktop = false }: { isDesktop?: boolean }) => {
    const isSmallHeight = isDesktop && availableHeight < 500

    return (
      <div
        className={`${styles.sidebarContainer} ${isSmallHeight ? styles.smallHeight : ''} w-full bg-background dark:bg-background ${isDesktop ? 'border-r border-gray-200 dark:border-gray-800' : ''}`}
      >
        {/* Header */}
        <div
          className={`${styles.sidebarHeader} border-b border-gray-200 dark:border-gray-800 ${isSmallHeight ? '' : 'p-6'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className={`text-primary ${isSmallHeight ? 'h-4 w-4' : 'h-6 w-6'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  className={`font-semibold text-gray-900 dark:text-white ${isSmallHeight ? 'text-sm' : 'text-base'}`}
                >
                  Portal Contratista
                </h2>
                {user && !isSmallHeight && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </div>
            {/* Desktop toggle button */}
            {isDesktop && (
              <Button
                variant="ghost"
                size={isSmallHeight ? 'sm' : 'icon'}
                onClick={onDesktopSidebarToggle}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ChevronLeft className={`${isSmallHeight ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <span className="sr-only">Cerrar sidebar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`${styles.sidebarNav} ${isSmallHeight ? 'space-y-1' : 'p-4 space-y-2'}`}>
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
        </nav>

        {/* Footer - Always at bottom */}
        <div
          className={`${styles.sidebarFooter} border-t border-gray-200 dark:border-gray-800 ${isSmallHeight ? '' : 'p-4'}`}
        >
          <Button
            onClick={handleLogout}
            variant="ghost"
            size={isSmallHeight ? 'sm' : 'default'}
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 ${isSmallHeight ? 'text-sm' : ''}`}
          >
            <LogOut className={`mr-3 ${isSmallHeight ? 'h-4 w-4' : 'h-5 w-5'}`} />
            {isSmallHeight ? 'Salir' : 'Cerrar sesión'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex md:w-64 md:flex-col md:fixed md:z-20 transition-transform duration-300 shadow-lg ${isDesktopSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
        style={{
          top: sidebarTopOffset,
          left: 0,
          bottom: sidebarBottomOffset,
          maxHeight: `${availableHeight}px`,
          overflowY: 'hidden',
        }}
      >
        <SidebarContent isDesktop={true} />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onMobileMenuClose}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div className="relative flex flex-col w-64 bg-background dark:bg-background">
            {/* Close button */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                onClick={onMobileMenuClose}
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Cerrar menú</span>
              </Button>
            </div>

            <SidebarContent isDesktop={false} />
          </div>
        </div>
      )}
    </>
  )
}
