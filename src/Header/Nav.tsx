'use client'

import { Button } from '@/components/ui/button'
import React, { useEffect } from 'react'
import type { Header } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'

/**
 * HeaderNav - Main navigation component for the header
 *
 * Displays navigation items, theme selector, and authentication controls.
 * Adapts display based on mobile or desktop view.
 *
 * @param {Header} data - Header data containing navigation items
 * @param {boolean} isMobile - Whether the navigation is in mobile view
 * @returns {JSX.Element} - The rendered navigation component
 */
export const HeaderNav: React.FC<{ data: Header; isMobile?: boolean }> = ({
  data,
  isMobile = false,
}) => {
  const navItems = data?.navItems || []
  const { isAuthenticated, logout, user } = useAuth()
  const router = useRouter()

  // Debug logging para rastrear cambios de estado
  useEffect(() => {
    console.log('🔍 HeaderNav: Auth state changed:', {
      isAuthenticated,
      user: user ? `${user.email} (${user.role})` : 'No user',
    })
  }, [isAuthenticated, user])

  const handleLogout = async () => {
    try {
      // Call logout method which handles the full page refresh
      await logout()
      // El logout ya maneja la redirección con window.location.href
    } catch (error) {
      console.error('Error during logout:', error)
      // Fallback: Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }

  return (
    <nav
      className={
        isMobile ? 'flex flex-col items-center gap-4 w-full' : 'flex items-center gap-3 md:gap-4'
      }
    >
      {/* Navigation links */}
      <div
        className={`flex ${isMobile ? 'flex-col items-center gap-5 mb-2' : 'items-center gap-3 md:gap-4'}`}
      >
        {navItems.map(({ link }, i) => {
          return (
            <CMSLink
              className={`font-medium ${
                isMobile ? 'text-lg py-1' : 'text-xs sm:text-sm'
              } text-foreground hover:text-primary transition-colors`}
              key={i}
              {...link}
            />
          )
        })}
      </div>

      <div className={isMobile ? 'mt-3 mb-4' : ''}>
        <ThemeSelector />
      </div>

      {isAuthenticated ? (
        <div className={`flex items-center gap-2 ${isMobile ? 'mt-4 flex-col w-full' : 'ml-auto'}`}>
          <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-foreground">
            <User size={isMobile ? 18 : 16} className="text-primary" />
            <span className="truncate max-w-[120px]">
              Hi, {user?.firstName || 'User'} {user?.lastName || ''}
            </span>
          </div>

          <Button
            className={`${isMobile ? 'mt-2 w-full' : ''} dark:text-primary/50 dark:hover:text-primary`}
            onClick={handleLogout}
            size={isMobile ? 'default' : 'xs'}
            variant="outline"
          >
            <LogOut size={isMobile ? 18 : 14} className="mr-1" />
            <span className="text-xs sm:text-sm">Logout</span>
          </Button>
        </div>
      ) : (
        <div className={`flex items-center gap-2 ${isMobile ? 'mt-4 flex-col w-full' : 'ml-auto'}`}>
          <Link href="/login" className={isMobile ? 'w-full' : ''}>
            <Button className="w-full" size={isMobile ? 'default' : 'xs'} variant="outline">
              <span className="text-primary text-xs sm:text-sm">Login</span>
            </Button>
          </Link>

          <Link href="/register" className={isMobile ? 'w-full' : ''}>
            <Button className="w-full" size={isMobile ? 'default' : 'xs'}>
              <span className="text-xs sm:text-sm">Register</span>
            </Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
