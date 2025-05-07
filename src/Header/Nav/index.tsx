'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType; isMobile?: boolean }> = ({
  data,
  isMobile = false,
}) => {
  const navItems = data?.navItems || []

  return (
    <nav className={`flex gap-3 items-center text-primary ${isMobile ? 'flex-col' : ''}`}>
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="secondary"
            className={isMobile ? 'text-xl mb-2' : ''}
          />
        )
      })}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className={`w-5 text-primary ${isMobile ? 'mt-2' : ''}`} />
      </Link>
    </nav>
  )
}
