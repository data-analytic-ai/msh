/**
 * useServiceRequests - Service requests data fetching hook
 *
 * Custom hook that handles fetching and filtering service requests.
 * Encapsulates all data fetching logic away from the UI components.
 *
 * @param {string} contractorId - ID of the current contractor
 * @returns {Object} - Service requests data and filter management functions
 */
import { useState, useEffect, useCallback } from 'react'
import { ServiceRequest } from '../types/ServiceRequest'

interface UseServiceRequestsProps {
  contractorId?: string
}

interface UseServiceRequestsReturn {
  requests: ServiceRequest[]
  filteredRequests: ServiceRequest[]
  loading: boolean
  error: string | null
  searchTerm: string
  serviceFilters: string[]
  urgencyFilter: string[]
  statusFilter: string[]
  setSearchTerm: (value: string) => void
  setServiceFilters: (services: string[]) => void
  setUrgencyFilter: (urgencies: string[]) => void
  setStatusFilter: (statuses: string[]) => void
  refreshRequests: () => Promise<void>
}

export const useServiceRequests = ({
  contractorId,
}: UseServiceRequestsProps): UseServiceRequestsReturn => {
  // Estado para solicitudes y filtros
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilters, setServiceFilters] = useState<string[]>([])
  const [urgencyFilter, setUrgencyFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  // Función para obtener solicitudes
  const fetchServiceRequests = useCallback(async () => {
    if (!contractorId) return

    setLoading(true)
    setError(null)

    try {
      // Construir URL base para el endpoint de PayloadCMS
      const url = new URL('/api/service-requests', window.location.origin)

      // Añadir parámetros de filtro
      const params = new URLSearchParams()

      // Construir consulta para PayloadCMS
      const where: any = {}

      // Obtener servicios del contratista
      if (contractorId) {
        try {
          const contractorResponse = await fetch(`/api/users/${contractorId}`, {
            credentials: 'include',
          })

          if (contractorResponse.ok) {
            const contractorData = await contractorResponse.json()
            // Verificar si el contratista tiene servicios definidos
            if (contractorData?.services?.length > 0) {
              where.serviceType = {
                in: contractorData.services,
              }
            }
          }
        } catch (error) {
          console.error('Error al obtener datos del contratista:', error)
        }
      }

      // Añadir filtros si existen
      if (statusFilter.length > 0) {
        where.status = { in: statusFilter }
      }

      if (serviceFilters.length > 0) {
        where.serviceType = { in: serviceFilters }
      }

      if (urgencyFilter.length > 0) {
        where.urgencyLevel = { in: urgencyFilter }
      }

      // Convertir filtros a string JSON y añadirlos como parámetro 'where'
      params.append('where', JSON.stringify(where))
      params.append('depth', '2')
      params.append('sort', '-createdAt')

      // Añadir parámetros a la URL
      url.search = params.toString()

      console.log('Realizando petición a:', url.toString())

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Error al cargar solicitudes: ${response.status} - ${errorText || response.statusText}`,
        )
      }

      const data = await response.json()

      if (!data.docs) {
        throw new Error('Formato de respuesta inesperado - no se encontró docs en la respuesta')
      }

      setRequests(data.docs)

      // Aplicar filtro de búsqueda de texto si existe
      if (searchTerm.trim() === '') {
        setFilteredRequests(data.docs)
      } else {
        filterRequestsBySearchTerm(data.docs, searchTerm)
      }
    } catch (err) {
      console.error('Error al cargar solicitudes:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes')
      setRequests([])
      setFilteredRequests([])
    } finally {
      setLoading(false)
    }
  }, [contractorId, statusFilter, serviceFilters, urgencyFilter, searchTerm])

  // Función para filtrar por término de búsqueda
  const filterRequestsBySearchTerm = (requests: ServiceRequest[], term: string) => {
    if (!term.trim()) {
      setFilteredRequests(requests)
      return
    }

    const searchLower = term.toLowerCase()
    const filtered = requests.filter(
      (request) =>
        request.requestTitle?.toLowerCase().includes(searchLower) ||
        request.description?.toLowerCase().includes(searchLower) ||
        request.location?.formattedAddress?.toLowerCase().includes(searchLower),
    )

    setFilteredRequests(filtered)
  }

  // Efecto para actualizar el filtro de búsqueda cuando cambie el término
  useEffect(() => {
    filterRequestsBySearchTerm(requests, searchTerm)
  }, [searchTerm, requests])

  // Efecto para cargar solicitudes cuando cambien los filtros
  useEffect(() => {
    if (contractorId) {
      fetchServiceRequests()
    }
  }, [fetchServiceRequests, contractorId])

  return {
    requests,
    filteredRequests,
    loading,
    error,
    searchTerm,
    serviceFilters,
    urgencyFilter,
    statusFilter,
    setSearchTerm,
    setServiceFilters,
    setUrgencyFilter,
    setStatusFilter,
    refreshRequests: fetchServiceRequests,
  }
}
