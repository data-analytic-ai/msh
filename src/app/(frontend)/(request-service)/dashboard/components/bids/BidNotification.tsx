/**
 * BidNotification - New bid notification component
 *
 * Displays an animated notification when new bids are received.
 * Provides quick action to view all bids and manage them.
 *
 * @param {boolean} show - Whether to show the notification
 * @param {string} requestId - ID of the service request
 * @param {Function} onDismiss - Callback when notification is dismissed
 * @returns {JSX.Element} - The rendered notification component
 */

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, ExternalLink } from 'lucide-react'

interface BidNotificationProps {
  show: boolean
  requestId: string
  onDismiss?: () => void
}

export const BidNotification: React.FC<BidNotificationProps> = ({ show, requestId, onDismiss }) => {
  if (!show) return null

  return (
    <Card className="border-green-500 bg-green-50 animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-800">¡Nueva propuesta recibida!</h4>
            <p className="text-sm text-green-600">
              Un contratista ha enviado una propuesta para tu solicitud.
            </p>
          </div>
          <Link href={`/quotes/${requestId}`}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Gestionar Todas
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
