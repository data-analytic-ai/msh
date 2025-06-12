/**
 * ClientNavigation - Navigation component for authenticated clients
 *
 * Provides easy navigation between client dashboard, new requests,
 * and profile management. Only shows for authenticated clients.
 */
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { Home, Plus, User, FileText, Settings, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ClientNavigationProps {
  className?: string
  compact?: boolean
}

/**
 * ClientNavigation - Shows navigation options for authenticated clients
 *
 * @param className - Additional CSS classes
 * @param compact - Whether to show compact version
 * @returns Navigation component or null if user is not a client
 */
export const ClientNavigation: React.FC<ClientNavigationProps> = ({
  className = '',
  compact = false,
}) => {
  const { isAuthenticated, user } = useAuth()
  const pathname = usePathname()

  // Only show for authenticated clients
  if (!isAuthenticated || !user || user.role !== 'client') {
    return null
  }

  const navigationItems = [
    {
      href: '/request-service/dashboard',
      icon: Home,
      label: 'Mi Dashboard',
      description: 'Ver todas mis solicitudes',
    },
    {
      href: '/request-service',
      icon: Plus,
      label: 'Nueva Solicitud',
      description: 'Solicitar un nuevo servicio',
    },
    {
      href: '/user/profile',
      icon: User,
      label: 'Mi Perfil',
      description: 'Gestionar información personal',
    },
  ]

  const isActive = (href: string) => {
    if (href === '/request-service/dashboard') {
      return pathname === href || pathname.startsWith('/request-service/dashboard/')
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <Button variant={active ? 'default' : 'ghost'} size="sm" className="gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <nav
      className={`bg-background/95 backdrop-blur border border-border rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Navegación del Cliente</h3>
        <Badge variant="secondary" className="text-xs">
          {user.firstName || 'Cliente'}
        </Badge>
      </div>

      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-2 rounded-md transition-colors group ${
                active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
              </div>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default ClientNavigation
