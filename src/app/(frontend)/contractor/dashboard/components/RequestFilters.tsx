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
    <div className="bg-background dark:bg-background rounded-lg border p-4 mb-6 text-foreground dark:text-foreground">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar solicitudes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Filtro de servicios */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Servicios</span>
                <span className="sm:hidden">Svc</span>
                {serviceFilters.length > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs min-w-[1.25rem]">
                    {serviceFilters.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" />
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
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Urgencia</span>
                <span className="sm:hidden">Urg</span>
                {urgencyFilter.length > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs min-w-[1.25rem]">
                    {urgencyFilter.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" />
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
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Estado</span>
                <span className="sm:hidden">Est</span>
                {statusFilter.length > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs min-w-[1.25rem]">
                    {statusFilter.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" />
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

          {/* Clear Filters Button */}
          {(serviceFilters.length > 0 ||
            urgencyFilter.length > 0 ||
            statusFilter.length > 0 ||
            searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange('')
                onServiceFilterChange([])
                onUrgencyFilterChange([])
                onStatusFilterChange([])
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
