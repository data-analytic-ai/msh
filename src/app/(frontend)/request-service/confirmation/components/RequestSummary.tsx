/**
 * RequestSummary
 *
 * Componente que muestra el resumen de la solicitud de servicio
 * incluyendo detalles como ubicación, fecha, tipo de servicio y urgencia.
 */
'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Calendar, MapPin, Wrench, AlertTriangle, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditableField } from '@/app/(frontend)/request-service/confirmation/components/EditableField'
import { ServiceType } from '@/hooks/useServiceRequest'

// Mapeo de tipos de servicio a nombres legibles
const serviceNames: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  glass: 'Windows',
  hvac: 'HVAC',
  pests: 'Pest Control',
  locksmith: 'Locksmith',
  roofing: 'Roofing',
  siding: 'Siding',
  general: 'General Repairs',
}

// Definir el tipo urgency
type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

interface RequestSummaryProps {
  requestId: string | null
  selectedServices: ServiceType[]
  formattedAddress: string
  formData: any
  handleEditDetails: () => void
  handleSaveField: (fieldName: string, value: string) => Promise<boolean>
}

export const RequestSummary: React.FC<RequestSummaryProps> = ({
  requestId,
  selectedServices,
  formattedAddress,
  formData,
  handleEditDetails,
  handleSaveField,
}) => {
  // Formatear fecha y hora actuales
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const currentTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Request submitted!</h2>
          <p className="text-muted-foreground">
            Your request has been successfully submitted. We will now find available contractors in
            your area.
          </p>
          <div className="text-sm font-medium text-muted-foreground border-t pt-4">
            <p>Reference ID: {requestId || 'Not available'}</p>
          </div>

          <div className="pt-2">
            <Button variant="outline" onClick={handleEditDetails} className="text-sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit details
            </Button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4">Request Summary</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 pb-3 border-b">
            <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Service Location</h4>
              <p className="text-sm text-muted-foreground">{formattedAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b">
            <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Submission Date & Time</h4>
              <p className="text-sm text-muted-foreground">
                {currentDate} at {currentTime}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b">
            <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h5 className="font-medium">Service Type</h5>
              <p className="text-sm text-muted-foreground">
                {selectedServices.length > 0
                  ? selectedServices
                      .map((service) => {
                        // Comprobar si es un objeto con id o un string directo
                        const serviceId = typeof service === 'object' ? service.id : service
                        return serviceNames[serviceId] || serviceId
                      })
                      .join(', ')
                  : 'Not specified'}
              </p>
            </div>
          </div>

          {formData?.urgency && (
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <AlertTriangle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h5 className="font-medium">Urgency</h5>
                <p className="text-sm text-muted-foreground">
                  {{
                    low: 'Low - Within a week',
                    medium: 'Medium - Within 48 hours',
                    high: 'High - Within 24 hours',
                    emergency: 'Emergency - As soon as possible',
                  }[formData.urgency as UrgencyLevel] || 'Not specified'}
                </p>
              </div>
            </div>
          )}

          {formData?.description && (
            <EditableField
              label="Description"
              value={formData.description}
              fieldName="description"
              requestId={requestId || ''}
              onSave={handleSaveField}
            />
          )}

          {formData?.firstName && (
            <EditableField
              label="First Name"
              value={formData.firstName}
              fieldName="firstName"
              requestId={requestId || ''}
              onSave={handleSaveField}
            />
          )}

          {formData?.lastName && (
            <EditableField
              label="Last Name"
              value={formData.lastName}
              fieldName="lastName"
              requestId={requestId || ''}
              onSave={handleSaveField}
            />
          )}

          {formData?.phone && (
            <EditableField
              label="Phone"
              value={formData.phone}
              fieldName="phone"
              requestId={requestId || ''}
              onSave={handleSaveField}
            />
          )}

          {formData?.email && (
            <EditableField
              label="Email"
              value={formData.email}
              fieldName="email"
              requestId={requestId || ''}
              onSave={handleSaveField}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
