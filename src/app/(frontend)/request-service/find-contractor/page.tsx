'use client'

/**
 * ContractorsListPage - List of contractors for service requests
 *
 * Displays a list of contractors based on selected services and location from the context.
 * Uses Google Maps to show contractors on a map and provides a list view.
 *
 * @returns {JSX.Element} Contractors list page component
 */

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/context/ServiceRequestContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, Phone, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { GoogleMap, useLoadScript, Marker, Libraries } from '@react-google-maps/api'
import { Contractor } from '@/types/contractor'

// Extendiendo la interfaz Location para incluir distancia
interface LocationWithDistance {
  lat: number
  lng: number
  distance?: number
}

// Tipo para contratistas en la UI, extendiendo el tipo base
type UIContractor = Omit<Contractor, 'location'> & {
  firstName?: string
  lastName?: string
  avatar?: string
  phoneNumber?: string
  responseTime?: string
  location: LocationWithDistance
}

// Configuración de bibliotecas de Google Maps
const libraries: Libraries = ['places']

// Estilo del contenedor del mapa
const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

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
  const { selectedServices, location, setSelectedContractor } = useServiceRequest()

  const [contractors, setContractors] = useState<UIContractor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null)
  const router = useRouter()
  const mapRef = useRef<google.maps.Map | null>(null)

  // Cargar el script de Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  // Cargar contratistas cercanos usando Google Places API
  useEffect(() => {
    // Si no hay servicio o ubicación, redireccionar a la página principal
    if (!selectedServices || selectedServices.length === 0 || !location) {
      router.replace('/')
      return
    }

    const getContractors = async () => {
      setIsLoading(true)
      try {
        // Primero intentamos obtener contratistas de nuestra base de datos
        const response = await fetch(
          `/api/contractors?services=${selectedServices.join(',')}&lat=${location.lat}&lng=${location.lng}`,
        )

        if (response.ok) {
          const data = await response.json()
          if (data.contractors && data.contractors.length > 0) {
            const mappedContractors: UIContractor[] = data.contractors.map((c: any) => ({
              ...c,
              firstName: c.name?.split(' ')[0] || '',
              lastName: c.name?.split(' ').slice(1).join(' ') || '',
              phoneNumber: c.contactPhone,
              responseTime: '15-30 min',
              location: {
                ...c.location,
                distance: c.distance || Math.random() * 5,
              },
            }))
            setContractors(mappedContractors)
            setIsLoading(false)
            return
          }
        }

        // Si no hay contratistas en nuestra base de datos, usamos Google Places API
        if (!isLoaded || !window.google) {
          console.log('Esperando a que Google Maps se cargue...')
          return
        }

        // Mapear servicios a términos de búsqueda para Google Places
        const serviceTerms = {
          plumbing: 'plumber',
          electrical: 'electrician',
          glass: 'glass repair',
          hvac: 'hvac contractor',
          pests: 'pest control',
          locksmith: 'locksmith',
          roofing: 'roofing contractor',
          siding: 'siding contractor',
          general: 'general contractor',
        }

        // Tomar el primer servicio seleccionado como término principal de búsqueda
        const primaryService = selectedServices[0] || 'general'
        const searchTerm =
          serviceTerms[primaryService as keyof typeof serviceTerms] || primaryService

        // Crear servicio de Places
        const placesService = new google.maps.places.PlacesService(document.createElement('div'))

        // Configurar búsqueda
        const request = {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 5000, // 5km
          type: 'business', // Negocios
          keyword: searchTerm, // Término específico para el servicio
        }

        // Ejecutar búsqueda
        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            console.log('Resultados Google Places:', results)

            // Convertir resultados de Google Places a formato de contratistas
            const googleContractors: UIContractor[] = results.map(
              (place: google.maps.places.PlaceResult) => {
                const placeLocation = place.geometry?.location
                const distanceEstimate = Math.random() * 5 // Simulación entre 0-5km

                // Guardar en sessionStorage para uso futuro
                if (place.place_id) {
                  sessionStorage.setItem(`place_${place.place_id}_name`, place.name || '')
                  sessionStorage.setItem(`place_${place.place_id}_vicinity`, place.vicinity || '')
                  sessionStorage.setItem(
                    `place_${place.place_id}_lat`,
                    String(placeLocation?.lat() || 0),
                  )
                  sessionStorage.setItem(
                    `place_${place.place_id}_lng`,
                    String(placeLocation?.lng() || 0),
                  )
                  sessionStorage.setItem(
                    `place_${place.place_id}_rating`,
                    String(place.rating || 0),
                  )
                  sessionStorage.setItem(
                    `place_${place.place_id}_reviews`,
                    String(place.user_ratings_total || 0),
                  )
                }

                // Crear contratista con datos de Google Places
                return {
                  id: place.place_id || String(Math.random()),
                  name: place.name || 'Sin nombre',
                  firstName: place.name?.split(' ')[0] || '',
                  lastName: place.name?.split(' ').slice(1).join(' ') || '',
                  description: place.vicinity || '',
                  contactEmail: '',
                  contactPhone: '',
                  website: '',
                  address: place.vicinity || '',
                  location: {
                    lat: placeLocation?.lat() || 0,
                    lng: placeLocation?.lng() || 0,
                    distance: distanceEstimate,
                  },
                  servicesOffered: selectedServices,
                  yearsExperience: 0,
                  rating: place.rating || 0,
                  reviewCount: place.user_ratings_total || 0,
                  avatar: '',
                  phoneNumber: '',
                  responseTime: '15-30 min',
                  verified: place.business_status === 'OPERATIONAL',
                }
              },
            )

            // Guardar contratistas recientes en sessionStorage
            sessionStorage.setItem('recent_contractors', JSON.stringify(googleContractors))

            setContractors(googleContractors)
          } else {
            console.error('Error en Google Places:', status)
            // Usar fallback con datos simulados
            setContractors([
              {
                id: '1',
                name: 'Juan García',
                firstName: 'Juan',
                lastName: 'García',
                description: 'Plomero profesional con experiencia en todo tipo de instalaciones.',
                contactEmail: 'juan@example.com',
                contactPhone: '+1 555-123-4567',
                address: '123 Calle Principal',
                location: {
                  lat: location.lat + 0.01,
                  lng: location.lng - 0.005,
                  distance: 2.3,
                },
                servicesOffered: ['plumbing', 'electrical'],
                yearsExperience: 8,
                rating: 4.8,
                reviewCount: 172,
                avatar: '/avatars/contractor1.jpg',
                phoneNumber: '+1 555-123-4567',
                responseTime: '15 min',
                verified: true,
              },
              {
                id: '2',
                name: 'María Rodríguez',
                firstName: 'María',
                lastName: 'Rodríguez',
                description: 'Especialista en instalaciones eléctricas y aire acondicionado.',
                contactEmail: 'maria@example.com',
                contactPhone: '+1 555-987-6543',
                address: '456 Avenida Central',
                location: {
                  lat: location.lat - 0.008,
                  lng: location.lng + 0.01,
                  distance: 3.7,
                },
                servicesOffered: ['hvac', 'electrical'],
                yearsExperience: 5,
                rating: 4.6,
                reviewCount: 98,
                avatar: '/avatars/contractor2.jpg',
                phoneNumber: '+1 555-987-6543',
                responseTime: '30 min',
                verified: true,
              },
            ])
          }
          setIsLoading(false)
        })
      } catch (error) {
        console.error('Error buscando contratistas:', error)
        // Datos fallback para casos de error
        setContractors([
          {
            id: '1',
            name: 'Juan García',
            firstName: 'Juan',
            lastName: 'García',
            description: 'Plomero profesional con experiencia en todo tipo de instalaciones.',
            contactEmail: 'juan@example.com',
            contactPhone: '+1 555-123-4567',
            address: '123 Calle Principal',
            location: {
              lat: location.lat + 0.01,
              lng: location.lng - 0.005,
              distance: 2.3,
            },
            servicesOffered: ['plumbing', 'electrical'],
            yearsExperience: 8,
            rating: 4.8,
            reviewCount: 172,
            avatar: '/avatars/contractor1.jpg',
            phoneNumber: '+1 555-123-4567',
            responseTime: '15 min',
            verified: true,
          },
          {
            id: '2',
            name: 'María Rodríguez',
            firstName: 'María',
            lastName: 'Rodríguez',
            description: 'Especialista en instalaciones eléctricas y aire acondicionado.',
            contactEmail: 'maria@example.com',
            contactPhone: '+1 555-987-6543',
            address: '456 Avenida Central',
            location: {
              lat: location.lat - 0.008,
              lng: location.lng + 0.01,
              distance: 3.7,
            },
            servicesOffered: ['hvac', 'electrical'],
            yearsExperience: 5,
            rating: 4.6,
            reviewCount: 98,
            avatar: '/avatars/contractor2.jpg',
            phoneNumber: '+1 555-987-6543',
            responseTime: '30 min',
            verified: true,
          },
        ])
        setIsLoading(false)
      }
    }

    getContractors()
  }, [selectedServices, location, router, isLoaded])

  // Configurar mapa cuando se carga
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }

  // Manejar clic en el botón "Contactar"
  const handleContactClick = (contractorId: string) => {
    const selected = contractors.find((c) => c.id === contractorId)
    if (selected) {
      // Guardar contratista seleccionado en el contexto
      setSelectedContractor({
        id: selected.id,
        name: selected.name,
        lastName: selected.lastName || '',
        services: selected.servicesOffered,
        phoneNumber: selected.phoneNumber || selected.contactPhone,
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

  // Si no hay servicios seleccionados, mostrar mensaje
  if (!selectedServices || selectedServices.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <h2 className="text-xl font-semibold">No hay servicios seleccionados</h2>
          <p className="text-muted-foreground max-w-md">
            Para ver contratistas disponibles, primero seleccione un tipo de servicio.
          </p>
          <Button asChild>
            <Link href="/">Seleccionar servicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Si el mapa no está cargado, mostrar carga
  if (loadError) {
    console.error('Error cargando mapa:', loadError)
  }

  // Calcular centro del mapa basado en la ubicación actual
  const center = location
    ? { lat: location.lat, lng: location.lng }
    : { lat: 40.7128, lng: -74.006 } // NYC por defecto

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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navegación */}
      <div className="mb-6">
        <Link href="/request-service" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver a selección de servicio
        </Link>
      </div>

      {/* Título de la página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contratistas disponibles</h1>
        <p className="text-muted-foreground">
          {selectedServices.length > 0
            ? `Para: ${selectedServices.map((s) => serviceLabels[s]).join(', ')}`
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
          ) : contractors.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No se encontraron contratistas para los servicios seleccionados.
              </p>
            </div>
          ) : (
            contractors.map((contractor) => (
              <Card
                key={contractor.id}
                className={`overflow-hidden hover:border-primary transition-colors ${
                  selectedContractorId === contractor.id ? 'border-primary' : ''
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Avatar o imagen */}
                    <div
                      className="w-full sm:w-24 h-24 bg-slate-100 flex items-center justify-center text-2xl font-bold"
                      style={{
                        backgroundColor: contractor.avatar
                          ? undefined
                          : `hsl(${contractor.id.charCodeAt(0) * 5}, 70%, 90%)`,
                      }}
                    >
                      {contractor.avatar ? (
                        <Image
                          src={contractor.avatar}
                          alt={contractor.name}
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                          sizes="96px"
                        />
                      ) : (
                        contractor.firstName?.charAt(0) || 'C'
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
                        {contractor.servicesOffered.slice(0, 3).map((service) => (
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
                          {contractor.location.distance && (
                            <span className="ml-1">
                              ({contractor.location.distance.toFixed(1)} km)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Tiempo de respuesta y botón de contacto */}
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex items-center text-sm">
                          <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Respuesta: {contractor.responseTime}
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

        {/* Mapa */}
        <div className="hidden md:block bg-slate-100 rounded-lg overflow-hidden h-[500px] sticky top-20">
          {!isLoaded ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Cargando mapa...</p>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              onLoad={onMapLoad}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {/* Marcador de ubicación actual */}
              {location && (
                <Marker
                  position={{ lat: location.lat, lng: location.lng }}
                  icon={{
                    url: '/icons/home-marker.svg',
                    scaledSize: new google.maps.Size(40, 40),
                  }}
                />
              )}

              {/* Marcadores de contratistas */}
              {contractors.map((contractor) => (
                <Marker
                  key={contractor.id}
                  position={{
                    lat: contractor.location.lat,
                    lng: contractor.location.lng,
                  }}
                  onClick={() => setSelectedContractorId(contractor.id)}
                  icon={{
                    url:
                      selectedContractorId === contractor.id
                        ? '/icons/selected-contractor.svg'
                        : '/icons/contractor-marker.svg',
                    scaledSize: new google.maps.Size(30, 30),
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  )
}
