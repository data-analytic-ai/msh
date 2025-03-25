'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { Page } from '@/payload-types'

type UrgentHelpCardProps = {
  links?: Page['hero']['links']
}

export const UrgentHelpCard: React.FC<UrgentHelpCardProps> = ({ links }) => {
  return (
    <div className="bg-primary dark:bg-primary/10 text-white rounded-lg p-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <h3 className="text-xl font-semibold">Need urgent help?</h3>
        <p className="text-sm text-white/90">
          We connect you with verified professionals in minutes
        </p>
        {links && links.length > 0 && links[0]?.link ? (
          <div className="flex justify-center">
            <CMSLink {...links[0].link} />
          </div>
        ) : (
          <Button asChild className="bg-white dark:bg-secondary text-primary hover:bg-white/90">
            <Link href="/request-service">Request Service</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default UrgentHelpCard
