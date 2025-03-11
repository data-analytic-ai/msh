'use client'

import { Button } from '@/components/ui/button'
import React from 'react'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

export const HeaderNav: React.FC<{ data: Header; isMobile?: boolean }> = ({ data, isMobile = false }) => {
  const navItems = data?.navItems || []

  return (
    <nav className={isMobile ? 'flex flex-col items-center gap-6' : 'flex items-center gap-4'}>
      <div className={`flex ${isMobile ? 'flex-col items-center gap-6' : 'items-center gap-4'}`}>
        {navItems.map(({ link }, i) => {
          return (
            <CMSLink
              className={`font-medium ${isMobile ? 'text-xl' : 'text-sm'} hover:opacity-80 transition-opacity`}
              key={i}
              {...link}
            />
          )
        })}
      </div>
      <div className={isMobile ? 'mt-6' : ''}>
        <ThemeSelector />
      </div>
      <Button
        className={`${isMobile ? 'mt-6 text-base w-full' : 'text-sm'} font-medium`}
        onClick={() => (window.location.href = '/contact')}
        size="sm"
      >
        Get a Quote
      </Button>
    </nav>
  )
} 