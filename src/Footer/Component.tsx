import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border py-8 md:py-12 bg-card dark:bg-card text-foreground dark:text-foreground">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-4">
          <Link className="flex items-center" href="/">
            <Logo className="max-w-[200px]" />
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Connecting you with trusted professionals contractors throughout the US.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  className="text-foreground hover:text-primary transition-colors text-sm font-medium"
                  key={i}
                  {...link}
                />
              )
            })}
          </nav>
          <ThemeSelector />
        </div>

        <div className="mt-8 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} For Devs (LLC). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
