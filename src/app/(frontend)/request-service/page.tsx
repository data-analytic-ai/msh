'use client'

/**
 * RequestServicePage
 *
 * This page allows users to select a service type and location
 * to begin the service request process.
 */
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ServiceCard from '@/components/ServiceCard'
import { useServiceRequest, ServiceType } from '@/context/ServiceRequestContext'
import MapComponent, { LocationType } from '@/components/ui/MapComponent'

// Available service types - synchronized with ServiceRequests collection
const services = [
  { type: 'plumbing' as ServiceType, icon: '🚿', name: 'Plumbing' },
  { type: 'electrical' as ServiceType, icon: '⚡', name: 'Electrical' },
  { type: 'glass' as ServiceType, icon: '🪟', name: 'Windows & Glass' },
  { type: 'hvac' as ServiceType, icon: '❄️', name: 'HVAC' },
  { type: 'pests' as ServiceType, icon: '🐜', name: 'Pest Control' },
  { type: 'locksmith' as ServiceType, icon: '🔑', name: 'Locksmith' },
  { type: 'roofing' as ServiceType, icon: '🏠', name: 'Roofing' },
  { type: 'siding' as ServiceType, icon: '🧱', name: 'Siding' },
  { type: 'general' as ServiceType, icon: '🔨', name: 'General Repairs' },
]

export default function RequestServicePage() {
  const { selectedServices, location, setSelectedServices, setLocation, resetContext } =
    useServiceRequest()
  const router = useRouter()

  // Limpiar el estado al cargar la página
  useEffect(() => {
    resetContext()
  }, [resetContext])

  const handleServiceSelect = (serviceType: ServiceType) => {
    // Si el servicio ya está seleccionado, lo deseleccionamos
    if (selectedServices.includes(serviceType)) {
      setSelectedServices(selectedServices.filter((s) => s !== serviceType))
    } else {
      // Si no está seleccionado, lo seleccionamos
      setSelectedServices([...selectedServices, serviceType])
    }
  }

  const handleSetLocation = (newLocation: LocationType | null) => {
    setLocation(newLocation)
  }

  const handleContinue = () => {
    if (selectedServices.length > 0 && location) {
      // Navigate to details page, using context for data
      router.push('/request-service/details')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Service Request</h1>
        <p className="text-muted-foreground mt-2">
          Select the type of service you need and provide your location
        </p>
      </div>

      {/* Services grid */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Available Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.type} onClick={() => handleServiceSelect(service.type)}>
              <ServiceCard
                icon={service.icon}
                name={service.name}
                type={service.type}
                useServiceLinks={false}
                isSelected={selectedServices.includes(service.type)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Map component */}
      <div className="flex-1 m-4 relative bg-muted/50 rounded-lg">
        <h2 className="text-xl font-semibold p-4">Select your location</h2>
        <MapComponent
          selectedService={selectedServices}
          location={location}
          setLocation={handleSetLocation}
          onContinue={handleContinue}
        />
      </div>
    </div>
  )
}
