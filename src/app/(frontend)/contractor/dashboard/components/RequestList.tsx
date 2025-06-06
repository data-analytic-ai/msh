'use client'

/**
 * RequestList Component
 *
 * Displays a list of service requests for contractors to bid on.
 * Includes loading, error, and empty states.
 *
 * Features:
 * - Shows basic request information (description, photos, urgency)
 * - Displays bid count per contractor
 * - Implements premium lead system (contact info hidden behind paywall)
 * - Blur/hide sensitive customer information
 *
 * @returns {JSX.Element} List of service requests
 */
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, MapPin, DollarSign, Lock, Eye, EyeOff, MessageSquare } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type ServiceRequest } from '../types/ServiceRequest'
import { RequestQuoteDialog } from './RequestQuoteDialog'
import { LeadPurchaseDialog } from './LeadPurchaseDialog'
import { PremiumLeadChat } from './PremiumLeadChat'

interface RequestListProps {
  requests: ServiceRequest[]
  loading: boolean
  error: string | null
  userId: string
  onBidSubmit: (requestId: string, amount: number, description: string) => Promise<boolean | null>
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  loading,
  error,
  userId,
  onBidSubmit,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [leadPurchaseRequest, setLeadPurchaseRequest] = useState<ServiceRequest | null>(null)
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [leadAccessMap, setLeadAccessMap] = useState<Record<string, boolean>>({})
  const [loadingAccess, setLoadingAccess] = useState<Record<string, boolean>>({})

  // Función para verificar acceso a lead
  const checkLeadAccess = async (requestId: string) => {
    if (loadingAccess[requestId] || leadAccessMap[requestId] !== undefined) return

    setLoadingAccess((prev) => ({ ...prev, [requestId]: true }))

    try {
      const response = await fetch(
        `/api/lead-access?contractorId=${userId}&serviceRequestId=${requestId}`,
      )
      if (response.ok) {
        const data = await response.json()
        setLeadAccessMap((prev) => ({ ...prev, [requestId]: data.hasAccess }))
      } else {
        setLeadAccessMap((prev) => ({ ...prev, [requestId]: false }))
      }
    } catch (error) {
      console.error('Error checking lead access:', error)
      setLeadAccessMap((prev) => ({ ...prev, [requestId]: false }))
    } finally {
      setLoadingAccess((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  // Verificar acceso a leads al cargar
  useEffect(() => {
    requests.forEach((request) => {
      checkLeadAccess(request.id)
    })
  }, [requests, userId])

  // Función para mostrar el label amigable del servicio
  function getServiceLabel(serviceType: string) {
    const serviceLabels: Record<string, string> = {
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
    return serviceLabels[serviceType] || serviceType
  }

  // Función para obtener color según urgencia
  function getUrgencyColor(level: string) {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  // Función para obtener etiqueta de urgencia
  function getUrgencyLabel(level: string) {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      emergency: 'Emergencia',
    }
    return labels[level] || level
  }

  // Formatear la fecha
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Verificar si ya existe una cotización para la solicitud actual
  function hasExistingQuote(request: ServiceRequest): boolean {
    return Boolean(request.quotes?.some((quote) => quote.contractor === userId))
  }

  // Contar cotizaciones enviadas por el contratista actual
  function getContractorQuoteCount(request: ServiceRequest): number {
    return request.quotes?.filter((quote) => quote.contractor === userId).length || 0
  }

  // Función para ocultar información de contacto (sistema premium)
  function getBlurredAddress(address: string): string {
    // Mostrar solo la zona general, ocultar número específico
    const parts = address.split(',')
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]?.trim()}, ${parts[parts.length - 1]?.trim()}`
    }
    return 'Zona disponible con lead premium'
  }

  // Determinar si el contratista tiene acceso premium a este lead
  function hasLeadAccess(request: ServiceRequest): boolean {
    return leadAccessMap[request.id] === true
  }

  // Función para comprar acceso al lead
  function handlePurchaseLead(request: ServiceRequest) {
    setLeadPurchaseRequest(request)
  }

  // Función para manejar compra exitosa
  const handlePurchaseSuccess = (leadAccess: any) => {
    setLeadAccessMap((prev) => ({ ...prev, [leadAccess.serviceRequest]: true }))
    setLeadPurchaseRequest(null)
    // Opcional: mostrar notificación de éxito
    console.log('Lead purchased successfully!')
  }

  // Función para abrir chat premium
  const handleOpenChat = (request: ServiceRequest) => {
    setChatRequest(request)
  }

  if (loading) {
    return <p className="text-center py-8">Cargando solicitudes...</p>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay solicitudes disponibles</h3>
        <p className="text-gray-500">No se encontraron solicitudes para los filtros aplicados.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {requests.map((request) => {
          const contractorQuoteCount = getContractorQuoteCount(request)
          const hasAccess = hasLeadAccess(request)

          return (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{request.requestTitle}</CardTitle>
                      {contractorQuoteCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {contractorQuoteCount} cotización{contractorQuoteCount > 1 ? 'es' : ''}{' '}
                          enviada{contractorQuoteCount > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      ID: {request.requestId} • {formatDate(request.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge className={getUrgencyColor(request.urgencyLevel)}>
                    {getUrgencyLabel(request.urgencyLevel)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Servicios solicitados */}
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {request.serviceType.map((type) => (
                        <Badge key={type} variant="outline">
                          {getServiceLabel(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Descripción del problema */}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Descripción del problema:</h4>
                    <p className="text-sm line-clamp-3">{request.description}</p>
                  </div>

                  <Separator />

                  {/* Información de ubicación (limitada) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">
                        {hasAccess
                          ? request.location.formattedAddress
                          : getBlurredAddress(request.location.formattedAddress)}
                      </span>
                      {!hasAccess && <Lock className="h-4 w-4 text-orange-500" />}
                    </div>

                    {/* Información de contacto (bloqueada) */}
                    {!hasAccess && (
                      <div className="mt-2 p-3 border border-orange-200 bg-orange-50 rounded-md">
                        <div className="flex items-start gap-2">
                          <Lock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-orange-800">
                              Información de contacto disponible
                            </p>
                            <p className="text-orange-600 text-xs mt-1">
                              Compra este lead para acceder a: nombre completo, teléfono, email y
                              dirección exacta
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 space-y-2">
                <div className="flex gap-2 w-full flex-col sm:flex-row">
                  {/* Botón principal de cotización */}
                  <Button
                    className="flex-1"
                    onClick={() => setSelectedRequest(request)}
                    variant={hasExistingQuote(request) ? 'outline' : 'default'}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {hasExistingQuote(request) ? 'Actualizar cotización' : 'Enviar cotización'}
                  </Button>

                  <div className="flex gap-2 flex-1">
                    {/* Botón de compra de lead (si no tiene acceso) */}
                    {!hasAccess && (
                      <Button
                        variant="outline"
                        onClick={() => handlePurchaseLead(request)}
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 flex-1 sm:flex-none"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Comprar Lead</span>
                        <span className="sm:hidden">Lead</span>
                      </Button>
                    )}

                    {/* Botón de chat (solo si tiene acceso) */}
                    {hasAccess && (
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50 flex-1 sm:flex-none"
                        onClick={() => handleOpenChat(request)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Chat</span>
                        <span className="sm:hidden">Chat</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mostrar total de cotizaciones recibidas */}
                {request.quotes && request.quotes.length > 0 && (
                  <div className="text-xs text-muted-foreground text-center w-full pt-2 border-t">
                    <div className="flex items-center justify-center gap-1">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>
                        {request.quotes.length} cotización{request.quotes.length > 1 ? 'es' : ''}{' '}
                        total
                        {request.quotes.length > 1 ? 'es' : ''} recibida
                        {request.quotes.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {selectedRequest && (
        <RequestQuoteDialog
          request={selectedRequest}
          userId={userId}
          onClose={() => setSelectedRequest(null)}
          onSubmit={onBidSubmit}
        />
      )}

      {leadPurchaseRequest && (
        <LeadPurchaseDialog
          request={leadPurchaseRequest}
          userId={userId}
          isOpen={true}
          onClose={() => setLeadPurchaseRequest(null)}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {chatRequest && (
        <PremiumLeadChat
          serviceRequestId={chatRequest.id}
          userId={userId}
          userRole="contractor"
          isOpen={true}
          onClose={() => setChatRequest(null)}
        />
      )}
    </>
  )
}
