/**
 * ClientDashboard
 *
 * Main dashboard for authenticated clients to view and manage their service requests.
 * Displays a comprehensive overview of all user's service requests, quotes received,
 * and general statistics.
 *
 * Features:
 * - List of all user's service requests
 * - Summary of quotes received
 * - Request status overview
 * - Quick actions and navigation
 * - Responsive design for mobile and desktop
 *
 * @returns {JSX.Element} Client dashboard interface
 */
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'
import {
  ArrowLeft,
  Home,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  MapPin,
  Calendar,
  Wrench,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Types
interface ServiceRequest {
  id: string
  requestId: string
  requestTitle: string
  serviceType: string[]
  description: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
  location: {
    formattedAddress: string
  }
  createdAt: string
  quotes?: Array<{
    id?: string
    contractor: string
    amount: number
    description: string
    status: 'pending' | 'accepted' | 'rejected'
    createdAt?: string
  }>
}

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  totalQuotes: number
  pendingQuotes: number
  acceptedQuotes: number
}

export default function ClientDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
  })
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [accessError, setAccessError] = useState<string | null>(null)

  // Fetch user's service requests
  const fetchUserRequests = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/user-requests?email=${encodeURIComponent(userEmail)}`)

      if (!response.ok) {
        throw new Error('Failed to fetch user requests')
      }

      const data = await response.json()
      return data.requests || []
    } catch (error) {
      console.error('Error fetching user requests:', error)
      throw error
    }
  }

  // Calculate dashboard statistics
  const calculateStats = (userRequests: ServiceRequest[]): DashboardStats => {
    const allQuotes = userRequests.flatMap((req) => req.quotes || [])

    return {
      totalRequests: userRequests.length,
      pendingRequests: userRequests.filter((req) => req.status === 'pending').length,
      completedRequests: userRequests.filter((req) => req.status === 'completed').length,
      totalQuotes: allQuotes.length,
      pendingQuotes: allQuotes.filter((quote) => quote.status === 'pending').length,
      acceptedQuotes: allQuotes.filter((quote) => quote.status === 'accepted').length,
    }
  }

  // Load dashboard data
  const loadDashboardData = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsPageLoading(true)
      }

      try {
        if (!user?.email) {
          throw new Error('User email not available')
        }

        const userRequests = await fetchUserRequests(user.email)
        setRequests(userRequests)
        setStats(calculateStats(userRequests))
        setAccessError(null)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setAccessError('Error al cargar los datos del dashboard')
      } finally {
        setIsPageLoading(false)
        setIsRefreshing(false)
      }
    },
    [user],
  )

  // Check authentication and load data
  useEffect(() => {
    if (authLoading) return

    // Allow access but show different content based on authentication
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, showing login prompt')
      setIsPageLoading(false)
      return
    }

    // Check if user has client role (allow admin and superadmin too)
    if (user.role !== 'client' && user.role !== 'admin' && user.role !== 'superadmin') {
      console.log('User is not a client, access denied. Role:', user.role)
      setAccessError(
        'Este dashboard es solo para clientes. Los contratistas deben usar el dashboard de contratistas.',
      )
      setIsPageLoading(false)
      return
    }

    // Load dashboard data for authenticated clients
    loadDashboardData()
  }, [authLoading, isAuthenticated, loadDashboardData, user])

  // Get urgency level styling
  const getUrgencyBadge = (urgencyLevel: string) => {
    const urgencyStyles = {
      low: 'bg-success-light text-success-light-foreground border-success-border',
      medium: 'bg-warning-light text-warning-light-foreground border-warning-border',
      high: 'bg-warning-light text-warning-light-foreground border-warning-border',
      emergency: 'bg-error-light text-error-light-foreground border-error-border',
    }

    const urgencyLabels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      emergency: 'Emergencia',
    }

    return (
      <Badge
        variant="outline"
        className={urgencyStyles[urgencyLevel as keyof typeof urgencyStyles]}
      >
        {urgencyLabels[urgencyLevel as keyof typeof urgencyLabels]}
      </Badge>
    )
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-info-light text-info-light-foreground border-info-border',
      assigned: 'bg-primary/10 text-primary border-primary/20',
      'in-progress': 'bg-warning-light text-warning-light-foreground border-warning-border',
      completed: 'bg-success-light text-success-light-foreground border-success-border',
      cancelled: 'bg-muted text-muted-foreground border-border',
    }

    const statusLabels = {
      pending: 'Pendiente',
      assigned: 'Asignada',
      'in-progress': 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    }

    return (
      <Badge variant="outline" className={statusStyles[status as keyof typeof statusStyles]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

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
          <div className="bg-background border border-info-border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
              Accede a tu Dashboard Personal
            </h2>
            <p className="text-info-light-foreground mb-4">
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

          {/* Features preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-info" />
                  Gestiona Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ve todas tus solicitudes de servicio en un solo lugar y sigue su progreso en
                  tiempo real.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  Recibe Cotizaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Obtén múltiples cotizaciones de contratistas verificados y compara precios
                  fácilmente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Control Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acepta o rechaza cotizaciones, programa servicios y da seguimiento a tus trabajos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to action */}
          <div className="text-center bg-background border border-info-border rounded-lg p-6 text-foreground dark:text-white">
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
              <div className="h-16 w-16 rounded-full bg-error-light flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-error" />
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
            <h1 className="text-xl font-bold text-foreground dark:text-white">Mi Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-foreground dark:text-white">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboardData(true)}
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
        {/* Welcome section */}
        <div className="bg-background border border-info-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
            ¡Bienvenido/a, {user?.firstName || 'Cliente'}!
          </h2>
          <p className="text-info-light-foreground">
            Este es tu dashboard personal donde puedes gestionar tus solicitudes de servicio y
            recibir cotizaciones en tiempo real.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingRequests} pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRequests}</div>
              <p className="text-xs text-muted-foreground">Trabajos finalizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuotes}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingQuotes} pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptedQuotes}</div>
              <p className="text-xs text-muted-foreground">Cotizaciones confirmadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Requests List */}
        <div className="space-y-6 text-foreground dark:text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mis Solicitudes de Servicio</h3>
            {requests.length > 0 && (
              <Badge variant="secondary">
                {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
              </Badge>
            )}
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes solicitudes aún</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comienza creando tu primera solicitud de servicio
                </p>
                <Link href="/request-service">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Solicitud
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((request) => {
                const hasQuotes = request.quotes && request.quotes.length > 0
                const quotesCount = request.quotes?.length || 0
                const pendingQuotes = request.quotes?.filter((q) => q.status === 'pending') || []
                const acceptedQuote = request.quotes?.find((q) => q.status === 'accepted')

                return (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{request.requestTitle}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {request.location.formattedAddress}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgencyLevel)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {request.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench className="h-4 w-4" />
                          {request.serviceType.join(', ')}
                        </div>
                      </div>

                      {hasQuotes && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Cotizaciones Recibidas</span>
                            <Badge variant="outline">
                              {quotesCount} cotización{quotesCount !== 1 ? 'es' : ''}
                            </Badge>
                          </div>

                          {pendingQuotes.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-info mb-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {pendingQuotes.length} cotización
                                {pendingQuotes.length !== 1 ? 'es' : ''} pendiente
                                {pendingQuotes.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          {acceptedQuote && (
                            <div className="flex items-center gap-2 text-sm text-success">
                              <CheckCircle className="h-4 w-4" />
                              <span>
                                Cotización aceptada: ${acceptedQuote.amount.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Link
                        href={`/request-service/dashboard/${request.requestId}`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full gap-2">
                          <Eye className="h-4 w-4" />
                          Ver Detalles
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>Gestiona tus servicios de manera eficiente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/request-service">
                <Button className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Solicitar Nuevo Servicio
                </Button>
              </Link>
              <Link href="/request-service/history">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Clock className="h-4 w-4" />
                  Ver Historial Completo
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Soporte
              </CardTitle>
              <CardDescription>¿Necesitas ayuda? Estamos aquí para ti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4" />
                Contactar Soporte
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <AlertTriangle className="h-4 w-4" />
                Reportar Problema
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
