/**
 * QuotesInbox - Real-time quotes display for customers
 *
 * Shows incoming contractor quotes in real-time with ability to:
 * - View quote details
 * - Accept/reject quotes
 * - Communicate with contractors
 * - Track quote status
 *
 * @param {string} requestId - ID of the service request
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {JSX.Element} - The rendered quotes inbox component
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Check,
  X,
  AlertCircle,
  User,
  DollarSign,
  Calendar,
  ExternalLink,
  Bell,
} from 'lucide-react'
import Link from 'next/link'

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

interface QuotesInboxProps {
  requestId: string | null
  isAuthenticated: boolean
}

export const QuotesInbox: React.FC<QuotesInboxProps> = ({ requestId, isAuthenticated }) => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNewQuotes, setHasNewQuotes] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showNotification, setShowNotification] = useState(false)

  // Timer para contar tiempo transcurrido desde la solicitud
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(timer)
  }, [])

  // Función para obtener cotizaciones
  const fetchQuotes = useCallback(async () => {
    if (!requestId || !isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      console.log(`🔍 Fetching quotes for request ID: ${requestId}`)
      const response = await fetch(`/api/request-details?id=${requestId}`)

      console.log(`📡 Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Service request data received:', data)

      const newQuotes = data.quotes || []
      console.log(`📝 Found ${newQuotes.length} quotes`)

      // Verificar si hay nuevas cotizaciones
      if (newQuotes.length > quotes.length) {
        setHasNewQuotes(true)
        setShowNotification(true)
        // Limpiar la notificación después de 10 segundos
        setTimeout(() => {
          setHasNewQuotes(false)
          setShowNotification(false)
        }, 10000)
      }

      setQuotes(newQuotes)
    } catch (err: any) {
      console.error('❌ Error al obtener cotizaciones:', err)

      // Provide more specific error messages based on the error type
      let errorMessage = 'Error al cargar cotizaciones'

      if (err.message?.includes('Service request not found')) {
        errorMessage = 'La solicitud de servicio no fue encontrada'
      } else if (err.message?.includes('HTTP 404')) {
        errorMessage = 'La solicitud de servicio no fue encontrada'
      } else if (err.message?.includes('HTTP 500')) {
        errorMessage = 'Error interno del servidor. Por favor intenta nuevamente.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [requestId, isAuthenticated, quotes.length])

  // Polling automático cada 30 segundos para nuevas cotizaciones
  useEffect(() => {
    if (!requestId || !isAuthenticated) return

    // Carga inicial
    fetchQuotes()

    // Polling cada 30 segundos
    const interval = setInterval(fetchQuotes, 30000)

    return () => clearInterval(interval)
  }, [requestId, isAuthenticated, fetchQuotes])

  // Función para aceptar/rechazar cotización
  const handleQuoteAction = async (quoteIndex: number, action: 'accept' | 'reject') => {
    if (!requestId) return

    try {
      const response = await fetch(`/api/quotes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          quoteIndex,
          status: action === 'accept' ? 'accepted' : 'rejected',
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al ${action === 'accept' ? 'aceptar' : 'rechazar'} cotización`)
      }

      const updatedRequest = await response.json()

      // Update quotes with the response from the API
      setQuotes(updatedRequest.quotes || [])
    } catch (err: any) {
      console.error('Error al actualizar cotización:', err)
      setError(err.message || 'Error al actualizar cotización')
    }
  }

  // Formatear tiempo transcurrido
  const formatTimeElapsed = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Cuenta requerida para ver cotizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Para recibir cotizaciones de contratistas, necesitas completar la creación de tu cuenta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notification for new quotes */}
      {showNotification && hasNewQuotes && (
        <Card className="border-green-500 bg-green-50 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800">¡Nueva cotización recibida!</h4>
                <p className="text-sm text-green-600">
                  Un contratista ha enviado una cotización para tu solicitud.
                </p>
              </div>
              <Link href={`/request-service/quotes/${requestId}`}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Todas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header con estado de cotizaciones */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Cotizaciones de Contratistas
              {hasNewQuotes && (
                <Badge variant="default" className="animate-pulse">
                  Nueva!
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTimeElapsed(timeElapsed)} transcurridos
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Tu solicitud está siendo revisada</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Los contratistas cercanos están evaluando tu solicitud. <br />
                    Normalmente recibimos las primeras cotizaciones en menos de 2 horas.
                  </p>
                  {timeElapsed > 1440 && ( // 24 horas = 1440 minutos
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm mb-2">Han pasado más de 24 horas sin cotizaciones.</p>
                      <Button size="sm" variant="outline">
                        Buscar contratistas manualmente
                      </Button>
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={() => fetchQuotes()}>
                  Actualizar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {quotes.length} cotización{quotes.length > 1 ? 'es' : ''} recibida
                  {quotes.length > 1 ? 's' : ''}
                </p>
                <Link href={`/request-service/quotes/${requestId}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Todas las Cotizaciones
                  </Button>
                </Link>
              </div>

              {/* Mostrar resumen de las primeras 2 cotizaciones */}
              {quotes.slice(0, 2).map((quote, index) => (
                <Card
                  key={quote.id}
                  className={`transition-all ${
                    quote.status === 'accepted'
                      ? 'border-green-500 bg-green-50'
                      : quote.status === 'rejected'
                        ? 'border-gray-300 opacity-60'
                        : 'border-border hover:border-primary'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header del contratista */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {quote.contractor.profileImage?.url ? (
                              <img
                                src={quote.contractor.profileImage.url}
                                alt={quote.contractor.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{quote.contractor.name}</h4>
                              {quote.contractor.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                {quote.contractor.rating} ({quote.contractor.reviewCount})
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-green-600">${quote.amount}</span>
                          {quote.status === 'pending' && <Badge variant="outline">Pendiente</Badge>}
                        </div>
                      </div>

                      <Separator />

                      {/* Descripción resumida */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {quote.description}
                      </p>

                      {/* Acciones rápidas */}
                      {quote.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleQuoteAction(index, 'accept')}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Aceptar
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
                          <Button size="sm" variant="ghost" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Preguntar
                          </Button>
                        </div>
                      )}

                      {/* Información para cotización aceptada */}
                      {quote.status === 'accepted' && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">
                            ¡Cotización aceptada!
                          </p>
                          <p className="text-xs text-green-600">
                            El contratista será notificado y se pondrá en contacto contigo.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Mostrar indicador si hay más cotizaciones */}
              {quotes.length > 2 && (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      +{quotes.length - 2} cotización{quotes.length - 2 > 1 ? 'es' : ''} más
                    </p>
                    <Link href={`/request-service/quotes/${requestId}`}>
                      <Button size="sm" variant="outline">
                        Ver Todas las Cotizaciones
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default QuotesInbox
