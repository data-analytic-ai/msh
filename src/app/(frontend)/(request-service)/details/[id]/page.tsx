/**
 * ServiceRequestDetailsPage - Display details of a specific service request
 *
 * This page shows:
 * - Service request details and status
 * - Location and service type information
 * - Quotes received and their status
 * - Navigation to quotes management page
 * - Customer contact information
 *
 * @returns {JSX.Element} - The service request details page
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Wrench,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'

interface Quote {
  id: string
  contractor: {
    id: string
    name: string
    rating: number
    reviewCount: number
    verified: boolean
  }
  amount: number
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
}

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
  customerName: string
  customerEmail: string
  customerPhone?: string
  quotes: Quote[]
}

export default function ServiceRequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const requestId = params.id as string

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)

  // Service type mappings
  const serviceNames: Record<string, string> = {
    plumbing: 'Plomería',
    electrical: 'Electricidad',
    glass: 'Vidrios',
    hvac: 'HVAC',
    pests: 'Control de Plagas',
    locksmith: 'Cerrajería',
    roofing: 'Techado',
    siding: 'Revestimiento',
    general: 'Reparaciones Generales',
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    assigned: 'bg-blue-500',
    'in-progress': 'bg-indigo-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500',
  }

  const urgencyColors: Record<string, string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    emergency: 'bg-red-500',
  }

  // Add enhanced debugging for authentication issues
  useEffect(() => {
    const debugAuthentication = async () => {
      console.log('🔧 Details Page - Enhanced Authentication Debug:')
      console.log('- User object:', user)
      console.log('- isAuthenticated:', isAuthenticated)
      console.log('- isLoading from auth:', isLoading)

      // Check cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie
        console.log('- Browser cookies:', cookies)
        const payloadToken = cookies.split(';').find((c) => c.trim().startsWith('payload-token='))
        console.log('- Payload token cookie:', payloadToken)
      }

      // Test direct API call
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        console.log('- Direct /api/users/me response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('- Direct /api/users/me data:', data)
        } else {
          console.log('- Direct /api/users/me error:', await response.text())
        }
      } catch (error) {
        console.log('- Direct /api/users/me fetch error:', error)
      }
    }

    debugAuthentication()
  }, [user, isAuthenticated, isLoading])

  // Fetch service request details
  useEffect(() => {
    const fetchServiceRequest = async () => {
      if (!requestId) return

      setIsFetching(true)
      setError(null)

      try {
        const response = await fetch(`/api/request-details?id=${requestId}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setServiceRequest(data)
      } catch (err: any) {
        console.error('Error fetching service request:', err)
        setError(err.message || 'Error al cargar la información de la solicitud')
      } finally {
        setIsFetching(false)
      }
    }

    fetchServiceRequest()
  }, [requestId])

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando detalles de la solicitud...</p>
        </div>
      </div>
    )
  }

  if (error || !serviceRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'No se pudo cargar la información de la solicitud'}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Volver
              </Button>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasQuotes = serviceRequest.quotes && serviceRequest.quotes.length > 0
  const pendingQuotes = serviceRequest.quotes?.filter((q) => q.status === 'pending') || []
  const acceptedQuote = serviceRequest.quotes?.find((q) => q.status === 'accepted')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Detalles de la Solicitud</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Service Request Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{serviceRequest.requestTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {serviceRequest.requestId}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={statusColors[serviceRequest.status]}>
                    {serviceRequest.status.charAt(0).toUpperCase() + serviceRequest.status.slice(1)}
                  </Badge>
                  <Badge className={urgencyColors[serviceRequest.urgencyLevel]}>
                    {serviceRequest.urgencyLevel.charAt(0).toUpperCase() +
                      serviceRequest.urgencyLevel.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Tipo de Servicio</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceRequest.serviceType
                          .map((type) => serviceNames[type] || type)
                          .join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Ubicación</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceRequest.location.formattedAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Solicitud</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(serviceRequest.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Cliente</p>
                      <p className="text-sm text-muted-foreground">{serviceRequest.customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceRequest.customerEmail}
                      </p>
                    </div>
                  </div>

                  {serviceRequest.customerPhone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Teléfono</p>
                        <p className="text-sm text-muted-foreground">
                          {serviceRequest.customerPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {serviceRequest.description && (
                <div>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium mb-2">Descripción del Problema</p>
                    <p className="text-sm text-muted-foreground">{serviceRequest.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Cotizaciones Recibidas
                </CardTitle>
                {hasQuotes && (
                  <Link href={`/quotes/${serviceRequest.id}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Gestionar Cotizaciones
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!hasQuotes ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Esperando cotizaciones</h4>
                      <p className="text-sm text-muted-foreground">
                        Los contratistas están revisando tu solicitud
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {serviceRequest.quotes.length} cotización
                      {serviceRequest.quotes.length > 1 ? 'es' : ''} recibida
                      {serviceRequest.quotes.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2">
                      {pendingQuotes.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {pendingQuotes.length} pendiente{pendingQuotes.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {acceptedQuote && (
                        <Badge className="bg-green-500 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aceptada
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick quotes overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviceRequest.quotes.slice(0, 4).map((quote, index) => (
                      <Card key={quote.id || index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{quote.contractor.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                {quote.contractor.rating} ({quote.contractor.reviewCount})
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">${quote.amount}</p>
                              <Badge
                                variant={
                                  quote.status === 'pending'
                                    ? 'outline'
                                    : quote.status === 'accepted'
                                      ? 'default'
                                      : 'secondary'
                                }
                                className="text-xs"
                              >
                                {quote.status === 'pending'
                                  ? 'Pendiente'
                                  : quote.status === 'accepted'
                                    ? 'Aceptada'
                                    : 'Rechazada'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {quote.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {serviceRequest.quotes.length > 4 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        +{serviceRequest.quotes.length - 4} cotización
                        {serviceRequest.quotes.length - 4 > 1 ? 'es' : ''} más
                      </p>
                    </div>
                  )}

                  {hasQuotes && (
                    <div className="flex justify-center pt-4">
                      <Link href={`/quotes/${serviceRequest.id}`}>
                        <Button>
                          {pendingQuotes.length > 0
                            ? 'Ver y Gestionar Cotizaciones'
                            : 'Ver Todas las Cotizaciones'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          {isAuthenticated && user && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {pendingQuotes.length > 0 && (
                    <Link href={`/quotes/${serviceRequest.id}`}>
                      <Button>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Revisar Cotizaciones ({pendingQuotes.length})
                      </Button>
                    </Link>
                  )}

                  {acceptedQuote && (
                    <Link href={`/payment?requestId=${serviceRequest.id}`}>
                      <Button variant="outline">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Proceder al Pago
                      </Button>
                    </Link>
                  )}

                  <Button variant="outline" onClick={() => window.location.reload()}>
                    <Clock className="h-4 w-4 mr-2" />
                    Actualizar Estado
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
