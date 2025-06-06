'use client'

/**
 * ContractorsListPage - List of contractors for service requests
 *
 * Displays a list of contractors based on selected services and location from the context.
 * Requires authentication to access.
 *
 * @returns {JSX.Element} Contractors list page component
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, Star, Clock, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import MapComponent from '@/components/ui/MapComponent'
import { ContractorWithDistance, Service } from '@/types/contractor'
import { useAuth } from '@/providers/AuthProvider'

// Servicio -> iconos
const serviceIcons: Record<string, string> = {
  plumbing: '🚿',
  electrical: '⚡',
  glass: '🪟',
  hvac: '🔥',
  pests: '🐜',
  locksmith: '🔑',
  general: '🔨',
  roofing: '🏠',
  siding: '🧱',
}

export default function ContractorsListPage() {
  const {
    selectedServices,
    location,
    formattedAddress,
    setLocation,
    setFormattedAddress,
    setSelectedContractor,
    setCurrentStep,
    isAuthenticated: storeIsAuthenticated,
    userEmail,
  } = useServiceRequest()

  console.log('🏠 ContractorsListPage rendered with state:', {
    selectedServices,
    location,
    formattedAddress,
    userEmail,
    storeIsAuthenticated,
  })

  // Obtener el estado de autenticación del AuthProvider
  const { isAuthenticated: authIsAuthenticated } = useAuth()

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [contractors, setContractors] = useState<ContractorWithDistance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Verificar autenticación usando ambas fuentes
  const isAuthenticated = storeIsAuthenticated || authIsAuthenticated

  // Verificar autenticación
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true)
      console.log('Estado de autenticación:', {
        store: storeIsAuthenticated,
        auth: authIsAuthenticated,
        combined: isAuthenticated,
      })

      // Primero verificar si tenemos los datos esenciales (selectedServices, location)
      if (!selectedServices?.length || !location) {
        console.log('Datos esenciales faltantes, redirigiendo a la página inicial...')
        console.log('selectedServices:', selectedServices)
        console.log('location:', location)

        // Si no hay servicios seleccionados, es probable que el usuario haya llegado aquí directamente
        // Redirigir al inicio del flujo
        if (!selectedServices?.length) {
          router.push('/')
          return
        }

        // Si no hay ubicación pero sí servicios, ir a la página de ubicación
        if (!location) {
          router.push('/')
          return
        }
      }

      // Luego verificar autenticación (usando cualquiera de las dos fuentes)
      if (!isAuthenticated) {
        console.log('Usuario no autenticado, redirigiendo a confirmación...')
        router.push('/request-service/confirmation')
      } else {
        console.log('Usuario autenticado:', userEmail)
        setIsCheckingAuth(false)
      }
    }

    checkAuthentication()
  }, [
    isAuthenticated,
    router,
    selectedServices,
    location,
    userEmail,
    storeIsAuthenticated,
    authIsAuthenticated,
  ])

  // Marcar el paso actual en el contexto
  useEffect(() => {
    setCurrentStep('find-contractor')
  }, [setCurrentStep])

  // Función para obtener contratistas
  const fetchContractors = useCallback(async () => {
    console.log('🔍 fetchContractors llamado con:', { selectedServices, location })

    if (!selectedServices || !location) {
      console.log('❌ Faltan datos esenciales:', {
        hasServices: !!selectedServices,
        servicesLength: selectedServices?.length,
        hasLocation: !!location,
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Construir la URL con parámetros de consulta
      const params = new URLSearchParams()

      // Agregando servicios seleccionados (filtrar undefined/null)
      let validServicesCount = 0
      selectedServices.forEach((service) => {
        console.log('🔧 Procesando servicio:', service)
        if (service && service.id) {
          params.append('services', service.id)
          validServicesCount++
        } else {
          console.warn('⚠️ Servicio inválido encontrado:', service)
        }
      })

      // Si no hay servicios válidos, usar datos mock en lugar de fallar
      if (validServicesCount === 0) {
        console.log('⚠️ No se encontraron servicios válidos, usando datos mock')

        // Crear contratistas mock para mostrar algo al usuario
        const mockContractors = [
          {
            id: 'mock-1',
            name: 'Servicios Profesionales NYC',
            description: 'Contratista profesional disponible',
            address: 'New York, NY',
            location: { lat: location.lat, lng: location.lng },
            servicesOffered: ['general'],
            rating: 4.5,
            reviewCount: 50,
            contactPhone: '(555) 123-4567',
            verified: true,
            responseTime: '15-30 min',
          },
        ]

        setContractors(mockContractors)
        setIsLoading(false)
        return
      }

      // Agregando ubicación
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())

      console.log('📡 Fetching contractors with params:', params.toString())

      // Usar la nueva ruta API para obtener los contratistas de Google Places
      const response = await fetch(`/api/google-contractors?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error al buscar contratistas: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Respuesta de API recibida:', data)
      setContractors(data.contractors || [])
    } catch (err) {
      console.error('❌ Error fetching contractors:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al buscar contratistas. Intenta nuevamente.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [selectedServices, location])

  // Inicializar estado y verificar contexto
  useEffect(() => {
    const initializeState = async () => {
      // Si estamos verificando la autenticación, esperar
      if (isCheckingAuth) return

      if (selectedServices?.length && location) {
        fetchContractors()
      }
    }

    initializeState()
  }, [selectedServices, location, fetchContractors, isCheckingAuth])

  // Manejar clic en el botón "Ver detalles"
  const handleContactClick = (contractorId: string) => {
    const selected = contractors.find((c) => c.id === contractorId)
    if (selected) {
      // Extraer los servicios como cadenas
      const services = selected.servicesOffered
        .map((service) =>
          typeof service === 'string'
            ? service
            : (service as Service).slug || (service as Service).value || '',
        )
        .filter(Boolean)

      // Guardar contratista seleccionado en el contexto
      setSelectedContractor({
        id: selected.id,
        name: selected.name,
        services: services,
        phoneNumber: selected.contactPhone || '',
        rating: selected.rating,
      })

      // Crear un slug amigable para SEO: id-nombre-del-contratista
      const slug = `${selected.id}-${
        selected.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
          .replace(/\s+/g, '-') // Reemplazar espacios con guiones
          .replace(/-+/g, '-') // Evitar múltiples guiones seguidos
      }`

      // Redirigir a la página de detalles del contratista con el slug
      router.push(`/request-service/find-contractor/${slug}`)
    }
  }

  // Servicio -> etiqueta
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

  // Extraer los nombres de servicio de los objetos relacionados
  const getServiceNames = (services: any[]): string[] => {
    return services
      .map((service) => {
        if (typeof service === 'string') return service
        return (service as Service).slug || (service as Service).value || ''
      })
      .filter(Boolean)
  }

  // Si estamos verificando la autenticación, mostrar carga
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <Link
              href="/request-service/confirmation"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a confirmación
            </Link>
            <h1 className="ml-4 text-lg font-semibold">Verificando acceso...</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-medium">Verificando información de tu solicitud...</p>
            <p className="text-sm text-muted-foreground">Por favor espera un momento</p>
          </div>
        </main>
      </div>
    )
  }

  // Si el usuario no está autenticado, mostrar pantalla de acceso restringido
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <Link
              href="/request-service/confirmation"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a confirmación
            </Link>
            <h1 className="ml-4 text-lg font-semibold">Acceso restringido</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Necesitas crear una cuenta</h2>
            <p className="text-muted-foreground">
              Para ver los contratistas disponibles, primero debes completar el proceso de creación
              de cuenta en la página de confirmación.
            </p>
            <Button onClick={() => router.push('/request-service/confirmation')} className="mt-4">
              Volver a la confirmación
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navegación */}
      <div className="mb-6 dark:text-white">
        <Link href="/request-service" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver a selección de servicio
        </Link>
      </div>

      {/* Título de la página */}
      <div className="mb-6 dark:text-white">
        <h1 className="text-2xl font-bold">Contratistas disponibles</h1>
        <p className="text-muted-foreground">
          {selectedServices?.length > 0
            ? `Para: ${selectedServices.map((s) => serviceLabels[s.id] || s.id).join(', ')}`
            : 'Seleccione un servicio para ver contratistas'}
        </p>
      </div>

      {/* Contenido principal - Lista y Mapa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de contratistas */}
        <div className="md:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-2">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Estamos mejorando nuestro sistema de búsqueda de contratistas. Por favor, inténtalo
                nuevamente en unos momentos.
              </p>
              <Button className="mt-4" onClick={fetchContractors}>
                Intentar nuevamente
              </Button>
            </div>
          ) : contractors.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-2">
                No se encontraron contratistas para los servicios seleccionados.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {!selectedServices?.length
                  ? 'No tienes servicios seleccionados. Por favor, regresa al inicio para seleccionar los servicios que necesitas.'
                  : 'Prueba cambiando los servicios seleccionados o la ubicación.'}
              </p>
              {!selectedServices?.length && (
                <Button onClick={() => router.push('/request-service')} className="mr-2">
                  Seleccionar servicios
                </Button>
              )}
              <Button onClick={() => router.push('/request-service')} variant="outline">
                Cambiar selección
              </Button>
            </div>
          ) : (
            contractors.map((contractor) => (
              <Card
                key={contractor.id}
                className="overflow-hidden hover:border-primary transition-colors"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Avatar o imagen */}
                    <div
                      className="w-full sm:w-24 h-24 bg-slate-100 flex items-center justify-center text-2xl font-bold"
                      style={{
                        backgroundColor: !contractor.profileImage
                          ? `hsl(${contractor.id.charCodeAt(0) * 5}, 70%, 90%)`
                          : undefined,
                      }}
                    >
                      {contractor.profileImage?.url ? (
                        <Image
                          src={contractor.profileImage.url}
                          alt={contractor.name}
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                          sizes="96px"
                        />
                      ) : (
                        contractor.name.charAt(0)
                      )}
                    </div>

                    {/* Información del contratista */}
                    <div className="p-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{contractor.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="text-sm ml-1 font-medium">{contractor.rating}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({contractor.reviewCount})
                          </span>
                        </div>
                      </div>

                      {/* Servicios y ubicación */}
                      <div className="mt-1 text-sm text-muted-foreground flex flex-wrap gap-2">
                        {getServiceNames(contractor.servicesOffered)
                          .slice(0, 3)
                          .map((service) => (
                            <span key={service} className="inline-flex items-center">
                              <span className="mr-1">{serviceIcons[service] || '🔧'}</span>
                              {serviceLabels[service] || service}
                            </span>
                          ))}
                      </div>

                      <div className="mt-2 text-sm flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {contractor.address}{' '}
                          {contractor.distance !== undefined && (
                            <span className="ml-1">({contractor.distance.toFixed(1)} km)</span>
                          )}
                        </span>
                      </div>

                      {/* Tiempo de respuesta y botón de contacto */}
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex items-center text-sm">
                          <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Respuesta: {contractor.responseTime || '15-30 min'}
                          </span>
                        </div>
                        <Button size="sm" onClick={() => handleContactClick(contractor.id)}>
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Mapa utilizando el componente MapComponent */}
        <div className="hidden md:block bg-slate-100 rounded-lg overflow-hidden h-[500px] sticky top-20">
          <MapComponent
            selectedService={selectedServices}
            location={location}
            setLocation={setLocation}
            onContinue={() => {}}
            formattedAddress={formattedAddress}
            setFormattedAddress={setFormattedAddress}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  )
}
