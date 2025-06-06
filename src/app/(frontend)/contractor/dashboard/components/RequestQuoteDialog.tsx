/**
 * RequestQuoteDialog Component
 *
 * Advanced dialog for contractors to submit and update quotes for service requests.
 * Features predefined message templates, photo gallery, price negotiation system,
 * and automatic client notifications.
 *
 * @returns {JSX.Element} Enhanced quote dialog component
 */
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DollarSign,
  AlertCircle,
  Camera,
  Eye,
  EyeOff,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  ThumbsUp,
  FileText,
  Star,
  Calendar,
  Wrench,
  Shield,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type ServiceRequest } from '../types/ServiceRequest'

// Create a simple ScrollArea component
const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-auto ${className || ''}`}>{children}</div>
)

interface RequestQuoteDialogProps {
  request: ServiceRequest & { photos?: Array<{ url: string; description: string }> }
  userId: string
  onClose: () => void
  onSubmit: (requestId: string, amount: number, description: string) => Promise<boolean | null>
}

interface PredefinedMessage {
  id: string
  label: string
  description: string
  template: string
  category: 'greeting' | 'availability' | 'pricing' | 'materials' | 'timeline' | 'guarantee'
  urgencyBonus?: number
}

const PREDEFINED_MESSAGES: PredefinedMessage[] = [
  // Greeting Messages
  {
    id: 'greeting_professional',
    label: 'Saludo profesional',
    description: 'Introducción formal y confiable',
    template:
      'Estimado cliente, soy un contratista certificado con más de 5 años de experiencia en este tipo de trabajos. Me interesa su proyecto y estoy disponible para realizarlo con la máxima calidad.',
    category: 'greeting',
  },
  {
    id: 'greeting_quick',
    label: 'Respuesta rápida',
    description: 'Para emergencias y trabajos urgentes',
    template:
      'He visto su solicitud urgente. Puedo estar en su ubicación en menos de 2 horas y comenzar el trabajo inmediatamente. Tengo todas las herramientas necesarias.',
    category: 'greeting',
    urgencyBonus: 15,
  },
  {
    id: 'greeting_experienced',
    label: 'Destacar experiencia',
    description: 'Enfatizar credenciales y trabajos anteriores',
    template:
      'Con más de 200 trabajos similares completados y calificación de 4.9 estrellas, garantizo un servicio profesional. Puedo mostrarle ejemplos de trabajos similares.',
    category: 'greeting',
  },

  // Availability Messages
  {
    id: 'available_today',
    label: 'Disponible hoy',
    description: 'Para trabajos inmediatos',
    template:
      'Estoy disponible hoy mismo para realizar el trabajo. Puedo comenzar en cuanto confirmemos los detalles.',
    category: 'availability',
    urgencyBonus: 10,
  },
  {
    id: 'available_weekend',
    label: 'Trabajo en fines de semana',
    description: 'Flexibilidad horaria',
    template:
      'Trabajo también sábados y domingos sin costo adicional por horario. Mi horario es flexible para ajustarse a su conveniencia.',
    category: 'availability',
  },
  {
    id: 'available_evening',
    label: 'Horarios nocturnos',
    description: 'Para emergencias fuera de horario',
    template:
      'Para emergencias, trabajo hasta altas horas sin recargo adicional. Su problema será resuelto sin importar la hora.',
    category: 'availability',
    urgencyBonus: 20,
  },

  // Pricing Messages
  {
    id: 'pricing_competitive',
    label: 'Precio competitivo',
    description: 'Enfatizar valor por dinero',
    template:
      'Mi precio incluye materiales de calidad, mano de obra especializada y garantía completa. Es una inversión que vale la pena.',
    category: 'pricing',
  },
  {
    id: 'pricing_negotiable',
    label: 'Abierto a negociar',
    description: 'Flexibilidad en precio',
    template:
      'Estoy abierto a discutir el precio y encontrar una solución que funcione para ambos. Podemos ajustar según el presupuesto disponible.',
    category: 'pricing',
  },
  {
    id: 'pricing_allinclusive',
    label: 'Todo incluido',
    description: 'Sin costos ocultos',
    template:
      'El precio incluye TODO: materiales, mano de obra, limpieza y garantía. No hay costos adicionales sorpresa.',
    category: 'pricing',
  },

  // Materials Messages
  {
    id: 'materials_quality',
    label: 'Materiales de calidad',
    description: 'Enfatizar calidad de materiales',
    template:
      'Uso solo materiales de primera calidad de marcas reconocidas. Esto garantiza durabilidad y mejor resultado final.',
    category: 'materials',
  },
  {
    id: 'materials_local',
    label: 'Proveedor local',
    description: 'Materiales disponibles localmente',
    template:
      'Tengo acuerdos con proveedores locales para obtener materiales rápidamente y a mejor precio. Esto reduce el tiempo de espera.',
    category: 'materials',
  },

  // Timeline Messages
  {
    id: 'timeline_fast',
    label: 'Trabajo rápido',
    description: 'Completar en tiempo record',
    template:
      'Puedo completar este trabajo en la mitad del tiempo habitual sin comprometer la calidad. Soy muy eficiente.',
    category: 'timeline',
  },
  {
    id: 'timeline_detailed',
    label: 'Cronograma detallado',
    description: 'Planificación paso a paso',
    template:
      'Le proporcionaré un cronograma detallado día por día. Sabrá exactamente qué esperar en cada momento del proceso.',
    category: 'timeline',
  },

  // Guarantee Messages
  {
    id: 'guarantee_full',
    label: 'Garantía completa',
    description: 'Garantía extendida del trabajo',
    template:
      'Ofrezco garantía completa de 2 años en mano de obra y 5 años en materiales. Si algo falla, lo reparo sin costo.',
    category: 'guarantee',
  },
  {
    id: 'guarantee_satisfaction',
    label: 'Satisfacción garantizada',
    description: 'Garantía de satisfacción 100%',
    template:
      'Garantía de satisfacción 100%. Si no está completamente satisfecho, ajusto el trabajo hasta que quede perfecto.',
    category: 'guarantee',
  },
]

export const RequestQuoteDialog: React.FC<RequestQuoteDialogProps> = ({
  request,
  userId,
  onClose,
  onSubmit,
}) => {
  const [bidAmount, setBidAmount] = useState('')
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [bidSubmitting, setBidSubmitting] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('pricing')
  const [showPhotos, setShowPhotos] = useState(false)
  const [isNegotiating, setIsNegotiating] = useState(false)
  const [originalPrice, setOriginalPrice] = useState<number | null>(null)
  const [priceHistory, setPriceHistory] = useState<
    Array<{ price: number; date: string; type: 'initial' | 'counter' | 'final' }>
  >([])

  // Cargar cotización existente si la hay
  useEffect(() => {
    const existingQuote = request.quotes?.find((q) => q.contractor === userId)
    if (existingQuote) {
      setBidAmount(existingQuote.amount.toString())
      setOriginalPrice(existingQuote.amount)
      // Simular historial de precios
      setPriceHistory([
        { price: existingQuote.amount, date: new Date().toISOString(), type: 'initial' },
      ])
    }
  }, [request, userId])

  // Manejar cierre del diálogo
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      onClose()
    }
  }

  // Manejar selección de mensajes predeterminados
  const handleMessageToggle = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId],
    )
  }

  // Generar descripción final basada en mensajes seleccionados
  const generateFinalDescription = () => {
    const messages = selectedMessages
      .map((id) => PREDEFINED_MESSAGES.find((msg) => msg.id === id)?.template)
      .filter(Boolean)

    return messages.join('\n\n')
  }

  // Calcular precio con bonos de urgencia
  const calculateFinalPrice = () => {
    const basePrice = parseFloat(bidAmount) || 0
    let urgencyBonus = 0

    selectedMessages.forEach((id) => {
      const message = PREDEFINED_MESSAGES.find((msg) => msg.id === id)
      if (message?.urgencyBonus) {
        urgencyBonus += message.urgencyBonus
      }
    })

    // Aplicar bonus por urgencia
    if (request.urgencyLevel === 'emergency') urgencyBonus += 25
    else if (request.urgencyLevel === 'high') urgencyBonus += 15
    else if (request.urgencyLevel === 'medium') urgencyBonus += 5

    return basePrice + (basePrice * urgencyBonus) / 100
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

    if (selectedMessages.length === 0) {
      setBidError('Selecciona al menos un tipo de mensaje para tu cotización')
      setBidSubmitting(false)
      return
    }

    const finalPrice = calculateFinalPrice()
    const finalDescription = generateFinalDescription()

    // Agregar al historial de precios con tipo explícito
    const newPriceEntry = {
      price: finalPrice,
      date: new Date().toISOString(),
      type: (isNegotiating ? 'counter' : 'initial') as 'initial' | 'counter' | 'final',
    }
    setPriceHistory((prev) => [...prev, newPriceEntry])

    // Enviar cotización
    const success = await onSubmit(request.id, finalPrice, finalDescription)

    if (success) {
      // Simular notificación al cliente
      console.log('📧 Notificación enviada al cliente sobre nueva/actualizada cotización')

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

  // Renderizar galería de fotos
  const renderPhotoGallery = () => {
    // Simular fotos del cliente (en realidad vendrían del request)
    const clientPhotos = request.photos || [
      { url: '/placeholder-1.jpg', description: 'Vista general del problema' },
      { url: '/placeholder-2.jpg', description: 'Detalle específico' },
      { url: '/placeholder-3.jpg', description: 'Área afectada' },
    ]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Fotos del cliente ({clientPhotos.length})</h4>
          <Button variant="outline" size="sm" onClick={() => setShowPhotos(!showPhotos)}>
            {showPhotos ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPhotos ? 'Ocultar' : 'Ver fotos'}
          </Button>
        </div>

        {showPhotos && (
          <div className="grid grid-cols-2 gap-3">
            {clientPhotos.map((photo: { url: string; description: string }, index: number) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Foto {index + 1}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">{photo.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-background dark:bg-background text-foreground dark:text-foreground max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {originalPrice ? 'Actualizar cotización' : 'Enviar cotización'}
            {isNegotiating && <Badge variant="outline">Negociando</Badge>}
          </DialogTitle>
          <DialogDescription>
            Crea una cotización profesional usando nuestras plantillas predeterminadas
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Precio
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensajes
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Fotos
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Revisar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de servicio</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.serviceType.map((type) => (
                        <Badge key={type} variant="outline">
                          {getServiceLabel(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Urgencia</Label>
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
                  <Label>Descripción del problema</Label>
                  <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                    {request.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Establecer precio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bid-amount">Precio base ($)</Label>
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

                {bidAmount && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Precio base:</span>
                        <span>${parseFloat(bidAmount || '0').toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Bonus por urgencia/características:</span>
                        <span>
                          +$
                          {(calculateFinalPrice() - parseFloat(bidAmount || '0')).toLocaleString()}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Precio final:</span>
                        <span className="text-green-600">
                          ${calculateFinalPrice().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historial de precios si existe */}
                {priceHistory.length > 0 && (
                  <div className="space-y-2">
                    <Label>Historial de negociación</Label>
                    <div className="space-y-1">
                      {priceHistory.map((entry, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="capitalize">{entry.type}:</span>
                          <span>${entry.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.entries(
                  PREDEFINED_MESSAGES.reduce(
                    (acc, msg) => {
                      if (!acc[msg.category]) acc[msg.category] = []
                      acc[msg.category]!.push(msg)
                      return acc
                    },
                    {} as Record<string, PredefinedMessage[]>,
                  ),
                ).map(([category, messages]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base capitalize flex items-center gap-2">
                        {category === 'greeting' && <MessageSquare className="h-4 w-4" />}
                        {category === 'availability' && <Clock className="h-4 w-4" />}
                        {category === 'pricing' && <DollarSign className="h-4 w-4" />}
                        {category === 'materials' && <Wrench className="h-4 w-4" />}
                        {category === 'timeline' && <Calendar className="h-4 w-4" />}
                        {category === 'guarantee' && <Shield className="h-4 w-4" />}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className="space-y-2">
                          <div className="flex items-start gap-3">
                            <Button
                              variant={
                                selectedMessages.includes(message.id) ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => handleMessageToggle(message.id)}
                              className="flex-shrink-0"
                            >
                              {selectedMessages.includes(message.id) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <ArrowRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium">{message.label}</h4>
                                {message.urgencyBonus && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Zap className="h-3 w-3 mr-1" />+{message.urgencyBonus}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{message.description}</p>
                              {selectedMessages.includes(message.id) && (
                                <p className="text-xs text-foreground bg-muted p-2 rounded border-l-2 border-primary">
                                  {message.template}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fotos del cliente</CardTitle>
              </CardHeader>
              <CardContent>{renderPhotoGallery()}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de la cotización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio final</Label>
                    <div className="text-2xl font-bold text-green-600">
                      ${calculateFinalPrice().toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <Label>Mensajes seleccionados</Label>
                    <div className="text-sm text-muted-foreground">
                      {selectedMessages.length} mensaje{selectedMessages.length !== 1 ? 's' : ''}{' '}
                      seleccionado{selectedMessages.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {selectedMessages.length > 0 && (
                  <div>
                    <Label>Vista previa del mensaje</Label>
                    <div className="mt-2 p-3 bg-muted rounded text-sm max-h-32 overflow-y-auto">
                      {generateFinalDescription()}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    El cliente recibirá una notificación automática sobre tu cotización
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {bidError && (
          <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded">
            <AlertCircle size={16} />
            <span>{bidError}</span>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
            disabled={bidSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmitBid}
            disabled={bidSubmitting || !bidAmount || selectedMessages.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {bidSubmitting
              ? 'Enviando...'
              : originalPrice
                ? 'Actualizar cotización'
                : 'Enviar cotización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
