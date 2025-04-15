'use client'

import React, { useState, useEffect } from 'react'
import { FormBlock } from '@/blocks/Form/Component'
import { Page, User } from '@/payload-types'
import type { Form } from '@payloadcms/plugin-form-builder/types'
import { getMe } from '@/lib/auth'
import ServiceCard from '@/components/ServiceCard'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/context/ServiceRequestContext'
import MapComponent, { LocationType } from '@/components/ui/MapComponent'
import { ServiceType } from '@/context/ServiceRequestContext'

/**
 * UrgentFixHero - Main hero component for service selection
 *
 * Allows users to select services and location for emergency service requests.
 * Integrates with service request context for state management.
 *
 * @param {Page['hero']} props - Hero configuration from page data
 * @returns {JSX.Element} - The rendered hero component
 */
const UrgentFixHero: React.FC<Page['hero']> = ({ form }) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Usar el contexto compartido con la nueva propiedad de array
  const {
    selectedServices,
    location,
    formattedAddress,
    setSelectedServices,
    setLocation,
    setFormattedAddress,
    resetServiceAndLocation,
  } = useServiceRequest()

  // Inicializar el componente: limpiar estado y obtener usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: currentUser } = await getMe(false)
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()

    // Sólo resetear servicios y ubicación en una carga inicial desde otra página
    // o cuando se vuelve a la página principal después de completar una solicitud
    const fromCompletedRequest = sessionStorage.getItem('fromCompletedRequest') === 'true'
    const isInitialLoad = !sessionStorage.getItem('homePageVisited')

    if (fromCompletedRequest || isInitialLoad) {
      resetServiceAndLocation()
      console.log('Home page: reset service selection and location')
      // Marcar que ya se ha visitado la página principal
      sessionStorage.setItem('homePageVisited', 'true')
      // Limpiar la bandera de solicitud completada
      sessionStorage.removeItem('fromCompletedRequest')
    }
  }, [resetServiceAndLocation])

  // Standard services offered by UrgentFix
  const services = [
    { type: 'plumbing' as ServiceType, icon: '🚿', name: 'Plumbing' },
    { type: 'electrical' as ServiceType, icon: '⚡', name: 'Electricity' },
    { type: 'glass' as ServiceType, icon: '🪟', name: 'Windows' },
    { type: 'hvac' as ServiceType, icon: '🔥', name: 'HVAC' },
    { type: 'pests' as ServiceType, icon: '🐜', name: 'Pest' },
    { type: 'locksmith' as ServiceType, icon: '🔑', name: 'Locksmith' },
  ]

  const handleServiceSelect = (serviceType: ServiceType) => {
    console.log('Servicio seleccionado:', serviceType)
    console.log('Servicios actuales:', selectedServices)

    // Si el servicio ya está seleccionado, lo quitamos del array
    if (selectedServices.includes(serviceType)) {
      const newServices = selectedServices.filter((service) => service !== serviceType)
      console.log('Quitando servicio, nuevo array:', newServices)
      setSelectedServices(newServices)
    } else {
      // Si no está seleccionado, lo añadimos al array
      const newServices = [...selectedServices, serviceType]
      console.log('Añadiendo servicio, nuevo array:', newServices)
      setSelectedServices(newServices)
    }
  }

  // Añadir efecto para verificar si selectedServices cambia
  useEffect(() => {
    console.log('selectedServices cambiado:', selectedServices)
  }, [selectedServices])

  const handleContinue = () => {
    if (selectedServices.length > 0 && location) {
      // Navegar a la página de detalles
      router.push('/request-service/details')
    }
  }

  const handleSetLocation = (newLocation: LocationType | null) => {
    setLocation(newLocation)
  }

  return (
    <section className="bg-background text-foreground w-full py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Greeting and title */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold">
            {user ? `Hello, ${user.name}` : 'Welcome'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            What kind of emergency do you have today?
          </p>
        </div>

        {/* Available services */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold">Select your service</h3>
            {/* <Link href="/services" className="text-sm text-primary hover:underline">
              Ver todos los servicios
            </Link> */}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {services.map((service, index: number) => (
              <div key={index} className="w-full">
                <ServiceCard
                  icon={service.icon}
                  name={service.name}
                  type={service.type}
                  useServiceLinks={false}
                  isSelected={selectedServices.includes(service.type)}
                  onClick={() => handleServiceSelect(service.type)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Map component */}
        <div className="h-48 sm:h-56 md:h-64 bg-card rounded-lg relative shadow-sm">
          <MapComponent
            selectedService={selectedServices}
            location={location}
            setLocation={handleSetLocation}
            onContinue={handleContinue}
            formattedAddress={formattedAddress}
            setFormattedAddress={setFormattedAddress}
          />
        </div>

        {/* Form (optional) */}
        {form && (
          <div className="bg-card border rounded-lg p-3 sm:p-4 mt-4 sm:mt-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 md:mb-8">
              Request a service
            </h3>
            <FormBlock enableIntro={false} form={form as Form} />
          </div>
        )}
      </div>
    </section>
  )
}

export default UrgentFixHero
