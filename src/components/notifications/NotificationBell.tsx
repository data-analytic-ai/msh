/**
 * NotificationBell - Notification bell icon with dropdown
 *
 * Displays unread notification count and provides access to notification list.
 * Integrates with the global notification system.
 *
 * @returns {JSX.Element} Notification bell component
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  Star,
  DollarSign,
  Briefcase,
  Settings,
  X,
} from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import type { InAppNotification, NotificationType } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Icon mapping for notification types
const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  quote_received: Star,
  quote_accepted: Check,
  quote_rejected: X,
  job_assigned: Briefcase,
  job_completed: CheckCheck,
  payment_received: DollarSign,
  payment_released: DollarSign,
  system_update: Settings,
  profile_verified: Check,
}

// Color mapping for notification types
const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  quote_received: 'text-blue-500',
  quote_accepted: 'text-green-500',
  quote_rejected: 'text-red-500',
  job_assigned: 'text-purple-500',
  job_completed: 'text-green-600',
  payment_received: 'text-green-500',
  payment_released: 'text-blue-500',
  system_update: 'text-gray-500',
  profile_verified: 'text-green-500',
}

interface NotificationItemProps {
  notification: InAppNotification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
}) => {
  const IconComponent = NOTIFICATION_ICONS[notification.type]
  const iconColor = NOTIFICATION_COLORS[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    // Execute action if available
    if (notification.action) {
      notification.action.onClick()
    }
  }

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div
      className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-1 ${iconColor}`}>
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>

            {/* Action button */}
            {notification.action && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  notification.action!.onClick()
                }}
              >
                {notification.action.label}
              </Button>
            )}

            {/* Dismiss button */}
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDismiss(notification.id)
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'important'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | NotificationType | null>('all')

  // Filter notifications based on selected filters
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by read status
    if (selectedFilter === 'unread' && notification.read) return false
    if (
      selectedFilter === 'important' &&
      notification.priority !== 'high' &&
      notification.priority !== 'urgent'
    )
      return false

    // Filter by category
    if (selectedCategory !== 'all' && notification.type !== selectedCategory) return false

    return true
  })

  // Group notifications by category
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const key = notification.type
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(notification)
      return groups
    },
    {} as Record<NotificationType, InAppNotification[]>,
  )

  // Get recent notifications (last 10)
  const recentNotifications = filteredNotifications.slice(0, 10)

  // Calculate category counts
  const categoryCounts = notifications.reduce(
    (counts, notification) => {
      const key = notification.type
      counts[key] = (counts[key] || 0) + (notification.read ? 0 : 1)
      return counts
    },
    {} as Record<NotificationType, number>,
  )

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleClearAll = () => {
    clearAll()
    setIsOpen(false)
  }

  const handleNotificationClick = async (notification: InAppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // TODO: Track click event when API is ready
    console.log('Notification clicked:', notification.id)

    // Execute action if available
    if (notification.action) {
      notification.action.onClick()
    }

    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          {unreadCount > 0 ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}

          {/* Unread count badge */}
          {unreadCount > 0 && (
            <Badge
              className={`absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs ${
                unreadCount > 5 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}

          {/* Connection status indicator */}
          <div
            className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full transition-colors ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isConnected ? 'Conectado' : 'Desconectado'}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-[500px] p-0" sideOffset={5}>
        {/* Header with filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-6 px-2"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                  onClick={handleClearAll}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-2">
            {(['all', 'unread', 'important'] as const).map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={selectedFilter === filter ? 'default' : 'ghost'}
                className="text-xs h-6 px-2"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter === 'all' && 'Todas'}
                {filter === 'unread' && `Sin leer (${unreadCount})`}
                {filter === 'important' && 'Importantes'}
              </Button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1 text-xs">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
              className="text-xs h-5 px-2"
              onClick={() => setSelectedCategory('all')}
            >
              Todas
            </Button>
            {Object.entries(categoryCounts).map(([category, count]) => {
              if (count === 0) return null
              return (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? 'secondary' : 'ghost'}
                  className="text-xs h-5 px-2"
                  onClick={() => setSelectedCategory(category as NotificationType)}
                >
                  {category} ({count})
                </Button>
              )
            })}
          </div>

          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
            </p>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-80">
          {recentNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {selectedFilter === 'all'
                  ? 'No hay notificaciones'
                  : selectedFilter === 'unread'
                    ? 'No hay notificaciones sin leer'
                    : 'No hay notificaciones importantes'}
              </p>
            </div>
          ) : (
            <div className="group">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500'
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDismiss={dismissNotification}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 10 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false)
                // Navigate to full notifications page
                // router.push('/notifications')
              }}
            >
              Ver todas las notificaciones ({notifications.length})
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell
