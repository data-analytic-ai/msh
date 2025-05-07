'use client'

/**
 * RequestList Component
 *
 * Displays a list of service requests for contractors to bid on.
 * Includes loading, error, and empty states.
 *
 * @returns {JSX.Element} List of service requests
 */
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, MapPin, DollarSign } from 'lucide-react'
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
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.requestTitle}</CardTitle>
                  <CardDescription>
                    ID: {request.requestId} • {formatDate(request.createdAt)}
                  </CardDescription>
                </div>
                <Badge className={getUrgencyColor(request.urgencyLevel)}>
                  {request.urgencyLevel === 'emergency'
                    ? 'Emergencia'
                    : request.urgencyLevel === 'high'
                      ? 'Alta'
                      : request.urgencyLevel === 'medium'
                        ? 'Media'
                        : 'Baja'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {request.serviceType.map((type) => (
                      <Badge key={type} variant="outline">
                        {getServiceLabel(type)}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm line-clamp-2">{request.description}</p>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{request.location.formattedAddress}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                className="w-full"
                onClick={() => setSelectedRequest(request)}
                variant={hasExistingQuote(request) ? 'outline' : 'default'}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {hasExistingQuote(request) ? 'Actualizar cotización' : 'Enviar cotización'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedRequest && (
        <RequestQuoteDialog
          request={selectedRequest}
          userId={userId}
          onClose={() => setSelectedRequest(null)}
          onSubmit={onBidSubmit}
        />
      )}
    </>
  )
}
