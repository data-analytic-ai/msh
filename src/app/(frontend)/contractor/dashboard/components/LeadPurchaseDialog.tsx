'use client'

/**
 * LeadPurchaseDialog Component
 *
 * Modal dialog for contractors to purchase premium access to service request leads.
 * Integrates with Stripe for payment processing and provides different lead tiers.
 *
 * @returns {JSX.Element} Lead purchase dialog component
 */
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Lock,
  CreditCard,
  Check,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type ServiceRequest } from '../types/ServiceRequest'

interface LeadPurchaseDialogProps {
  request: ServiceRequest
  userId: string
  isOpen: boolean
  onClose: () => void
  onPurchaseSuccess: (leadAccess: any) => void
}

interface LeadTier {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  recommended?: boolean
}

export const LeadPurchaseDialog: React.FC<LeadPurchaseDialogProps> = ({
  request,
  userId,
  isOpen,
  onClose,
  onPurchaseSuccess,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('basic')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')

  // Calculate dynamic pricing based on urgency
  const getLeadPrice = (basePrice: number) => {
    let price = basePrice
    if (request.urgencyLevel === 'emergency') {
      price *= 1.5
    } else if (request.urgencyLevel === 'high') {
      price *= 1.2
    }
    return Math.round(price)
  }

  const leadTiers: LeadTier[] = [
    {
      id: 'basic',
      name: 'Basic Lead',
      price: getLeadPrice(15),
      description: 'Access to customer contact information',
      features: [
        'Customer name and phone number',
        'Email address',
        'Exact service address',
        'Preferred contact time',
      ],
    },
    {
      id: 'premium',
      name: 'Premium Lead',
      price: getLeadPrice(25),
      description: 'Enhanced access with chat functionality',
      features: [
        'Everything in Basic Lead',
        'Direct chat with customer',
        'Real-time notifications',
        'Customer service history',
      ],
      recommended: true,
    },
    {
      id: 'specialized',
      name: 'Specialized Lead',
      price: getLeadPrice(35),
      description: 'Complete access with priority support',
      features: [
        'Everything in Premium Lead',
        'Priority placement in quotes',
        'Customer preferences insight',
        'Dedicated support line',
      ],
    },
  ]

  const selectedTierData = leadTiers.find((tier) => tier.id === selectedTier)

  const handlePurchase = async () => {
    if (!paymentMethod.trim()) {
      setError('Por favor ingresa un método de pago válido')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Simulate payment method creation (in real implementation, use Stripe Elements)
      const mockPaymentMethodId = `pm_card_${Math.random().toString(36).substr(2, 9)}`

      const response = await fetch('/api/purchase-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractorId: userId,
          serviceRequestId: request.id,
          leadType: selectedTier,
          paymentMethodId: mockPaymentMethodId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar el pago')
      }

      const data = await response.json()

      if (data.success) {
        onPurchaseSuccess(data.leadAccess)
        onClose()
      } else {
        setError(data.message || 'El pago requiere confirmación adicional')
      }
    } catch (err: any) {
      console.error('Error purchasing lead:', err)
      setError(err.message || 'Error al comprar el lead')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Comprar Acceso Premium al Lead
          </DialogTitle>
          <DialogDescription>
            Obtén acceso completo a la información de contacto del cliente y funcionalidades premium
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Request Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Resumen de la Solicitud</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Servicio:</strong> {request.requestTitle}
              </p>
              <p>
                <strong>Urgencia:</strong>
                <Badge
                  className="ml-2"
                  variant={
                    request.urgencyLevel === 'emergency'
                      ? 'destructive'
                      : request.urgencyLevel === 'high'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {request.urgencyLevel === 'emergency'
                    ? 'Emergencia'
                    : request.urgencyLevel === 'high'
                      ? 'Alta'
                      : request.urgencyLevel === 'medium'
                        ? 'Media'
                        : 'Baja'}
                </Badge>
              </p>
              <p>
                <strong>Ubicación:</strong>{' '}
                {request.location.formattedAddress.split(',').slice(-2).join(',')}
              </p>
            </div>
          </div>

          {/* Lead Tiers */}
          <div>
            <h3 className="font-medium mb-4">Selecciona tu Plan de Acceso</h3>
            <div className="grid gap-4">
              {leadTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTier === tier.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  {tier.recommended && (
                    <div className="absolute -top-2 left-4">
                      <Badge className="bg-blue-600">
                        <Star className="h-3 w-3 mr-1" />
                        Recomendado
                      </Badge>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{tier.name}</h4>
                      <p className="text-sm text-gray-600">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">${tier.price}</span>
                      {tier.price !==
                        getLeadPrice(
                          tier.price /
                            (request.urgencyLevel === 'emergency'
                              ? 1.5
                              : request.urgencyLevel === 'high'
                                ? 1.2
                                : 1),
                        ) && (
                        <p className="text-xs text-orange-600">Precio ajustado por urgencia</p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-1">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Información de Pago</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-method">Método de Pago</Label>
                <div className="mt-1 relative">
                  <Input
                    id="payment-method"
                    placeholder="4242 4242 4242 4242 (Demo)"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="pl-10"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Usa 4242 4242 4242 4242 para pruebas</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">¿Por qué cobrar por los leads?</p>
                    <p className="text-xs mt-1">
                      Esto asegura que solo contratistas serios accedan a la información del
                      cliente, mejorando la calidad del servicio y reduciendo spam.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isProcessing || !paymentMethod.trim()}
            className="min-w-[140px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Comprar ${selectedTierData?.price}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
