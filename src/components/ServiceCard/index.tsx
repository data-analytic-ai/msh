'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import { Media as MediaType } from '@/payload-types'
import Link from 'next/link'

/**
 * ServiceCard - Card component for displaying service information
 *
 * Displays service information in different layouts: grid, list, or cards.
 * Handles selection state and navigation to service detail pages.
 *
 * @param {string} icon - Emoji icon representing the service
 * @param {string} name - Display name of the service
 * @param {string} type - Service type identifier
 * @param {string} description - Optional description of the service
 * @param {MediaType} image - Optional image for card layout
 * @param {boolean} isSelected - Whether the service is currently selected
 * @param {boolean} enableHover - Whether to enable hover effects
 * @param {'grid' | 'list' | 'cards'} layout - Card layout style
 * @param {Function} onClick - Click handler function
 * @param {boolean} useServiceLinks - Whether to use links to service pages
 * @returns {JSX.Element} - The rendered service card
 */
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
      <div className="rounded-full bg-secondary/50 p-2 sm:p-3 text-xl sm:text-2xl md:text-3xl">
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-medium text-center">{name}</span>
      {description && <span className="text-xs text-center hidden sm:block">{description}</span>}
    </>
  )

  const renderCard = () => {
    // Simple grid layout (default, used in UrgentFixHero)
    if (layout === 'grid') {
      const card = (
        <div
          className={`flex flex-col items-center mx-auto gap-1 sm:gap-4 rounded-lg border p-2 xs:p-3 sm:p-3 md:p-4 transition-all duration-300 cursor-pointer w-11/12 h-full ${
            isSelected
              ? 'bg-neutral-700 text-accent-foreground shadow-lg scale-105 border-primary'
              : 'bg-card text-card-foreground hover:border-primary/50 ' +
                (enableHover ? 'hover:scale-105 hover:shadow-md hover:bg-secondary/70' : '')
          }`}
          onClick={handleClick}
        >
          {cardContent}
        </div>
      )

      if (useServiceLinks) {
        return (
          <Link href={`/services/${type}`} className="block w-full h-full">
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
          className={`overflow-hidden transition-all duration-300 cursor-pointer w-full h-full mx-auto ${
            enableHover
              ? 'hover:shadow-lg hover:scale-105 hover:border-primary/50 hover:bg-secondary/70'
              : ''
          } ${isSelected ? 'ring-2 ring-accent' : ''}`}
          onClick={handleClick}
        >
          {image && (
            <div className="h-32 sm:h-40 w-full">
              <Media resource={image} />
            </div>
          )}
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <span className="text-xl sm:text-2xl md:text-3xl">{icon}</span>
              <h3 className="font-semibold text-sm sm:text-base md:text-lg">{name}</h3>
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                {description}
              </p>
            )}
          </CardContent>
        </Card>
      )

      if (useServiceLinks) {
        return (
          <Link href={`/services/${type}`} className="block h-full">
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
          className={`flex items-center p-2 sm:p-3 md:p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'bg-accent/10 border-accent'
              : 'bg-card border-border hover:bg-muted/50 ' +
                (enableHover ? 'hover:border-accent/50' : '')
          }`}
          onClick={handleClick}
        >
          <div className="flex-shrink-0 text-xl sm:text-2xl md:text-3xl mr-2 sm:mr-3 md:mr-4">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate">{name}</h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <div className="ml-2 flex-shrink-0">
            {useServiceLinks ? (
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                <Link href={`/services/${type}`}>View</Link>
              </Button>
            ) : (
              <Button
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Select
              </Button>
            )}
          </div>
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
        className="flex flex-col items-center gap-1 sm:gap-2 rounded-lg border p-2 sm:p-3 md:p-4 transition-colors hover:bg-muted hover:border-accent/50 cursor-pointer w-full h-full"
        onClick={handleClick}
      >
        {cardContent}
      </div>
    )

    if (useServiceLinks) {
      return (
        <Link href={`/services/${type}`} className="block w-full h-full">
          {fallbackCard}
        </Link>
      )
    }

    return fallbackCard
  }

  return renderCard()
}

export default ServiceCard
