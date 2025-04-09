'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import { Media as MediaType } from '@/payload-types'
import Link from 'next/link'

export interface ServiceCardProps {
  icon: string
  name: string
  type: string
  description?: string
  image?: MediaType
  isSelected?: boolean
  enableHover?: boolean
  layout?: 'grid' | 'list' | 'cards'
  onClick?: () => void
  useServiceLinks?: boolean
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  name,
  type,
  description,
  image,
  isSelected = false,
  enableHover = true,
  layout = 'grid',
  onClick,
  useServiceLinks = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (useServiceLinks) return // No hacer nada si estamos usando links

    // Siempre llamar a onClick si existe
    if (onClick) {
      e.stopPropagation() // Evitar que el evento se propague
      onClick()
    }
  }

  const cardContent = (
    <>
      <div className="rounded-full bg-primary/10 p-3 text-3xl">{icon}</div>
      <span className="text-sm font-medium">{name}</span>
      {description && <span className="text-xs text-center">{description}</span>}
    </>
  )

  const renderCard = () => {
    // Simple grid layout (default, used in UrgentFixHero)
    if (layout === 'grid') {
      const card = (
        <div
          className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all duration-300 cursor-pointer ${
            isSelected
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-card hover:shadow-md ' + (enableHover ? 'hover:scale-105' : '')
          }`}
          onClick={handleClick}
        >
          {cardContent}
        </div>
      )

      if (useServiceLinks) {
        return (
          <Link href={`/services/${type}`} className="block">
            {card}
          </Link>
        )
      }

      return card
    }

    // Card layout with image
    if (layout === 'cards') {
      const card = (
        <Card
          className={`overflow-hidden transition-all duration-300 cursor-pointer ${
            enableHover ? 'hover:shadow-lg hover:scale-105' : ''
          } ${isSelected ? 'ring-2 ring-primary' : ''}`}
          onClick={handleClick}
        >
          {image && (
            <div className="h-40 w-full">
              <Media resource={image} />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{icon}</span>
              <h3 className="font-semibold text-lg">{name}</h3>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardContent>
        </Card>
      )

      if (useServiceLinks) {
        return (
          <Link href={`/services/${type}`} className="block">
            {card}
          </Link>
        )
      }

      return card
    }

    // List layout (horizontal)
    if (layout === 'list') {
      const card = (
        <div
          className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'bg-primary/10 border-primary'
              : 'bg-card border-border hover:bg-muted/50 ' +
                (enableHover ? 'hover:border-primary/50' : '')
          }`}
          onClick={handleClick}
        >
          <div className="flex-shrink-0 text-3xl mr-4">{icon}</div>
          <div className="flex-1">
            <h3 className="font-medium">{name}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {useServiceLinks ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/services/${type}`}>View</Link>
            </Button>
          ) : (
            <Button variant={isSelected ? 'default' : 'outline'} size="sm">
              Select
            </Button>
          )}
        </div>
      )

      if (useServiceLinks && layout !== 'list') {
        return (
          <Link href={`/services/${type}`} className="block">
            {card}
          </Link>
        )
      }

      return card
    }

    // Fallback to simple grid layout if layout is invalid
    const fallbackCard = (
      <div
        className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent cursor-pointer"
        onClick={handleClick}
      >
        {cardContent}
      </div>
    )

    if (useServiceLinks) {
      return (
        <Link href={`/services/${type}`} className="block">
          {fallbackCard}
        </Link>
      )
    }

    return fallbackCard
  }

  return renderCard()
}

export default ServiceCard
