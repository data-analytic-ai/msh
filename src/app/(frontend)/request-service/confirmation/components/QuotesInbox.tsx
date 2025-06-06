/**
 * QuotesInbox - Real-time quotes display for customers
 *
 * Shows incoming contractor quotes in real-time with ability to:
 * - View quote details in internal navigation
 * - Accept quotes directly from the interface
 * - Contact contractors through different views
 * - Track quote status and updates
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Clock,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  User,
  DollarSign,
  Calendar,
  ExternalLink,
  Bell,
  Eye,
  CheckCircle,
  ArrowLeft,
  ThumbsUp,
  Shield,
  Award,
  Image,
  FileText,
  Phone as PhoneIcon,
  Mail,
  Navigation,
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
    email?: string
    verified: boolean
    specialties?: string[]
    experience?: string
    completedJobs?: number
  }
  amount: number
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
  estimatedDuration?: string
  warranty?: string
  materials?: string[]
  priceBreakdown?: {
    labor: number
    materials: number
    additional: number
  }
  availability?: string
  portfolio?: Array<{ url: string; description: string }>
}

interface QuotesInboxProps {
  requestId: string | null
  isAuthenticated: boolean
}

type ViewMode = 'list' | 'detail'

export const QuotesInbox: React.FC<QuotesInboxProps> = ({ requestId, isAuthenticated }) => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNewQuotes, setHasNewQuotes] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [acceptingQuote, setAcceptingQuote] = useState<string | null>(null)

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

  // Formatear tiempo transcurrido
  const formatTimeElapsed = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  // Función para ver detalles de una cotización
  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote)
    setViewMode('detail')
  }

  // Función para volver a la lista
  const handleBackToList = () => {
    setViewMode('list')
    setSelectedQuote(null)
  }

  // Función para aceptar cotización
  const handleAcceptQuote = async (quoteId: string) => {
    setAcceptingQuote(quoteId)

    try {
      // Aquí iría la lógica para aceptar la cotización
      // Por ahora simularemos la aceptación
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Actualizar el estado local
      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id === quoteId ? { ...quote, status: 'accepted' as const } : quote,
        ),
      )

      // Volver a la vista de lista
      handleBackToList()
    } catch (error) {
      console.error('Error accepting quote:', error)
      // Aquí podrías mostrar una notificación de error
    } finally {
      setAcceptingQuote(null)
    }
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

  // Vista de detalle de cotización
  if (viewMode === 'detail' && selectedQuote) {
    return (
      <div className="space-y-4">
        {/* Header con navegación */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a cotizaciones
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Información del contratista */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedQuote.contractor.profileImage?.url} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold">{selectedQuote.contractor.name}</h2>
                  {selectedQuote.contractor.verified && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {selectedQuote.contractor.rating} ({selectedQuote.contractor.reviewCount}{' '}
                    reseñas)
                  </div>
                  {selectedQuote.contractor.completedJobs && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-blue-500" />
                      {selectedQuote.contractor.completedJobs} trabajos completados
                    </div>
                  )}
                </div>
                {selectedQuote.contractor.specialties && (
                  <div className="flex flex-wrap gap-1">
                    {selectedQuote.contractor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${selectedQuote.amount.toLocaleString()}
                </div>
                <Badge
                  variant={selectedQuote.status === 'accepted' ? 'default' : 'outline'}
                  className={selectedQuote.status === 'accepted' ? 'bg-green-600' : ''}
                >
                  {selectedQuote.status === 'pending' && 'Pendiente'}
                  {selectedQuote.status === 'accepted' && 'Aceptada'}
                  {selectedQuote.status === 'rejected' && 'Rechazada'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Detalles de la cotización */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la cotización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Descripción del trabajo:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedQuote.description}
              </p>
            </div>

            {selectedQuote.priceBreakdown && (
              <div>
                <h4 className="font-medium mb-2">Desglose de precios:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mano de obra:</span>
                    <span>${selectedQuote.priceBreakdown.labor.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materiales:</span>
                    <span>${selectedQuote.priceBreakdown.materials.toLocaleString()}</span>
                  </div>
                  {selectedQuote.priceBreakdown.additional > 0 && (
                    <div className="flex justify-between">
                      <span>Adicionales:</span>
                      <span>${selectedQuote.priceBreakdown.additional.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${selectedQuote.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {selectedQuote.estimatedDuration && (
                <div>
                  <h4 className="font-medium mb-1">Duración estimada:</h4>
                  <p className="text-sm text-muted-foreground">{selectedQuote.estimatedDuration}</p>
                </div>
              )}
              {selectedQuote.availability && (
                <div>
                  <h4 className="font-medium mb-1">Disponibilidad:</h4>
                  <p className="text-sm text-muted-foreground">{selectedQuote.availability}</p>
                </div>
              )}
            </div>

            {selectedQuote.warranty && (
              <div>
                <h4 className="font-medium mb-1">Garantía:</h4>
                <p className="text-sm text-muted-foreground">{selectedQuote.warranty}</p>
              </div>
            )}

            {selectedQuote.materials && selectedQuote.materials.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Materiales incluidos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedQuote.materials.map((material, index) => (
                    <li key={index}>• {material}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedQuote.contractor.phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedQuote.contractor.phone}</span>
                <Button size="sm" variant="outline">
                  Llamar
                </Button>
              </div>
            )}
            {selectedQuote.contractor.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedQuote.contractor.email}</span>
                <Button size="sm" variant="outline">
                  Email
                </Button>
              </div>
            )}
            {selectedQuote.contractor.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedQuote.contractor.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio si existe */}
        {selectedQuote.portfolio && selectedQuote.portfolio.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Trabajos anteriores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedQuote.portfolio.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        {selectedQuote.status === 'pending' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAcceptQuote(selectedQuote.id)}
                  disabled={acceptingQuote === selectedQuote.id}
                >
                  {acceptingQuote === selectedQuote.id ? (
                    'Aceptando...'
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Aceptar cotización
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Negociar precio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Vista principal de lista
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
                  Gestionar Todas
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
              Cotizaciones Recibidas
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
                    Gestionar Cotizaciones
                  </Button>
                </Link>
              </div>

              {/* Lista de cotizaciones */}
              {quotes.map((quote, index) => (
                <Card
                  key={quote.id}
                  className={`transition-all cursor-pointer ${
                    quote.status === 'accepted'
                      ? 'border-green-500 bg-green-50'
                      : quote.status === 'rejected'
                        ? 'border-gray-300 opacity-60'
                        : 'border-border hover:border-primary hover:shadow-md'
                  }`}
                  onClick={() => handleViewDetails(quote)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header del contratista */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={quote.contractor.profileImage?.url} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
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
                          <span className="font-bold text-lg text-green-600">
                            ${quote.amount.toLocaleString()}
                          </span>
                          {quote.status === 'pending' && <Badge variant="outline">Pendiente</Badge>}
                          {quote.status === 'accepted' && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aceptada
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Descripción resumida */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {quote.description}
                      </p>

                      {/* Acciones de aceptación directa */}
                      {quote.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAcceptQuote(quote.id)
                            }}
                            disabled={acceptingQuote === quote.id}
                          >
                            {acceptingQuote === quote.id ? (
                              'Aceptando...'
                            ) : (
                              <>
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Aceptar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(quote)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalles
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
