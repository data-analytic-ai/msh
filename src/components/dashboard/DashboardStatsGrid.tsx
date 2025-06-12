/**
 * DashboardStatsGrid - Enhanced statistics display for client dashboard
 *
 * Shows comprehensive statistics about service requests, quotes, and activity
 * with improved visual design and interactive elements.
 */
'use client'

import React from 'react'
import Link from 'next/link'
import {
  Wrench,
  CheckCircle,
  DollarSign,
  MessageSquare,
  Clock,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardStats } from '@/hooks/useDashboardData'

interface DashboardStatsGridProps {
  stats: DashboardStats
  isRefreshing: boolean
  className?: string
}

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: React.ElementType
  color: string
  href?: string
  badge?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

/**
 * StatCard - Individual statistic card component
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  href,
  badge,
}) => {
  const CardWrapper = href ? Link : 'div'
  const cardProps = href ? { href } : {}

  return (
    <CardWrapper {...cardProps}>
      <Card className={`${href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            {badge && (
              <Badge variant={badge.variant} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{value}</div>
            {href && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </CardWrapper>
  )
}

/**
 * DashboardStatsGrid - Main statistics grid component
 *
 * @param stats - Dashboard statistics data
 * @param isRefreshing - Whether data is currently refreshing
 * @param className - Additional CSS classes
 * @returns Statistics grid component
 */
export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  stats,
  isRefreshing,
  className = '',
}) => {
  const statCards: StatCardProps[] = [
    {
      title: 'Total Solicitudes',
      value: stats.totalRequests,
      subtitle: `${stats.pendingRequests} pendientes`,
      icon: Wrench,
      color: 'text-blue-500',
      href: '/request-service/dashboard#requests',
      badge:
        stats.pendingRequests > 0
          ? {
              text: 'Activo',
              variant: 'default',
            }
          : undefined,
    },
    {
      title: 'Servicios Completados',
      value: stats.completedRequests,
      subtitle: 'Trabajos finalizados',
      icon: CheckCircle,
      color: 'text-green-500',
      href: '/request-service/dashboard#completed',
    },
    {
      title: 'Cotizaciones Recibidas',
      value: stats.totalQuotes,
      subtitle: `${stats.pendingQuotes} por revisar`,
      icon: DollarSign,
      color: 'text-yellow-500',
      href: '/request-service/dashboard#quotes',
      badge:
        stats.pendingQuotes > 0
          ? {
              text: `${stats.pendingQuotes} nuevas`,
              variant: 'outline',
            }
          : undefined,
    },
    {
      title: 'Cotizaciones Aceptadas',
      value: stats.acceptedQuotes,
      subtitle: 'Confirmadas y en proceso',
      icon: MessageSquare,
      color: 'text-purple-500',
    },
  ]

  // Additional metric cards for more detailed insights
  const additionalMetrics = [
    {
      title: 'Actividad Reciente',
      value: stats.recentActivity,
      subtitle: 'Últimas 24 horas',
      icon: Activity,
      color: 'text-orange-500',
      badge:
        stats.recentActivity > 0
          ? {
              text: 'Nuevo',
              variant: 'default' as const,
            }
          : undefined,
    },
    {
      title: 'Promedio de Cotizaciones',
      value:
        stats.totalRequests > 0
          ? Math.round((stats.totalQuotes / stats.totalRequests) * 10) / 10
          : 0,
      subtitle: 'Por solicitud',
      icon: TrendingUp,
      color: 'text-indigo-500',
    },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Resumen General</h3>
          {isRefreshing && (
            <Badge variant="outline" className="animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              Actualizando...
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div>
        <h4 className="text-md font-medium text-foreground mb-4">Métricas Adicionales</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {additionalMetrics.map((metric, index) => (
            <StatCard key={`additional-${index}`} {...metric} />
          ))}

          {/* Quick Action Card */}
          <Card className="flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Link href="/request-service">
                <Button className="w-full mb-2">
                  <Wrench className="h-4 w-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                Solicita un nuevo servicio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardStatsGrid
