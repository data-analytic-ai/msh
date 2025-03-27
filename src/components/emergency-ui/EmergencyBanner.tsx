'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmergencyBannerProps {
  text?: string
  buttonText?: string
  buttonLink?: string
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  text = 'Emergency? Get immediate help from verified professionals',
  buttonText = '24/7 Emergency Services',
  buttonLink = '/emergency',
}) => {
  return (
    <div className="w-full bg-destructive text-destructive-foreground py-3 px-4">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm sm:text-base font-medium">{text}</p>
        </div>
        <Link href={buttonLink}>
          <Button
            variant="outline"
            className="bg-white text-destructive hover:bg-white/90 border-none text-sm sm:text-base whitespace-nowrap"
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  )
}
