'use client'

/**
 * RequestQuoteDialog Component
 *
 * Dialog for contractors to submit or update quotes for service requests.
 * Displays service information and a form for price and description.
 *
 * @returns {JSX.Element} Quote dialog component
 */
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { DollarSign, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type ServiceRequest } from '../types/ServiceRequest'

interface RequestQuoteDialogProps {
  request: ServiceRequest
  userId: string
  onClose: () => void
  onSubmit: (requestId: string, amount: number, description: string) => Promise<boolean | null>
}

export const RequestQuoteDialog: React.FC<RequestQuoteDialogProps> = ({
  request,
  userId,
  onClose,
  onSubmit,
}) => {
  const [bidAmount, setBidAmount] = useState('')
  const [bidDescription, setBidDescription] = useState('')
  const [bidSubmitting, setBidSubmitting] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(true)

  // Cargar cotización existente si la hay
  useEffect(() => {
    const existingQuote = request.quotes?.find((q) => q.contractor === userId)
    if (existingQuote) {
      setBidAmount(existingQuote.amount.toString())
      setBidDescription(existingQuote.description)
    }
  }, [request, userId])

  // Manejar cierre del diálogo
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      onClose()
    }
  }

  // Manejar envío de cotización
  const handleSubmitBid = async () => {
    setBidSubmitting(true)
    setBidError(null)

    // Validaciones
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setBidError('Ingresa un monto válido para la cotización')
      setBidSubmitting(false)
      return
    }

    if (!bidDescription.trim()) {
      setBidError('La descripción de la cotización es requerida')
      setBidSubmitting(false)
      return
    }

    // Enviar cotización
    const success = await onSubmit(request.id, parseFloat(bidAmount), bidDescription)

    if (success) {
      // Cerrar el diálogo solo si la cotización se envió correctamente
      setDialogOpen(false)
      onClose()
    } else {
      setBidError('Error al enviar cotización. Inténtalo nuevamente.')
    }

    setBidSubmitting(false)
  }

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

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md bg-background dark:bg-background text-foreground dark:text-foreground">
        <DialogHeader>
          <DialogTitle>Enviar cotización</DialogTitle>
          <DialogDescription>
            Completa los detalles de tu cotización para esta solicitud.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service-type">Tipo de servicio</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {request.serviceType.map((type) => (
                  <Badge key={type} variant="outline">
                    {getServiceLabel(type)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="urgency">Urgencia</Label>
              <div className="mt-1">
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
            </div>
          </div>

          <div>
            <Label htmlFor="bid-amount">Monto de la cotización ($)</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="bid-amount"
                className="pl-8"
                type="number"
                placeholder="0.00"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bid-description">Descripción de la cotización</Label>
            <Textarea
              id="bid-description"
              className="mt-1"
              placeholder="Describe los detalles de tu servicio, tiempo estimado, etc."
              value={bidDescription}
              onChange={(e) => setBidDescription(e.target.value)}
            />
          </div>

          {bidError && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              <span>{bidError}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
            disabled={bidSubmitting}
            className="bg-secondary text-primary hover:bg-secondary/50"
          >
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmitBid} disabled={bidSubmitting}>
            {bidSubmitting ? 'Enviando...' : 'Enviar cotización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
