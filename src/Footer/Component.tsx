import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

/**
 * Footer - Main application footer component
 *
 * Displays the site logo, navigation links, theme selector, and copyright information.
 * Adapts layout based on screen size for optimal viewing experience.
 *
 * @returns {JSX.Element} - The rendered footer component
 */
export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto w-full border-t border-border py-6 md:py-8 lg:py-12 bg-card dark:bg-card text-foreground dark:text-foreground relative z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="flex flex-col gap-4">
            <Link className="flex items-center" href="/">
              <Logo className="max-w-[180px]" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connecting you with trusted professionals contractors throughout the US.
            </p>
            <Link href="/contractor" className="text-sm hover:text-primary transition-colors">
              Are you a contractor?
            </Link>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium">Quick Links</h3>
            <nav className="grid grid-cols-2 sm:grid-cols-1 gap-2">
              {navItems.map(({ link }, i) => {
                return (
                  <CMSLink
                    className="text-foreground hover:text-primary transition-colors text-sm"
                    key={i}
                    {...link}
                  />
                )
              })}
            </nav>
          </div>

          {/* Theme and copyright */}
          <div className="flex flex-col gap-4 w-1/2">
            <div className="flex items-center gap-2">
              <ThemeSelector />
            </div>
            <p className="text-xs text-muted-foreground mt-auto pt-4">
              © {new Date().getFullYear()} For Devs (LLC). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
