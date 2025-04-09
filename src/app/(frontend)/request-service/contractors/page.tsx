'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/context/ServiceRequestContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, Phone, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { GoogleMap, useLoadScript, Marker, Libraries } from '@react-google-maps/api'
import { fetchNearbyContractors } from '@/services/contractorService'
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

// Tipo para el contratista seleccionado
interface SelectedContractorInfo {
  id: string
  name: string
  lastName: string
  services: string[]
  phoneNumber: string
  rating: number
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

export default function ContractorsPage() {
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

  // Buscar contratistas cercanos usando el API
  useEffect(() => {
    // Si no hay servicio o ubicación, redireccionar a la página principal
    if (!selectedServices || !location) {
      router.replace('/')
      return
    }

    const getContractors = async () => {
      setIsLoading(true)
      try {
        // Usar el servicio de fetchNearbyContractors para obtener contratistas
        const apiContractors = await fetchNearbyContractors(selectedServices, location, 5)

        // Transformar los datos a formato UI
        const uiContractors: UIContractor[] = apiContractors.map((contractor) => {
          // Extraer nombre y apellido del nombre completo (si es posible)
          let firstName = ''
          let lastName = ''

          if (contractor.name) {
            const nameParts = contractor.name.split(' ')
            if (nameParts.length > 1) {
              firstName = nameParts[0] || ''
              lastName = nameParts.slice(1).join(' ')
            } else {
              firstName = contractor.name
            }
          }

          return {
            ...contractor,
            firstName,
            lastName,
            avatar: contractor.profileImage,
            phoneNumber: contractor.contactPhone || '', // Asegurar que nunca sea undefined
            // Usar datos dinámicos o placeholder para el tiempo de respuesta
            responseTime: '15-30 min',
            // Aseguramos que location tiene la propiedad distance
            location: {
              ...contractor.location,
              distance: (contractor.location as LocationWithDistance).distance || 0,
            },
          }
        })

        setContractors(uiContractors)
      } catch (error) {
        console.error('Error buscando contratistas:', error)

        // En caso de error, usar datos simulados como fallback
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
      } finally {
        setIsLoading(false)
      }
    }

    getContractors()
  }, [selectedServices, location, router])

  // Actualizar el estado del contratista seleccionado en el contexto
  useEffect(() => {
    if (selectedContractorId) {
      const contractor = contractors.find((c) => c.id === selectedContractorId)
      if (contractor) {
        const contractorInfo: SelectedContractorInfo = {
          id: contractor.id,
          name: contractor.name,
          lastName: contractor.lastName || '',
          services: contractor.servicesOffered,
          phoneNumber: contractor.phoneNumber || contractor.contactPhone || '',
          rating: contractor.rating,
        }
        setSelectedContractor(contractorInfo)
      }
    }
  }, [selectedContractorId, contractors, setSelectedContractor])

  // Centrar el mapa cuando hay un contratista seleccionado
  useEffect(() => {
    if (isLoaded && mapRef.current && selectedContractorId) {
      const contractor = contractors.find((c) => c.id === selectedContractorId)
      if (contractor) {
        mapRef.current.panTo({ lat: contractor.location.lat, lng: contractor.location.lng })
        mapRef.current.setZoom(15)
      }
    }
  }, [selectedContractorId, contractors, isLoaded])

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }

  const handleContactClick = (contractorId: string) => {
    setSelectedContractorId(contractorId)
    // Aquí implementaríamos la lógica para contactar al contratista
    // Ejemplo: Redirección a página de chat o detalles del contratista
    const contractor = contractors.find((c) => c.id === contractorId)
    if (contractor) {
      alert(`Contactando a ${contractor.name}...`)
    }
  }

  if (loadError) return <div className="text-center p-4">Error loading maps</div>
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Buscando contratistas cercanos...</p>
        </div>
      </div>
    )
  }

  if (!selectedServices || !location || selectedServices.length === 0) {
    return <div className="p-4">No hay servicio seleccionado</div>
  }

  // Para simplificar, tomamos el primer servicio seleccionado para mostrar en la UI
  const currentService = selectedServices[0]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="ml-4 text-lg font-semibold">Local Contractors</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Mapa con contratistas */}
        <div className="h-64 relative mb-4">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            mapContainerClassName="bg-background text-secondary"
            center={{ lat: location.lat, lng: location.lng }}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapId: 'map-container',
              clickableIcons: false,
            }}
          >
            {/* Marcador del usuario */}
            <Marker
              position={{ lat: location.lat, lng: location.lng }}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            />

            {/* Marcadores de contratistas */}
            {contractors.map((contractor) => (
              <Marker
                key={contractor.id}
                position={{ lat: contractor.location.lat, lng: contractor.location.lng }}
                onClick={() => setSelectedContractorId(contractor.id)}
                animation={
                  selectedContractorId === contractor.id ? google.maps.Animation.BOUNCE : undefined
                }
              />
            ))}
          </GoogleMap>
        </div>

        {/* Lista de contratistas */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Available Contractors</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-xl mr-1">{serviceIcons[currentService || ''] || '🔧'}</span>
                <span className="font-medium">
                  {currentService
                    ? currentService.charAt(0).toUpperCase() + currentService.slice(1)
                    : 'Service'}
                </span>
              </div>
            </div>
          </div>

          {contractors.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No contractors available for this service in your area.
                </p>
                <Button onClick={() => router.push('/')} className="mt-4" variant="outline">
                  Try another service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contractors.map((contractor) => (
                <Card
                  key={contractor.id}
                  className={`overflow-hidden transition-all ${
                    selectedContractorId === contractor.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedContractorId(contractor.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-full overflow-hidden mr-4 border">
                        {contractor.avatar ? (
                          <Image
                            src={contractor.avatar}
                            alt={contractor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center text-2xl">
                            {contractor.firstName?.charAt(0) || contractor.name.charAt(0)}
                          </div>
                        )}
                        {contractor.verified && (
                          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{contractor.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {contractor.yearsExperience} years of experience
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="font-medium">{contractor.rating}</span>
                            <span className="text-muted-foreground text-xs ml-1">
                              ({contractor.reviewCount})
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{contractor.location.distance} km away</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Response: {contractor.responseTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t px-4 py-3 flex justify-between">
                      <div className="flex gap-1">
                        {contractor.servicesOffered.map((service) => (
                          <span
                            key={service}
                            className={`text-sm py-0.5 px-2 rounded-full ${
                              service === currentService
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {service.charAt(0).toUpperCase() + service.slice(1)}
                          </span>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleContactClick(contractor.id)
                        }}
                        className="flex items-center gap-1"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
