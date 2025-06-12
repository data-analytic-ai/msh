/**
 * ServiceRequestsList - Enhanced service requests display component
 *
 * Shows service requests in a clean, organized layout with filtering,
 * sorting, and quick actions for better user experience.
 */
'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Eye,
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
  Wrench,
  Filter,
  Search,
  Plus,
  ArrowUpDown,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServiceRequest } from '@/hooks/useDashboardData'

interface ServiceRequestsListProps {
  requests: ServiceRequest[]
  isLoading?: boolean
  className?: string
  showFilters?: boolean
  maxItems?: number
}

type SortOption = 'newest' | 'oldest' | 'status' | 'urgency'
type FilterOption = 'all' | 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'

/**
 * ServiceRequestsList - Main service requests list component
 *
 * @param requests - Array of service requests
 * @param isLoading - Whether data is loading
 * @param className - Additional CSS classes
 * @param showFilters - Whether to show filter controls
 * @param maxItems - Maximum number of items to show
 * @returns Service requests list component
 */
export const ServiceRequestsList: React.FC<ServiceRequestsListProps> = ({
  requests,
  isLoading = false,
  className = '',
  showFilters = true,
  maxItems,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Get urgency level styling
  const getUrgencyBadge = (urgencyLevel: string) => {
    const urgencyStyles = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }

    const urgencyLabels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      emergency: 'Emergencia',
    }

    return (
      <Badge
        variant="outline"
        className={urgencyStyles[urgencyLevel as keyof typeof urgencyStyles]}
      >
        {urgencyLabels[urgencyLevel as keyof typeof urgencyLabels]}
      </Badge>
    )
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }

    const statusLabels = {
      pending: 'Pendiente',
      assigned: 'Asignada',
      'in-progress': 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    }

    return (
      <Badge variant="outline" className={statusStyles[status as keyof typeof statusStyles]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.requestTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.serviceType.some((type) =>
            type.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          request.location.formattedAddress.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        case 'urgency':
          const urgencyOrder = { emergency: 0, high: 1, medium: 2, low: 3 }
          return (
            urgencyOrder[a.urgencyLevel as keyof typeof urgencyOrder] -
            urgencyOrder[b.urgencyLevel as keyof typeof urgencyOrder]
          )
        default:
          return 0
      }
    })

    return maxItems ? sorted.slice(0, maxItems) : sorted
  }, [requests, searchTerm, statusFilter, sortBy, maxItems])

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Mis Solicitudes de Servicio</h3>
            {requests.length > 0 && (
              <Badge variant="secondary">
                {filteredAndSortedRequests.length} de {requests.length}
              </Badge>
            )}
          </div>

          <Link href="/request-service">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Solicitud
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        {showFilters && requests.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar solicitudes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value: FilterOption) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="assigned">Asignada</SelectItem>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="status">Por estado</SelectItem>
                  <SelectItem value="urgency">Por urgencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Requests List */}
      {filteredAndSortedRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {requests.length === 0
                ? 'No tienes solicitudes aún'
                : 'No se encontraron solicitudes'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {requests.length === 0
                ? 'Comienza creando tu primera solicitud de servicio'
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
            {requests.length === 0 && (
              <Link href="/request-service">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Solicitud
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedRequests.map((request) => {
            const hasQuotes = request.quotes && request.quotes.length > 0
            const quotesCount = request.quotes?.length || 0
            const pendingQuotes = request.quotes?.filter((q) => q.status === 'pending') || []
            const acceptedQuote = request.quotes?.find((q) => q.status === 'accepted')

            return (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{request.requestTitle}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {request.location.formattedAddress}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgencyLevel)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      {request.serviceType.join(', ')}
                    </div>
                  </div>

                  {hasQuotes && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Cotizaciones Recibidas</span>
                        <Badge variant="outline">
                          {quotesCount} cotización{quotesCount !== 1 ? 'es' : ''}
                        </Badge>
                      </div>

                      {pendingQuotes.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {pendingQuotes.length} cotización
                            {pendingQuotes.length !== 1 ? 'es' : ''} pendiente
                            {pendingQuotes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {acceptedQuote && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Cotización aceptada: ${acceptedQuote.amount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <Link href={`/request-service/dashboard/${request.id}`} className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Show More Button */}
      {maxItems && requests.length > maxItems && (
        <div className="text-center">
          <Link href="/request-service/dashboard#requests">
            <Button variant="outline">Ver todas las solicitudes ({requests.length})</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ServiceRequestsList
