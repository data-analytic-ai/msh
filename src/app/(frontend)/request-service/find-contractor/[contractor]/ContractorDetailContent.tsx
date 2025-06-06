'use client'

/**
 * ContractorDetailContent - Client component for contractor details
 *
 * Handles data fetching and presentation of contractor details.
 * Uses both context state and API data for resilience.
 *
 * @param {Object} props - Component props
 * @param {string} props.contractorId - ID of the contractor to display
 * @param {string} props.slug - Full slug containing ID and name
 * @returns {JSX.Element} Contractor details UI
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Phone, Mail, Globe, Star, Clock, Check } from 'lucide-react'
import Link from 'next/link'
import { useServiceRequestStore } from '@/store/serviceRequestStore'
import { Contractor } from '@/types/contractor'
import { Separator } from '@/components/ui/separator'

export default function ContractorDetailContent({
  contractorId,
  slug,
}: {
  contractorId: string
  slug: string
}) {
  const router = useRouter()
  const { selectedContractor, setSelectedContractor } = useServiceRequestStore()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoizar la función para evitar re-renders innecesarios
  const updateSelectedContractor = useCallback(
    (contractorData: any) => {
      if (!selectedContractor || selectedContractor.id !== contractorData.id) {
        setSelectedContractor(contractorData)
      }
    },
    [selectedContractor, setSelectedContractor],
  )

  // Cargar detalles del contratista desde la API o del contexto
  useEffect(() => {
    const fetchContractorDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Primero intentar obtener detalles de la API
        const response = await fetch(`/api/contractors/${contractorId}`)

        if (response.ok) {
          const data = await response.json()
          setContractor(data.contractor)

          // Actualizar el contratista seleccionado en el contexto solo si es diferente
          const currentContractor = {
            id: data.contractor.id,
            name: data.contractor.name,
            lastName: '',
            services: Array.isArray(data.contractor.servicesOffered)
              ? data.contractor.servicesOffered
              : [data.contractor.servicesOffered].filter(Boolean),
            phoneNumber: data.contractor.contactPhone || '',
            rating: data.contractor.rating || 0,
          }

          updateSelectedContractor(currentContractor)
        } else {
          // Si la API falla, usar datos del contexto si están disponibles
          if (selectedContractor && selectedContractor.id === contractorId) {
            console.log('Using contractor from context:', selectedContractor)

            // Crear un objeto contractor basado en el contexto
            const contextContractor: Contractor = {
              id: selectedContractor.id,
              name: selectedContractor.name,
              description: 'Información detallada no disponible desde la base de datos.',
              contactEmail: '',
              contactPhone: selectedContractor.phoneNumber || '',
              website: '',
              address: 'Dirección no disponible',
              location: {
                lat: 0,
                lng: 0,
              },
              servicesOffered: selectedContractor.services || [],
              yearsExperience: 0,
              rating: selectedContractor.rating || 0,
              reviewCount: 0,
              verified: false,
            }

            setContractor(contextContractor)
          } else {
            // Si es un ID de Google Place o no tenemos contexto, crear datos mock
            const mockContractor: Contractor = {
              id: contractorId,
              name: contractorId.startsWith('ChIJ')
                ? sessionStorage?.getItem(`contractor_${contractorId}_name`) ||
                  'Contratista Profesional'
                : 'Contratista Profesional',
              description:
                'Servicios profesionales con amplia experiencia en el área. Contamos con técnicos certificados y equipos especializados para brindar soluciones de calidad.',
              contactEmail: 'contact@contractor.example',
              contactPhone: '+1 (555) 123-4567',
              website: 'https://contractor.example',
              address: contractorId.startsWith('ChIJ')
                ? sessionStorage?.getItem(`contractor_${contractorId}_address`) ||
                  'Dirección profesional'
                : 'Dirección profesional',
              location: {
                lat: contractorId.startsWith('ChIJ')
                  ? parseFloat(sessionStorage?.getItem(`contractor_${contractorId}_lat`) || '0')
                  : 0,
                lng: contractorId.startsWith('ChIJ')
                  ? parseFloat(sessionStorage?.getItem(`contractor_${contractorId}_lng`) || '0')
                  : 0,
              },
              servicesOffered: ['plumbing', 'electrical'],
              yearsExperience: 5,
              rating: contractorId.startsWith('ChIJ')
                ? parseFloat(sessionStorage?.getItem(`contractor_${contractorId}_rating`) || '4.5')
                : 4.5,
              reviewCount: contractorId.startsWith('ChIJ')
                ? parseInt(sessionStorage?.getItem(`contractor_${contractorId}_reviews`) || '25')
                : 25,
              specialties: [
                'Reparaciones de emergencia',
                'Instalaciones comerciales',
                'Mantenimiento preventivo',
              ],
              workingHours: {
                monday: '9:00 AM - 5:00 PM',
                tuesday: '9:00 AM - 5:00 PM',
                wednesday: '9:00 AM - 5:00 PM',
                thursday: '9:00 AM - 5:00 PM',
                friday: '9:00 AM - 5:00 PM',
                saturday: '10:00 AM - 2:00 PM',
                sunday: 'Cerrado',
              },
              verified: true,
            }

            setContractor(mockContractor)

            // Actualizar el contratista seleccionado en el contexto solo si es diferente
            const mockSelectedContractor = {
              id: mockContractor.id,
              name: mockContractor.name,
              lastName: '',
              services: mockContractor.servicesOffered,
              phoneNumber: mockContractor.contactPhone,
              rating: mockContractor.rating,
            }

            updateSelectedContractor(mockSelectedContractor)
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del contratista:', error)
        setError('No pudimos cargar la información del contratista')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContractorDetails()
  }, [contractorId, updateSelectedContractor]) // Ahora incluye la función memoizada

  // Manejar la solicitud de servicio con este contratista
  const handleRequestService = () => {
    if (contractor) {
      // Guardar contratista seleccionado en el contexto
      setSelectedContractor({
        id: contractor.id,
        name: contractor.name,
        lastName: '',
        services: contractor.servicesOffered,
        phoneNumber: contractor.contactPhone,
        rating: contractor.rating,
      })

      // Navegar a la página de pago en lugar de detalles
      router.push('/request-service/payment')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Cargando información del contratista...</p>
        </div>
      </div>
    )
  }

  if (error || !contractor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/request-service/find-contractor"
          className="flex items-center gap-2 text-sm font-medium mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista de contratistas
        </Link>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'No se pudo encontrar la información del contratista solicitado.'}
            </p>
            <Button
              onClick={() => router.push('/request-service/find-contractor')}
              variant="outline"
            >
              Ver otros contratistas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formatear servicios para mostrar
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
      {/* Breadcrumb y navegación */}
      <Link
        href="/request-service/find-contractor"
        className="flex items-center gap-2 text-sm font-medium mb-4 dark:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la lista de contratistas
      </Link>

      {/* Información del contratista */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{contractor.name}</CardTitle>
              <div className="flex items-center mt-1 text-muted-foreground text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{contractor.address}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-warning fill-warning mr-1" />
              <span className="font-medium">{contractor.rating}</span>
              <span className="text-muted-foreground text-xs ml-1">
                ({contractor.reviewCount} reseñas)
              </span>
            </div>
          </div>
          {contractor.verified && (
            <Badge
              variant="outline"
              className="mt-2 bg-success-light text-success-light-foreground border-success"
            >
              <Check className="h-3 w-3 mr-1" /> Verificado
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Descripción</h3>
            <p className="text-muted-foreground">{contractor.description}</p>
          </div>

          <Separator className="my-4" />

          {/* Servicios ofrecidos */}
          <div>
            <h3 className="font-medium mb-2">Servicios ofrecidos</h3>
            <div className="flex flex-wrap gap-2">
              {contractor.servicesOffered.map((service, index) => {
                // Obtener la clave del servicio (string) independientemente del tipo
                const serviceKey =
                  typeof service === 'string' ? service : service.id || service.slug || ''
                return (
                  <Badge key={index} variant="secondary">
                    {serviceLabels[serviceKey] ||
                      (typeof service === 'string' ? service : service.name || serviceKey)}
                  </Badge>
                )
              })}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Información de contacto */}
          <div>
            <h3 className="font-medium mb-2">Información de contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{contractor.contactPhone}</span>
              </div>
              {contractor.contactEmail && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{contractor.contactEmail}</span>
                </div>
              )}
              {contractor.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a
                    href={contractor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {contractor.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Horario, si está disponible */}
          {contractor.workingHours && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-2">Horario</h3>
                <div className="grid grid-cols-2 gap-2">
                  {contractor.workingHours.monday && (
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Lunes:</span>
                        <span className="text-muted-foreground ml-2">
                          {contractor.workingHours.monday}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Otros días de la semana aquí... */}
                </div>
              </div>
            </>
          )}

          {/* Especialidades, si están disponibles */}
          {contractor.specialties && contractor.specialties.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-2">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((specialty: any, index) => (
                    <Badge key={index} variant="outline">
                      {typeof specialty === 'object' &&
                      specialty !== null &&
                      'specialty' in specialty
                        ? specialty.specialty
                        : specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Botón de solicitar servicio */}
          <div className="mt-6">
            <Button onClick={handleRequestService} className="w-full" size="lg">
              Solicitar este contratista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
