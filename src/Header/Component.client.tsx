'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Menu, X } from 'lucide-react'

/**
 * HeaderClient - Main header component with theme support
 *
 * Responsive header component with mobile menu and theme switching.
 * Adapts to different themes based on page context.
 *
 * @param {Header} data - Header configuration data from CMS
 * @returns {JSX.Element} - The rendered header component
 */
interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className="w-full relative z-30 transition-all duration-300 bg-background dark:bg-background-dark px-3"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container mx-auto py-2 md:py-4 lg:py-6 flex justify-between items-center">
        <Link href="/" className="z-20 relative">
          <Logo loading="eager" priority="high" className="w-auto" />
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden z-20 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X className="text-foreground h-6 w-6" />
          ) : (
            <Menu className="text-foreground h-6 w-6" />
          )}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:block">
          <HeaderNav data={data} />
        </div>

        {/* Mobile navigation overlay */}
        <div
          className={`fixed inset-0 bg-background text-foreground md:hidden transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          } flex flex-col items-center justify-center`}
        >
          <div className="p-8">
            <HeaderNav data={data} isMobile={true} />
          </div>
        </div>
      </div>
    </header>
  )
}
