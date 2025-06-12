'use client'

/**
 * ContractorDashboard - Main contractor dashboard page
 *
 * Shows:
 * - Notifications for newly assigned jobs
 * - Available balance and pending payments
 * - History of completed jobs
 * - Payment status (held, released)
 * - Protected lead information (addresses, contact details)
 *
 * @returns {JSX.Element} Contractor dashboard
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import NavigationGuard from '@/components/NavigationGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Star,
  Download,
  Eye,
  Settings,
  LogOut,
  Loader2,
  Lock,
  Mail,
  Menu,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/payment-config'
import { useContractorDashboard } from './hooks/useContractorDashboard'
import { ServiceRequest } from './types/ServiceRequest'
import { useMobileMenu } from './layout'
import { submitBid } from './services/bidService'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function ContractorDashboard() {
  const router = useRouter()
  const { openMobileMenu, toggleDesktopSidebar } = useMobileMenu()
  const {
    contractor,
    sentQuotes,
    completedRequests,
    paymentSummary,
    notifications,
    isLoading,
    error,
    refreshData,
    acceptRequest,
    rejectRequest,
    updateRequestStatus,
  } = useContractorDashboard()

  // Handle accept job
  const handleAcceptJob = async (requestId: string) => {
    try {
      await acceptRequest(requestId)
      console.log('✅ Job accepted:', requestId)
    } catch (error) {
      console.error('Error accepting job:', error)
      // TODO: Show error toast
    }
  }

  // Handle reject job
  const handleRejectJob = async (requestId: string) => {
    try {
      await rejectRequest(requestId)
      console.log('❌ Job rejected:', requestId)
    } catch (error) {
      console.error('Error rejecting job:', error)
      // TODO: Show error toast
    }
  }

  // Handle status update
  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await updateRequestStatus(requestId, status)
      console.log('📋 Status updated:', requestId, status)
    } catch (error) {
      console.error('Error updating status:', error)
      // TODO: Show error toast
    }
  }

  // Handle bid submission (for when contractors need to submit quotes)
  const handleBidSubmit = async (requestId: string, amount: number, description: string) => {
    if (!contractor?.id || !requestId) return false

    console.log('💰 Submitting bid for request:', requestId)
    const success = await submitBid(requestId, contractor.id, amount, description)

    if (success) {
      console.log('✅ Bid submitted successfully')
      // Refresh data to reflect the new bid
      refreshData()
    } else {
      console.log('❌ Failed to submit bid')
    }

    return success
  }

  // Get status badge styling
  const getStatusBadge = (status: ServiceRequest['status']) => {
    const variants = {
      assigned: {
        text: 'Asignado',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      },
      accepted: {
        text: 'Aceptado',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      },
      'in-progress': {
        text: 'En progreso',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      },
      completed: {
        text: 'Completado',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      },
      pending: {
        text: 'Pendiente',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      },
      cancelled: {
        text: 'Cancelado',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      },
    }
    return variants[status] || variants.pending
  }

  // Get service request amount from quotes
  const getRequestAmount = (request: ServiceRequest): number => {
    return request.quotes?.[0]?.amount || 0
  }

  // Function to blur/hide sensitive customer information (lead protection)
  const getBlurredAddress = (address: string): string => {
    const parts = address.split(',')
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]?.trim()}, ${parts[parts.length - 1]?.trim()}`
    }
    return 'Zona disponible con lead premium'
  }

  const getProtectedPhone = (phone: string): string => {
    if (phone.length >= 4) {
      return `***-***-${phone.slice(-4)}`
    }
    return '***-***-****'
  }

  const getProtectedEmail = (email: string): string => {
    const [local, domain] = email.split('@')
    if (local && domain) {
      return `${local.charAt(0)}***@${domain}`
    }
    return '***@***.com'
  }

  // Check if contractor has lead access (mock function - implement actual lead access check)
  const hasLeadAccess = (request: ServiceRequest): boolean => {
    // For now, assume contractors have lead access for accepted/in-progress jobs
    // In production, this should check against a lead access table
    return ['accepted', 'in-progress', 'completed'].includes(request.status)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div>
          <h2 className="text-xl font-semibold mb-2">Error al cargar el dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>Reintentar</Button>
        </div>
      </div>
    )
  }

  if (!contractor) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-xl font-semibold">No se pudo cargar el perfil</h2>
        <Button onClick={refreshData}>Reintentar</Button>
      </div>
    )
  }

  return (
    <NavigationGuard requiredRole="contractor">
      <div className="space-y-6 mx-auto">
        {/* Header */}
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="text-foreground dark:text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido, {contractor?.name}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between bg-background dark:bg-background text-foreground dark:text-white">
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button - Only visible on mobile */}
              <Button variant="outline" size="icon" onClick={openMobileMenu} className="md:hidden">
                <Menu className="w-4 h-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>

              {/* Desktop Sidebar Toggle Button - Only visible on desktop */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDesktopSidebar}
                className="hidden md:flex bg-background dark:bg-background"
                title="Mostrar/Ocultar menú lateral"
              >
                <Menu className="w-4 h-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>

              <span className="hidden md:inline text-sm text-muted-foreground">Menú lateral</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications Bell */}
              <NotificationBell />

              {/* Refresh Button */}
              <Button variant="outline" onClick={refreshData}>
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Summary Cards */}
        {paymentSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Saldo disponible</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {formatCurrency(paymentSummary.availableBalance)}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Pagos retenidos</p>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                      {formatCurrency(paymentSummary.heldPayments)}
                    </p>
                  </div>
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Este mes</p>
                    <p className="text-lg sm:text-2xl font-bold">
                      {formatCurrency(paymentSummary.thisMonthEarnings)}
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total ganado</p>
                    <p className="text-lg sm:text-2xl font-bold">
                      {formatCurrency(paymentSummary.totalEarnings)}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="bids" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="bids" className="relative text-xs sm:text-sm py-2.5 sm:py-2">
              <span className="truncate">Licitaciones enviadas</span>
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs">
                  {notifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm py-2.5 sm:py-2">
              <span className="truncate">Historial de pagos</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2.5 sm:py-2">
              <span className="truncate">Mi perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* Bids Tab - Sent quotes by contractor */}
          <TabsContent value="bids" className="space-y-4">
            {sentQuotes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No has enviado licitaciones aún</p>
                    <Link href="/contractor/dashboard/explore">
                      <Button variant="outline">Explorar solicitudes</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sentQuotes.map((quote) => (
                <Card key={`${quote.requestId}-${quote.submittedAt}`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{quote.requestTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(quote.amount)}</p>
                        <Badge className={getStatusBadge(quote.status as any).color}>
                          {getStatusBadge(quote.status as any).text}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de pagos</CardTitle>
              </CardHeader>
              <CardContent>
                {completedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tienes trabajos completados aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{request.requestTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.customerInfo.firstName} {request.customerInfo.lastName} •{' '}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-green-600">
                            +{formatCurrency(getRequestAmount(request))}
                          </p>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Pagado
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nombre</label>
                    <p className="text-sm text-muted-foreground">{contractor.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground break-words">{contractor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Teléfono</label>
                    <p className="text-sm text-muted-foreground">
                      {contractor.phone || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Calificación</label>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">
                        {(contractor.rating || 0) > 0
                          ? `${contractor.rating} (${contractor.reviewCount || 0} reseñas)`
                          : 'Sin calificaciones aún'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estado</label>
                    <div className="flex items-center gap-2">
                      {contractor.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente verificación</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium">Servicios ofrecidos</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {contractor.services && contractor.services.length > 0 ? (
                      contractor.services.map((service) => (
                        <Badge key={service} variant="outline">
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay servicios configurados</p>
                    )}
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <Link href="/contractor/dashboard/profile">Editar perfil</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NavigationGuard>
  )
}
