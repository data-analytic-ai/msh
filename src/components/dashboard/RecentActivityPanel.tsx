/**
 * RecentActivityPanel - Displays recent activity and updates
 *
 * Shows real-time updates for quotes, status changes, and other
 * important activities related to the user's service requests.
 */
'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, DollarSign, CheckCircle, Clock, AlertCircle, ExternalLink, Dot } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RecentActivity } from '@/hooks/useDashboardData'

interface RecentActivityPanelProps {
  activities: RecentActivity[]
  onMarkAsRead: (activityId: string) => void
  className?: string
}

/**
 * RecentActivityPanel - Shows recent activity updates
 *
 * @param activities - Array of recent activities
 * @param onMarkAsRead - Function to mark activity as read
 * @param className - Additional CSS classes
 * @returns Recent activity panel component
 */
export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  activities,
  onMarkAsRead,
  className = '',
}) => {
  // Get icon based on activity type
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'new_quote':
        return <DollarSign className="h-4 w-4 text-blue-500" />
      case 'quote_accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'service_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'status_update':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return 'Hace un momento'
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Hace ${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Hace ${diffDays} días`

    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    })
  }

  const newActivitiesCount = activities.filter((activity) => activity.isNew).length

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            {newActivitiesCount > 0 && (
              <Badge variant="default" className="bg-blue-500 text-white">
                {newActivitiesCount}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>Últimas actualizaciones de tus solicitudes y cotizaciones</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    activity.isNew
                      ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
                      : 'border-border bg-background'
                  }`}
                >
                  {/* Activity Icon */}
                  <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.requestTitle}
                        </p>
                      </div>

                      {/* New indicator */}
                      {activity.isNew && <Dot className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                    </div>

                    {/* Footer with timestamp and action */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </span>

                      <Link href={`/dashboard/${activity.requestId}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            if (activity.isNew) {
                              onMarkAsRead(activity.id)
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {activities.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" className="w-full" size="sm">
              Ver todas las actividades
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivityPanel
