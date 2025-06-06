/**
 * QuotesManagementPage - Manage quotes for a specific service request
 *
 * This page allows users to:
 * - View all quotes received for their service request
 * - Compare quotes side by side
 * - Accept or reject quotes
 * - Contact contractors
 * - Proceed to payment when a quote is accepted
 *
 * @returns {JSX.Element} - The quotes management page
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
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Check,
  X,
  DollarSign,
  Calendar,
  User,
  Clock,
  AlertCircle,
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
    profileImage?: { url: string }
    location?: string
    phone?: string
    verified: boolean
  }
  amount: number
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
  estimatedDuration?: string
  warranty?: string
  materials?: string[]
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
  quotes: Quote[]
}

export default function QuotesManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const requestId = params.requestId as string

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null)

  // Debug logging
  useEffect(() => {
    console.log('🔍 QuotesManagementPage - Debug Info:', {
      requestId,
      isAuthenticated,
      user: user?.email,
      params,
    })
  }, [requestId, isAuthenticated, user, params])

  // Add enhanced debugging for authentication issues
  useEffect(() => {
    const debugAuthentication = async () => {
      console.log('🔧 Enhanced Authentication Debug:')
      console.log('- User object:', user)
      console.log('- isAuthenticated:', isAuthenticated)
      console.log('- isLoading:', isLoading)

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

  // Fetch service request and quotes
  useEffect(() => {
    const fetchServiceRequest = async () => {
      console.log('📡 Starting fetch for requestId:', requestId)

      if (!requestId) {
        console.log('❌ No requestId provided')
        setError('No se proporcionó ID de solicitud')
        setIsLoading(false)
        return
      }

      if (!isAuthenticated) {
        console.log('❌ User not authenticated')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('🔄 Fetching from API...')
        const response = await fetch(`/api/request-details?id=${requestId}`)
        console.log('📡 Response status:', response.status)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('✅ Data received:', data)
        setServiceRequest(data)
      } catch (err: any) {
        console.error('❌ Error fetching service request:', err)
        setError(err.message || 'Error al cargar la información de la solicitud')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServiceRequest()
  }, [requestId, isAuthenticated])

  // Handle quote action (accept/reject)
  const handleQuoteAction = async (quoteIndex: number, action: 'accept' | 'reject') => {
    if (!serviceRequest) return

    try {
      const response = await fetch(`/api/quotes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: serviceRequest.id,
          quoteIndex,
          status: action === 'accept' ? 'accepted' : 'rejected',
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al ${action === 'accept' ? 'aceptar' : 'rechazar'} cotización`)
      }

      const updatedRequest = await response.json()
      setServiceRequest(updatedRequest)

      // If quote was accepted, redirect to payment
      if (action === 'accept') {
        router.push(
          `/request-service/payment?requestId=${serviceRequest.id}&quoteIndex=${quoteIndex}`,
        )
      }
    } catch (err: any) {
      console.error('Error updating quote:', err)
      setError(err.message || 'Error al actualizar cotización')
    }
  }

  // Service type name mappings
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

  const urgencyColors: Record<string, string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    emergency: 'bg-red-500',
  }

  // Early return for debugging
  if (!requestId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error de Parámetros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No se encontró el ID de la solicitud en la URL
            </p>
            <Button onClick={() => router.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Acceso restringido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Necesitas iniciar sesión para ver las cotizaciones.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Debug: RequestId = {requestId}</p>
              <Link href="/login">
                <Button className="w-full">Iniciar Sesión</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando cotizaciones...</p>
          <p className="text-sm text-muted-foreground mt-2">RequestID: {requestId}</p>
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
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">Debug Info:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>RequestID: {requestId}</li>
                <li>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
                <li>User: {user?.email || 'None'}</li>
                <li>Error: {error || 'Unknown'}</li>
              </ul>
            </div>
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
  const acceptedQuote = serviceRequest.quotes?.find((quote) => quote.status === 'accepted')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Cotizaciones Recibidas</h1>
          <div className="ml-auto text-xs text-muted-foreground">ID: {requestId}</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Service Request Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{serviceRequest.requestTitle}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">
                {serviceRequest.serviceType.map((type) => serviceNames[type] || type).join(', ')}
              </Badge>
              <Badge className={urgencyColors[serviceRequest.urgencyLevel]}>
                {serviceRequest.urgencyLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm">{serviceRequest.location.formattedAddress}</p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm">
                Solicitado el {new Date(serviceRequest.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Section */}
        {!hasQuotes ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Esperando cotizaciones</h3>
                  <p className="text-muted-foreground max-w-md">
                    Los contratistas están revisando tu solicitud. Normalmente recibimos las
                    primeras cotizaciones en menos de 2 horas.
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {serviceRequest.quotes.length} Cotización
                {serviceRequest.quotes.length > 1 ? 'es' : ''} Recibida
                {serviceRequest.quotes.length > 1 ? 's' : ''}
              </h2>
              {acceptedQuote && <Badge className="bg-green-500">Cotización Aceptada</Badge>}
            </div>

            {serviceRequest.quotes.map((quote, index) => (
              <Card
                key={quote.id || index}
                className={`transition-all ${
                  quote.status === 'accepted'
                    ? 'border-green-500 bg-green-50'
                    : quote.status === 'rejected'
                      ? 'border-gray-300 opacity-60'
                      : 'border-border hover:border-primary'
                } ${selectedQuote === quote.id ? 'ring-2 ring-primary' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Contractor Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          {quote.contractor.profileImage?.url ? (
                            <img
                              src={quote.contractor.profileImage.url}
                              alt={quote.contractor.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{quote.contractor.name}</h4>
                            {quote.contractor.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verificado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                              {quote.contractor.rating} ({quote.contractor.reviewCount})
                            </div>
                            {quote.contractor.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {quote.contractor.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {quote.status === 'accepted' && (
                          <Badge className="bg-green-500">Aceptada</Badge>
                        )}
                        {quote.status === 'rejected' && (
                          <Badge variant="secondary">Rechazada</Badge>
                        )}
                        {quote.status === 'pending' && <Badge variant="outline">Pendiente</Badge>}
                      </div>
                    </div>

                    <Separator />

                    {/* Quote Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-bold text-2xl text-green-600">${quote.amount}</span>
                        </div>
                        {quote.estimatedDuration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Duración estimada: {quote.estimatedDuration}
                          </div>
                        )}
                        {quote.warranty && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4" />
                            Garantía: {quote.warranty}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">Descripción del trabajo:</p>
                        <p className="text-sm text-muted-foreground">{quote.description}</p>
                      </div>
                    </div>

                    {/* Materials */}
                    {quote.materials && quote.materials.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Materiales incluidos:</p>
                        <div className="flex flex-wrap gap-1">
                          {quote.materials.map((material, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4">
                      {quote.status === 'pending' && !acceptedQuote && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleQuoteAction(index, 'accept')}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Aceptar y Continuar al Pago
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuoteAction(index, 'reject')}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Rechazar
                          </Button>
                        </>
                      )}

                      <Button size="sm" variant="ghost" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Preguntar
                      </Button>

                      {quote.contractor.phone && (
                        <Button size="sm" variant="ghost" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Llamar
                        </Button>
                      )}
                    </div>

                    {/* Accepted Quote Info */}
                    {quote.status === 'accepted' && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          ¡Cotización aceptada!
                        </p>
                        <p className="text-xs text-green-600 mb-3">
                          El contratista ha sido notificado y se pondrá en contacto contigo para
                          coordinar el servicio.
                        </p>
                        <Link
                          href={`/request-service/payment?requestId=${serviceRequest.id}&quoteIndex=${index}`}
                        >
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Proceder al Pago
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
