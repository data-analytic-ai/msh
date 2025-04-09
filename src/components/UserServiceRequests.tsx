/**
 * UserServiceRequests Component
 *
 * Displays a list of service requests for authenticated users.
 * This component is shown on the home page when a user is logged in.
 * Gets service requests directly from the database via API.
 */
import React, { useEffect, useState, useCallback } from 'react'
import { getMe } from '@/lib/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Wrench, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

type ServiceRequestType = {
  id: string
  requestId: string
  requestTitle: string
  serviceType: string[]
  description: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
  location: {
    formattedAddress: string
  }
  createdAt: string
}

/**
 * useServiceRequests - Custom hook for fetching user service requests
 *
 * Gets all service requests for the currently authenticated user directly from the database.
 *
 * @returns {Object} Service requests data and loading state
 */
const useServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequestType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ email: string | null; authenticated: boolean }>({
    email: null,
    authenticated: false,
  })
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)

  // Fetch current authenticated user
  const getCurrentUser = useCallback(async () => {
    try {
      const { user } = await getMe(true) // Skip cache to ensure we have fresh data
      if (user) {
        setUserInfo({
          email: user.email,
          authenticated: true,
        })
        return user.email
      } else {
        setUserInfo({
          email: null,
          authenticated: false,
        })
        return null
      }
    } catch (err) {
      console.error('Error getting current user:', err)
      setError('Error al verificar el usuario')
      setUserInfo({
        email: null,
        authenticated: false,
      })
      return null
    }
  }, [])

  // Fetch service requests from database
  const fetchRequests = useCallback(async (email: string) => {
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user-requests?email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setRequests(data.requests || [])

      // Check if this is a new user with a temporary password
      if (data.isNewUser && data.tempPassword) {
        setTempPassword(data.tempPassword)
        setIsNewUser(true)
      }
    } catch (err) {
      console.error('Error fetching service requests:', err)
      setError('Error al obtener las solicitudes de servicio')
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load all data
  const loadData = useCallback(async () => {
    const email = await getCurrentUser()
    if (email) {
      await fetchRequests(email)
    }
  }, [getCurrentUser, fetchRequests])

  // Initial load and refresh when needed
  useEffect(() => {
    loadData()

    // Refresh when a new request has been completed
    const handleCompletedRequest = () => {
      const needsRefresh = sessionStorage.getItem('fromCompletedRequest') === 'true'
      if (needsRefresh) {
        loadData()
        sessionStorage.removeItem('fromCompletedRequest')
      }
    }

    handleCompletedRequest()

    // Set up event listener for page visibility changes to refresh data
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadData])

  return {
    requests,
    isLoading,
    error,
    refresh: loadData,
    userInfo,
    tempPassword,
    isNewUser,
  }
}

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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  assigned: 'bg-blue-500',
  'in-progress': 'bg-indigo-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
}

const urgencyColors: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  emergency: 'bg-red-500',
}

export const UserServiceRequests = () => {
  const { requests, isLoading, error, refresh, userInfo, tempPassword, isNewUser } =
    useServiceRequests()

  const [showTempPassword, setShowTempPassword] = useState(false)

  // Show temporary password notification if user is new
  useEffect(() => {
    if (isNewUser && tempPassword) {
      setShowTempPassword(true)
    }
  }, [isNewUser, tempPassword])

  // If user is not authenticated or has no requests, don't render anything
  if (!userInfo.authenticated) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando solicitudes...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refresh()}>
          Reintentar
        </Button>
      </div>
    )
  }

  // Show empty state
  if (requests.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-muted/50 text-center">
        <h3 className="text-xl font-semibold mb-2">No tienes solicitudes de servicio</h3>
        <p className="text-muted-foreground mb-4">
          Cuando solicites un servicio, aparecerá aquí para que puedas hacer seguimiento.
        </p>
        <Link href="/request-service">
          <Button>Solicitar un servicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTempPassword && tempPassword && (
        <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Cuenta creada automáticamente
          </h3>
          <p className="text-yellow-700 mb-2">
            Hemos creado una cuenta para ti basada en tu solicitud de servicio. Por favor, guarda la
            siguiente contraseña temporal:
          </p>
          <div className="flex items-center gap-2 my-2">
            <code className="bg-white px-4 py-2 rounded border font-mono">{tempPassword}</code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(tempPassword || '')
              }}
            >
              Copiar
            </Button>
          </div>
          <p className="text-sm text-yellow-600 mt-2">
            Puedes usar esta contraseña para iniciar sesión y acceder a todas las funciones de tu
            cuenta. Te recomendamos cambiarla lo antes posible desde tu perfil.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setShowTempPassword(false)}
          >
            Entendido
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Service Requests</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refresh()} title="Refresh">
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/request-service">
            <Button>New Request</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{request.requestTitle}</CardTitle>
                <Badge className={`${statusColors[request.status] || 'bg-gray-500'}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {new Date(request.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Wrench className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Service Type</p>
                    <p className="text-sm text-muted-foreground">
                      {request.serviceType.map((type) => serviceNames[type] || type).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                      {request.location.formattedAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Urgency</p>
                    <Badge
                      className={`${urgencyColors[request.urgencyLevel] || 'bg-gray-500'} mt-1`}
                    >
                      {request.urgencyLevel.charAt(0).toUpperCase() + request.urgencyLevel.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Link href={`/request-service/details/${request.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
