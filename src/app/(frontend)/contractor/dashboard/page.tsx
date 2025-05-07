'use client'

/**
 * Contractor Dashboard Page
 *
 * Main dashboard for contractors to view and manage service requests.
 * Shows assigned requests and provides access to other contractor features.
 *
 * @returns {JSX.Element} Dashboard interface for contractors
 */
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Home,
  FileText,
  LogOut,
  Search,
  Bell,
  User,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ServiceRequest {
  id: string
  requestId: string
  requestTitle: string
  serviceType: string[]
  description: string
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
  urgencyLevel: string
  customerInfo: {
    fullName: string
    phone: string
    email: string
  }
  preferredDateTime?: string
  location: {
    formattedAddress: string
  }
  createdAt: string
}

export default function ContractorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [assignedRequests, setAssignedRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { user } = await getMe()

        if (!user) {
          return router.push('/contractor/login')
        }

        if (user.role !== 'contractor' && user.role !== 'admin' && user.role !== 'superadmin') {
          router.push('/login')
          return
        }

        setUser(user)

        // Cargar solicitudes asignadas al contratista
        fetchAssignedRequests(user.id)
      } catch (err) {
        console.error('Error al verificar autenticación:', err)
        router.push('/contractor/login')
      }
    }

    checkAuthentication()
  }, [router])

  const fetchAssignedRequests = async (userId: string) => {
    setLoading(true)
    try {
      // Obtener solicitudes donde este contratista está asignado
      const response = await fetch(
        `/api/service-requests?where[assignedContractor][equals]=${userId}`,
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error('Error al cargar solicitudes')
      }

      const data = await response.json()
      setAssignedRequests(data.docs || [])
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/contractor/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

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

  // Función para obtener badge de estado
  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { class: string; label: string }> = {
      pending: { class: 'bg-gray-100 text-gray-800', label: 'Pendiente' },
      assigned: { class: 'bg-blue-100 text-blue-800', label: 'Asignado' },
      'in-progress': { class: 'bg-yellow-100 text-yellow-800', label: 'En progreso' },
      completed: { class: 'bg-green-100 text-green-800', label: 'Completado' },
      cancelled: { class: 'bg-red-100 text-red-800', label: 'Cancelado' },
    }
    // Usar el status recibido o defaultear a pending si no existe
    const config = statusConfig[status] || {
      class: 'bg-gray-100 text-gray-800',
      label: 'Pendiente',
    }
    return <Badge className={config.class}>{config.label}</Badge>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm p-4 hidden md:block">
        <div className="flex items-center space-x-2 pb-4 mb-4 border-b">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-xl">Portal Contratista</h1>
        </div>

        <nav className="space-y-2">
          <Link
            href="/contractor/dashboard"
            className="flex items-center space-x-2 p-2 rounded-md bg-primary/10 text-primary font-medium"
          >
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </Link>

          <Link
            href="/contractor/dashboard/explore"
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 text-gray-700"
          >
            <Search className="h-5 w-5" />
            <span>Explorar solicitudes</span>
          </Link>

          <Link
            href="/contractor/dashboard/profile"
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 text-gray-700"
          >
            <User className="h-5 w-5" />
            <span>Mi perfil</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 text-gray-700"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Contratista</h1>
              <p className="text-gray-600">Bienvenido, {user?.name || 'Contratista'}</p>
            </div>

            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Link href="/contractor/dashboard/explore">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Explorar solicitudes
                </Button>
              </Link>
            </div>
          </header>

          <Tabs defaultValue="assigned">
            <TabsList className="mb-6">
              <TabsTrigger value="assigned">Solicitudes asignadas</TabsTrigger>
              <TabsTrigger value="in-progress">En progreso</TabsTrigger>
              <TabsTrigger value="completed">Completadas</TabsTrigger>
            </TabsList>

            <TabsContent value="assigned">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Solicitudes asignadas</h2>

                {loading ? (
                  <p className="text-center py-8">Cargando solicitudes...</p>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : assignedRequests.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No tienes solicitudes asignadas
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Explora las solicitudes disponibles para encontrar trabajos que puedas
                      realizar.
                    </p>
                    <Link href="/contractor/dashboard/explore">
                      <Button>Explorar solicitudes disponibles</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {assignedRequests.map((request) => (
                      <Card key={request.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{request.requestTitle}</CardTitle>
                              <CardDescription>
                                ID: {request.requestId} • {formatDate(request.createdAt)}
                              </CardDescription>
                            </div>
                            {getStatusBadge(request.status)}
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

                              <p className="text-sm line-clamp-2">{request.description}</p>
                            </div>

                            <Separator />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-col text-sm">
                                <span className="font-medium">Cliente:</span>
                                <span>{request.customerInfo.fullName}</span>
                              </div>

                              <div className="flex flex-col text-sm">
                                <span className="font-medium">Ubicación:</span>
                                <span className="truncate max-w-xs">
                                  {request.location.formattedAddress}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-2">
                          <Link
                            href={`/contractor/dashboard/request/${request.id}`}
                            className="w-full"
                          >
                            <Button variant="outline" className="w-full">
                              Ver detalles
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="in-progress">
              <div className="text-center py-12 bg-white rounded-lg border">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No hay solicitudes en progreso
                </h3>
                <p className="text-gray-500">
                  Cuando comiences a trabajar en una solicitud, aparecerá aquí.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-center py-12 bg-white rounded-lg border">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No hay solicitudes completadas
                </h3>
                <p className="text-gray-500">
                  Las solicitudes que finalices se mostrarán en esta sección.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
