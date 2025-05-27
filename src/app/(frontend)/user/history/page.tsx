'use client'

/**
 * UserHistoryPage - Página de historial de servicios del usuario
 *
 * Muestra el historial completo de servicios solicitados por el usuario:
 * - Servicios completados
 * - Servicios en progreso
 * - Servicios cancelados
 * - Detalles de pagos y calificaciones
 *
 * @returns {JSX.Element} Página de historial del usuario
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Download,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Phone,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

interface ServiceHistoryItem {
  id: string
  contractorName: string
  contractorPhone: string
  contractorRating: number
  service: string
  description?: string
  address: string
  amount: number
  status: 'completed' | 'in_progress' | 'cancelled'
  paymentStatus: 'paid' | 'pending' | 'refunded'
  createdAt: Date
  completedAt?: Date
  userRating?: number
  userReview?: string
  receiptUrl?: string
}

export default function UserHistoryPage() {
  const router = useRouter()
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Simular carga de historial de servicios
  useEffect(() => {
    const loadServiceHistory = async () => {
      setIsLoading(true)

      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Datos mock del historial
      const mockHistory: ServiceHistoryItem[] = [
        {
          id: 'service-001',
          contractorName: 'Juan Pérez',
          contractorPhone: '+1 (555) 123-4567',
          contractorRating: 4.8,
          service: 'Plomería',
          description: 'Reparación de tubería con fuga en el baño',
          address: '123 Main St, Ciudad',
          amount: 280,
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 1 semana
          completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          userRating: 5,
          userReview: 'Excelente servicio, muy profesional y rápido',
          receiptUrl: '/receipts/service-001.pdf',
        },
        {
          id: 'service-002',
          contractorName: 'María González',
          contractorPhone: '+1 (555) 987-6543',
          contractorRating: 4.9,
          service: 'Electricidad',
          description: 'Instalación de ventilador de techo',
          address: '456 Oak Ave, Ciudad',
          amount: 150,
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Hace 2 semanas
          completedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
          userRating: 4,
          userReview: 'Buen trabajo, llegó puntual',
          receiptUrl: '/receipts/service-002.pdf',
        },
        {
          id: 'service-003',
          contractorName: 'Carlos Rodríguez',
          contractorPhone: '+1 (555) 456-7890',
          contractorRating: 4.7,
          service: 'Carpintería',
          description: 'Reparación de puerta principal',
          address: '789 Pine St, Ciudad',
          amount: 320,
          status: 'in_progress',
          paymentStatus: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        },
        {
          id: 'service-004',
          contractorName: 'Ana López',
          contractorPhone: '+1 (555) 321-0987',
          contractorRating: 4.6,
          service: 'Limpieza',
          description: 'Limpieza profunda post-construcción',
          address: '321 Elm St, Ciudad',
          amount: 200,
          status: 'cancelled',
          paymentStatus: 'refunded',
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // Hace 3 semanas
        },
      ]

      setServiceHistory(mockHistory)
      setIsLoading(false)
    }

    loadServiceHistory()
  }, [])

  // Filtrar servicios según la pestaña activa
  const getFilteredServices = () => {
    switch (activeTab) {
      case 'completed':
        return serviceHistory.filter((s) => s.status === 'completed')
      case 'in_progress':
        return serviceHistory.filter((s) => s.status === 'in_progress')
      case 'cancelled':
        return serviceHistory.filter((s) => s.status === 'cancelled')
      default:
        return serviceHistory
    }
  }

  // Obtener color del badge según el estado
  const getStatusBadge = (status: ServiceHistoryItem['status']) => {
    const variants = {
      completed: { text: 'Completado', color: 'bg-green-100 text-green-800' },
      in_progress: { text: 'En progreso', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
    }
    return variants[status]
  }

  // Obtener color del badge según el estado del pago
  const getPaymentStatusBadge = (paymentStatus: ServiceHistoryItem['paymentStatus']) => {
    const variants = {
      paid: { text: 'Pagado', color: 'bg-green-100 text-green-800' },
      pending: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      refunded: { text: 'Reembolsado', color: 'bg-blue-100 text-blue-800' },
    }
    return variants[paymentStatus]
  }

  // Manejar descarga de recibo
  const handleDownloadReceipt = (serviceId: string) => {
    console.log('📄 Descargando recibo para servicio:', serviceId)
    alert('Funcionalidad de descarga próximamente')
  }

  // Manejar ver detalles
  const handleViewDetails = (serviceId: string) => {
    console.log('👁️ Ver detalles del servicio:', serviceId)
    // Aquí podrías navegar a una página de detalles específica
    alert('Funcionalidad de detalles próximamente')
  }

  // Manejar contactar contratista
  const handleContactContractor = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Cargando historial...</p>
        </div>
      </div>
    )
  }

  const filteredServices = getFilteredServices()

  return (
    <div className="container mx-auto px-4 py-6 dark:text-white">
      {/* Navegación */}
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Historial de servicios</h1>
          <p className="text-muted-foreground">Revisa todos los servicios que has solicitado</p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="w-4 h-4 mr-2" />
            Solicitar nuevo servicio
          </Link>
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total servicios</p>
                <p className="text-2xl font-bold">{serviceHistory.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {serviceHistory.filter((s) => s.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En progreso</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {serviceHistory.filter((s) => s.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total gastado</p>
                <p className="text-2xl font-bold">
                  $
                  {serviceHistory
                    .filter((s) => s.paymentStatus === 'paid')
                    .reduce((sum, s) => sum + s.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de filtros */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="in_progress">En progreso</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No tienes servicios en esta categoría</p>
                <Button asChild className="mt-4">
                  <Link href="/">Solicitar un servicio</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{service.service}</h3>
                      <p className="text-sm text-muted-foreground">
                        Contratista: {service.contractorName}
                      </p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${service.amount}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getStatusBadge(service.status).color}>
                          {getStatusBadge(service.status).text}
                        </Badge>
                        <Badge className={getPaymentStatusBadge(service.paymentStatus).color}>
                          {getPaymentStatusBadge(service.paymentStatus).text}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{service.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {service.completedAt
                          ? `Completado: ${service.completedAt.toLocaleDateString()}`
                          : `Solicitado: ${service.createdAt.toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Contratista: {service.contractorRating} ★</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{service.contractorPhone}</span>
                    </div>
                  </div>

                  {/* Calificación del usuario */}
                  {service.userRating && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Tu calificación:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= service.userRating!
                                  ? 'text-warning fill-warning'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {service.userReview && (
                        <p className="text-sm text-muted-foreground">"{service.userReview}"</p>
                      )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(service.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                    </Button>

                    {service.receiptUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceipt(service.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar recibo
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactContractor(service.contractorPhone)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contactar
                    </Button>

                    {service.status === 'completed' && !service.userRating && (
                      <Button size="sm">
                        <Star className="w-4 h-4 mr-2" />
                        Calificar servicio
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
