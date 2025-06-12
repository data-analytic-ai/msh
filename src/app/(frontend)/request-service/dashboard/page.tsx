/**
 * ClientDashboard
 *
 * Enhanced main dashboard for authenticated clients with improved UI/UX.
 * Features real-time updates, activity tracking, and better navigation.
 *
 * @returns {JSX.Element} Client dashboard interface
 */
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import NavigationGuard from '@/components/NavigationGuard'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'
import { ArrowLeft, Home, Plus, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'

// Custom Components
import useDashboardData from '@/hooks/useDashboardData'
import DashboardStatsGrid from '@/components/dashboard/DashboardStatsGrid'
import RecentActivityPanel from '@/components/dashboard/RecentActivityPanel'
import ServiceRequestsList from '@/components/dashboard/ServiceRequestsList'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function ClientDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // Use custom hook for data management
  const {
    requests,
    stats,
    recentActivity,
    isLoading: isPageLoading,
    isRefreshing,
    error: accessError,
    refreshData,
    markActivityAsRead,
  } = useDashboardData()

  // Not authenticated state - show login prompt instead of redirecting
  if (!authLoading && !isPageLoading && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Inicio
              </Link>
              <h1 className="text-xl font-bold text-foreground">Dashboard de Cliente</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/request-service">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Solicitud
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Login prompt */}
          <div className="bg-background border border-blue-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
              Accede a tu Dashboard Personal
            </h2>
            <p className="text-blue-600 mb-4">
              Inicia sesión para ver tus solicitudes de servicio y cotizaciones en tiempo real.
            </p>
            <div className="flex gap-4 justify-center text-foreground dark:text-white">
              <Link href="/login">
                <Button>Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Crear Cuenta</Button>
              </Link>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center bg-background border border-blue-200 rounded-lg p-6 text-foreground dark:text-white">
            <h3 className="text-lg font-semibold mb-4">¿Necesitas un servicio ahora?</h3>
            <Link href="/request-service">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Solicitar Servicio
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Puedes crear una solicitud sin necesidad de registrarte
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Loading state
  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Access denied - wrong role
  if (accessError) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-card">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
            <h1 className="ml-4 text-lg font-semibold">Dashboard de Cliente</h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="max-w-md mx-auto text-center space-y-6 mt-12">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground">{accessError}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
              {user?.role === 'contractor' && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/contractor/dashboard')}
                  className="w-full"
                >
                  Dashboard de Contratista
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <NavigationGuard requiredRole="client">
      <div className="min-h-screen bg-background">
        {/* Enhanced Header with Real-time Updates */}
        <header className="sticky top-0 z-10 border-b bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Inicio
              </Link>
              <h1 className="text-xl font-bold text-foreground dark:text-white">Mi Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications Bell */}
              <NotificationBell />

              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="gap-2"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Actualizar
              </Button>
              <Link href="/request-service">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Solicitud
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Welcome section with activity indicator */}
          <div className="bg-background border border-blue-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                  ¡Bienvenido/a, {user?.firstName || 'Cliente'}!
                </h2>
                <p className="text-blue-600">
                  Dashboard personal con actualizaciones en tiempo real de tus solicitudes y
                  cotizaciones.
                </p>
              </div>
              {recentActivity.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Actualizaciones disponibles
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Statistics Section */}
          <DashboardStatsGrid stats={stats} isRefreshing={isRefreshing} />

          {/* Two-column layout for Activity and Requests */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Activity Panel - Takes up 1 column */}
            <div className="xl:col-span-1">
              <RecentActivityPanel activities={recentActivity} onMarkAsRead={markActivityAsRead} />
            </div>

            {/* Service Requests List - Takes up 2 columns */}
            <div className="xl:col-span-2">
              <ServiceRequestsList
                requests={requests}
                isLoading={isPageLoading}
                showFilters={true}
                maxItems={6}
              />
            </div>
          </div>
        </main>
      </div>
    </NavigationGuard>
  )
}
