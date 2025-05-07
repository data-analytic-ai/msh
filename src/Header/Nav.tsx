'use client'

import { Button } from '@/components/ui/button'
import React from 'react'
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

  const handleLogout = () => {
    logout()
    // Redirect to home page using Next.js useRouter
    router.push('/')
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
            <span className="truncate max-w-[120px]">Hi, {user?.name || 'User'}</span>
          </div>

          <Button
            className={`${isMobile ? 'mt-2 w-full' : ''}`}
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
