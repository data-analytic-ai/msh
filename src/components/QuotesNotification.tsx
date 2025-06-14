/**
 * QuotesNotification - Reusable notification component for quotes
 *
 * Displays notifications when new quotes are received with:
 * - Attractive visual design with animations
 * - Clear call-to-action buttons
 * - Dismissible functionality
 * - Consistent styling across the app
 *
 * @param {boolean} show - Whether to show the notification
 * @param {number} quotesCount - Number of new quotes
 * @param {string} requestId - ID of the service request
 * @param {function} onDismiss - Function to call when dismissing notification
 * @returns {JSX.Element} - The notification component
 */

'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'

interface QuotesNotificationProps {
  show: boolean
  quotesCount: number
  requestId: string
  onDismiss: () => void
  variant?: 'default' | 'compact'
}

export const QuotesNotification: React.FC<QuotesNotificationProps> = ({
  show,
  quotesCount,
  requestId,
  onDismiss,
  variant = 'default',
}) => {
  if (!show) return null

  const isPlural = quotesCount > 1
  const notificationText = isPlural
    ? `¡${quotesCount} nuevas cotizaciones recibidas!`
    : '¡Nueva cotización recibida!'

  const descriptionText = isPlural
    ? 'Varios contratistas han enviado cotizaciones para tu solicitud.'
    : 'Un contratista ha enviado una cotización para tu solicitud.'

  if (variant === 'compact') {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-2">
        <Card className="border-green-500 bg-green-50 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-800 text-sm truncate">{notificationText}</p>
                <p className="text-xs text-green-600 truncate">{descriptionText}</p>
              </div>
              <div className="flex gap-1">
                <Link href={`/quotes/${requestId}`}>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-2">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="border-green-500 bg-green-50 animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-green-800">{notificationText}</h4>
              <Badge className="bg-green-600 text-white">{quotesCount}</Badge>
            </div>
            <p className="text-sm text-green-600">{descriptionText}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/quotes/${requestId}`}>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuotesNotification
