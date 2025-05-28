'use client'

/**
 * ContractorDashboard - Dashboard principal del contratista
 *
 * Muestra:
 * - Notificaciones de nuevos trabajos asignados
 * - Saldo disponible y pagos pendientes
 * - Historial de trabajos realizados
 * - Estado de pagos (retenidos, liberados)
 *
 * @returns {JSX.Element} Dashboard del contratista
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Star,
  Download,
  Eye,
  Settings,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/payment-config'

// Tipos para el contratista
interface ContractorProfile {
  id: string
  name: string
  email: string
  phone: string
  services: string[]
  rating: number
  reviewCount: number
  verified: boolean
}

interface ServiceRequest {
  id: string
  clientName: string
  clientPhone: string
  service: string
  address: string
  amount: number
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed'
  paymentStatus: 'pending' | 'held' | 'released'
  createdAt: Date
  scheduledAt?: Date
  completedAt?: Date
}

interface PaymentSummary {
  availableBalance: number
  pendingPayments: number
  heldPayments: number
  totalEarnings: number
  thisMonthEarnings: number
}

export default function ContractorDashboard() {
  const router = useRouter()
  const [contractor, setContractor] = useState<ContractorProfile | null>(null)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [notifications, setNotifications] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Simular datos del contratista (en producción vendría de la API)
  useEffect(() => {
    const loadContractorData = async () => {
      setIsLoading(true)

      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Datos mock del contratista
      setContractor({
        id: 'contractor-123',
        name: 'Juan Pérez',
        email: 'juan.perez@contractor.com',
        phone: '+1 (555) 123-4567',
        services: ['plumbing', 'electrical'],
        rating: 4.8,
        reviewCount: 127,
        verified: true,
      })

      // Datos mock de solicitudes de servicio
      setServiceRequests([
        {
          id: 'req-001',
          clientName: 'María González',
          clientPhone: '+1 (555) 987-6543',
          service: 'Plomería',
          address: '123 Main St, Ciudad',
          amount: 450,
          status: 'assigned',
          paymentStatus: 'pending',
          createdAt: new Date(),
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
        },
        {
          id: 'req-002',
          clientName: 'Carlos Rodríguez',
          clientPhone: '+1 (555) 456-7890',
          service: 'Electricidad',
          address: '456 Oak Ave, Ciudad',
          amount: 320,
          status: 'in_progress',
          paymentStatus: 'held',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
        },
        {
          id: 'req-003',
          clientName: 'Ana López',
          clientPhone: '+1 (555) 321-0987',
          service: 'Plomería',
          address: '789 Pine St, Ciudad',
          amount: 280,
          status: 'completed',
          paymentStatus: 'released',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        },
      ])

      // Datos mock de resumen de pagos
      setPaymentSummary({
        availableBalance: 1250.0,
        pendingPayments: 450.0,
        heldPayments: 320.0,
        totalEarnings: 8750.0,
        thisMonthEarnings: 2100.0,
      })

      // Contar notificaciones (trabajos asignados)
      setNotifications(1) // 1 trabajo nuevo asignado

      setIsLoading(false)
    }

    loadContractorData()
  }, [])

  // Manejar aceptación de trabajo
  const handleAcceptJob = (requestId: string) => {
    setServiceRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'accepted' as const } : req)),
    )
    setNotifications((prev) => Math.max(0, prev - 1))
    console.log('✅ Trabajo aceptado:', requestId)
  }

  // Manejar rechazo de trabajo
  const handleRejectJob = (requestId: string) => {
    setServiceRequests((prev) => prev.filter((req) => req.id !== requestId))
    setNotifications((prev) => Math.max(0, prev - 1))
    console.log('❌ Trabajo rechazado:', requestId)
  }

  // Obtener color del badge según el estado
  const getStatusBadge = (status: ServiceRequest['status']) => {
    const variants = {
      assigned: {
        variant: 'default' as const,
        text: 'Asignado',
        color: 'bg-blue-100 text-blue-800',
      },
      accepted: {
        variant: 'default' as const,
        text: 'Aceptado',
        color: 'bg-green-100 text-green-800',
      },
      in_progress: {
        variant: 'default' as const,
        text: 'En progreso',
        color: 'bg-yellow-100 text-yellow-800',
      },
      completed: {
        variant: 'default' as const,
        text: 'Completado',
        color: 'bg-green-100 text-green-800',
      },
    }
    return variants[status]
  }

  // Obtener color del badge según el estado del pago
  const getPaymentStatusBadge = (paymentStatus: ServiceRequest['paymentStatus']) => {
    const variants = {
      pending: { text: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
      held: { text: 'Retenido', color: 'bg-yellow-100 text-yellow-800' },
      released: { text: 'Liberado', color: 'bg-green-100 text-green-800' },
    }
    return variants[paymentStatus]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!contractor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <h2 className="text-xl font-semibold">Error al cargar el perfil</h2>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 dark:text-white">
      {/* Header del dashboard */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, {contractor.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {notifications}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Resumen de pagos */}
      {paymentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo disponible</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(paymentSummary.availableBalance)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pagos retenidos</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(paymentSummary.heldPayments)}
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
                  <p className="text-sm text-muted-foreground">Este mes</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(paymentSummary.thisMonthEarnings)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total ganado</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(paymentSummary.totalEarnings)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs" className="relative">
            Trabajos
            {notifications > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {notifications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        {/* Tab de trabajos */}
        <TabsContent value="jobs" className="space-y-4">
          {serviceRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No tienes trabajos asignados en este momento
                </p>
              </CardContent>
            </Card>
          ) : (
            serviceRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{request.service}</h3>
                      <p className="text-sm text-muted-foreground">Cliente: {request.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${request.amount}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getStatusBadge(request.status).color}>
                          {getStatusBadge(request.status).text}
                        </Badge>
                        <Badge className={getPaymentStatusBadge(request.paymentStatus).color}>
                          {getPaymentStatusBadge(request.paymentStatus).text}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{request.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{request.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {request.scheduledAt
                          ? `Programado: ${request.scheduledAt.toLocaleString()}`
                          : `Creado: ${request.createdAt.toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  {request.status === 'assigned' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAcceptJob(request.id)} className="flex-1">
                        Aceptar trabajo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectJob(request.id)}
                        className="flex-1"
                      >
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <Button className="w-full">Marcar como en progreso</Button>
                  )}

                  {request.status === 'in_progress' && (
                    <Button className="w-full">Marcar como completado</Button>
                  )}

                  {request.status === 'completed' && (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar recibo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab de pagos */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests
                  .filter((req) => req.paymentStatus === 'released')
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex justify-between items-center p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{request.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.clientName} • {request.completedAt?.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+${request.amount}</p>
                        <Badge className="bg-green-100 text-green-800">Pagado</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de perfil */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <p className="text-sm text-muted-foreground">{contractor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{contractor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <p className="text-sm text-muted-foreground">{contractor.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Calificación</label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-sm">
                      {contractor.rating} ({contractor.reviewCount} reseñas)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">Servicios ofrecidos</label>
                <div className="flex gap-2 mt-2">
                  {contractor.services.map((service) => (
                    <Badge key={service} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full">Editar perfil</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
