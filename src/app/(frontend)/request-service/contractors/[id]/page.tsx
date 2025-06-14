'use client'

/**
 * Contractor Detail Page
 *
 * Displays detailed information about a specific contractor and allows
 * the user to request their services.
 */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Phone, Mail, Globe, Star, Clock, Check } from 'lucide-react'
import Link from 'next/link'
import { useServiceRequestStore } from '@/store/serviceRequestStore'
import { Contractor } from '@/types/contractor'
import { Separator } from '@/components/ui/separator'

export default function ContractorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { setSelectedContractor } = useServiceRequestStore()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar detalles del contratista desde la API
  useEffect(() => {
    const fetchContractorDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (params.id.startsWith('ChIJ') || params.id.includes('place')) {
          // Es un ID de Google Place, debemos obtener más detalles
          await fetchGooglePlaceDetails(params.id)
        } else {
          // ID de PayloadCMS, intentamos obtener de nuestra API
          const response = await fetch(`/api/contractors/${params.id}`)

          if (!response.ok) {
            throw new Error('No pudimos encontrar el contratista solicitado')
          }

          const data = await response.json()
          setContractor(data.contractor)

          // Actualizar el contratista seleccionado en el contexto
          setSelectedContractor({
            id: data.contractor.id,
            name: data.contractor.name,
            lastName: '',
            services: data.contractor.servicesOffered,
            phoneNumber: data.contractor.contactPhone,
            rating: data.contractor.rating,
          })
        }
      } catch (error) {
        console.error('Error al cargar datos del contratista:', error)
        setError('No pudimos cargar la información del contratista')

        // Si no podemos obtener los datos, intentamos usar el contratista seleccionado
        // en el contexto o los datos de la sesión
        const storedContractors = sessionStorage.getItem('recent_contractors')
        if (storedContractors) {
          try {
            const contractors = JSON.parse(storedContractors)
            const found = contractors.find((c: { id: string }) => c.id === params.id)
            if (found) {
              setContractor(found)
              setError(null)
            }
          } catch (e) {
            console.error('Error parsing stored contractors:', e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Obtener más detalles de Google Places API
    const fetchGooglePlaceDetails = async (placeId: string) => {
      // En un entorno de producción, esto se haría a través de una API proxy en el servidor
      // para proteger la clave API de Google

      // Creamos un contratista simulado basado en el ID
      // En una implementación real, usarías la API de Places para obtener detalles completos
      const mockContractor: Contractor = {
        id: placeId,
        name: sessionStorage.getItem(`place_${placeId}_name`) || 'Contratista Profesional',
        description: 'Servicios profesionales con amplia experiencia en el área.',
        contactEmail: 'contact@example.com',
        contactPhone: '+1 (555) 123-4567',
        website: 'https://example.com',
        address: sessionStorage.getItem(`place_${placeId}_vicinity`) || 'Dirección no disponible',
        location: {
          lat: parseFloat(sessionStorage.getItem(`place_${placeId}_lat`) || '0'),
          lng: parseFloat(sessionStorage.getItem(`place_${placeId}_lng`) || '0'),
        },
        servicesOffered: ['plumbing', 'electrical'],
        yearsExperience: 5,
        rating: parseFloat(sessionStorage.getItem(`place_${placeId}_rating`) || '4.5'),
        reviewCount: parseInt(sessionStorage.getItem(`place_${placeId}_reviews`) || '25'),
        specialties: ['Reparaciones de emergencia', 'Instalaciones comerciales'],
        workingHours: {
          monday: '9:00 AM - 5:00 PM',
          tuesday: '9:00 AM - 5:00 PM',
          wednesday: '9:00 AM - 5:00 PM',
          thursday: '9:00 AM - 5:00 PM',
          friday: '9:00 AM - 5:00 PM',
        },
        verified: true,
      }

      setContractor(mockContractor)

      // Actualizar el contratista seleccionado en el contexto
      setSelectedContractor({
        id: mockContractor.id,
        name: mockContractor.name,
        lastName: '',
        services: mockContractor.servicesOffered,
        phoneNumber: mockContractor.contactPhone,
        rating: mockContractor.rating,
      })
    }

    fetchContractorDetails()
  }, [params.id, setSelectedContractor])

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

      // Navegar a la página de detalles de la solicitud
      router.push('/request-service/details')
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
          href="/request-service/contractors"
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
            <Button onClick={() => router.push('/request-service/contractors')} variant="outline">
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
        href="/request-service/contractors"
        className="flex items-center gap-2 text-sm font-medium mb-4"
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
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium">{contractor.rating}</span>
              <span className="text-muted-foreground text-xs ml-1">
                ({contractor.reviewCount} reseñas)
              </span>
            </div>
          </div>
          {contractor.verified && (
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
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
              {contractor.servicesOffered.map((service) => (
                <Badge key={service} variant="secondary">
                  {serviceLabels[service] || service}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Especialidades */}
          {contractor.specialties && contractor.specialties.length > 0 && (
            <>
              <div>
                <h3 className="font-medium mb-2">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator className="my-4" />
            </>
          )}

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
                    href={
                      contractor.website.startsWith('http')
                        ? contractor.website
                        : `https://${contractor.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {contractor.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Horario */}
          {contractor.workingHours && Object.values(contractor.workingHours).some(Boolean) && (
            <div>
              <h3 className="font-medium mb-2">Horario de atención</h3>
              <div className="grid grid-cols-2 gap-2">
                {contractor.workingHours.monday && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Lunes: {contractor.workingHours.monday}</span>
                  </div>
                )}
                {contractor.workingHours.tuesday && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Martes: {contractor.workingHours.tuesday}</span>
                  </div>
                )}
                {contractor.workingHours.wednesday && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Miércoles: {contractor.workingHours.wednesday}</span>
                  </div>
                )}
                {contractor.workingHours.thursday && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Jueves: {contractor.workingHours.thursday}</span>
                  </div>
                )}
                {contractor.workingHours.friday && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Viernes: {contractor.workingHours.friday}</span>
                  </div>
                )}
                {contractor.workingHours.saturday && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Sábado: {contractor.workingHours.saturday}</span>
                  </div>
                )}
                {contractor.workingHours.sunday && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Domingo: {contractor.workingHours.sunday}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón de solicitud de servicio */}
      <div className="sticky bottom-4 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-md">
        <Button onClick={handleRequestService} className="w-full" size="lg">
          Solicitar servicio con este contratista
        </Button>
      </div>
    </div>
  )
}
