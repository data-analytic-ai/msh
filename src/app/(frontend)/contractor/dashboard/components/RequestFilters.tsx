'use client'

/**
 * RequestFilters Component
 *
 * Filter controls for service requests in the contractor dashboard.
 * Includes search, service type filter, urgency filter, and status filter.
 *
 * @returns {JSX.Element} Request filters UI
 */
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Filter, Clock, Search, CheckCircle } from 'lucide-react'

interface RequestFiltersProps {
  searchTerm: string
  serviceFilters: string[]
  urgencyFilter: string[]
  statusFilter: string[]
  onSearchChange: (value: string) => void
  onServiceFilterChange: (services: string[]) => void
  onUrgencyFilterChange: (urgencies: string[]) => void
  onStatusFilterChange: (statuses: string[]) => void
}

export const RequestFilters: React.FC<RequestFiltersProps> = ({
  searchTerm,
  serviceFilters,
  urgencyFilter,
  statusFilter,
  onSearchChange,
  onServiceFilterChange,
  onUrgencyFilterChange,
  onStatusFilterChange,
}) => {
  // Lista de servicios disponibles
  const availableServices = [
    { label: 'Plomería', value: 'plumbing' },
    { label: 'Electricidad', value: 'electrical' },
    { label: 'Vidrios', value: 'glass' },
    { label: 'HVAC', value: 'hvac' },
    { label: 'Control de Plagas', value: 'pests' },
    { label: 'Cerrajería', value: 'locksmith' },
    { label: 'Techado', value: 'roofing' },
    { label: 'Revestimiento', value: 'siding' },
    { label: 'Reparaciones Generales', value: 'general' },
  ]

  // Lista de niveles de urgencia
  const urgencyLevels = [
    { label: 'Baja', value: 'low' },
    { label: 'Media', value: 'medium' },
    { label: 'Alta', value: 'high' },
    { label: 'Emergencia', value: 'emergency' },
  ]

  // Lista de estados
  const statusOptions = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Asignado', value: 'assigned' },
    { label: 'En progreso', value: 'in-progress' },
    { label: 'Completado', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' },
  ]

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar solicitudes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filtro de servicios */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Servicios</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrar por servicio</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableServices.map((service) => (
                <DropdownMenuCheckboxItem
                  key={service.value}
                  checked={serviceFilters.includes(service.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onServiceFilterChange([...serviceFilters, service.value])
                    } else {
                      onServiceFilterChange(serviceFilters.filter((s) => s !== service.value))
                    }
                  }}
                >
                  {service.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro de urgencia */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Urgencia</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrar por urgencia</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {urgencyLevels.map((level) => (
                <DropdownMenuCheckboxItem
                  key={level.value}
                  checked={urgencyFilter.includes(level.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onUrgencyFilterChange([...urgencyFilter, level.value])
                    } else {
                      onUrgencyFilterChange(urgencyFilter.filter((u) => u !== level.value))
                    }
                  }}
                >
                  {level.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro de estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Estado</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={statusFilter.includes(status.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onStatusFilterChange([...statusFilter, status.value])
                    } else {
                      onStatusFilterChange(statusFilter.filter((s) => s !== status.value))
                    }
                  }}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
