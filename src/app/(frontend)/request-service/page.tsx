'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ServiceCard from '@/components/ServiceCard'
import { useServiceRequest } from '@/contexts/ServiceRequestContext'
import MapComponent, { LocationType } from '@/components/ui/MapComponent'

// Available service types
const services = [
  { type: 'plumbing', icon: '🚿', name: 'Plumbing' },
  { type: 'electrical', icon: '⚡', name: 'Electrical' },
  { type: 'glass', icon: '🪟', name: 'Windows' },
  { type: 'hvac', icon: '🔥', name: 'HVAC' },
  { type: 'pests', icon: '🐜', name: 'Pest Control' },
  { type: 'locksmith', icon: '🔑', name: 'Locksmith' },
]

export default function RequestServicePage() {
  const { selectedService, location, setSelectedService, setLocation } = useServiceRequest()
  const router = useRouter()

  const handleServiceSelect = (serviceType: string) => {
    setSelectedService(serviceType)
  }

  const handleSetLocation = (newLocation: LocationType) => {
    setLocation(newLocation)
  }

  const handleContinue = () => {
    if (selectedService && location) {
      // Navigate to details page, using context for data
      router.push('/request-service/details')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Request Service</h1>
        <p className="text-muted-foreground mt-2">Select the type of service you need</p>
      </div>

      {/* Services grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.type} onClick={() => handleServiceSelect(service.type)}>
              <ServiceCard
                icon={service.icon}
                name={service.name}
                type={service.type}
                useServiceLinks={false}
                isSelected={selectedService === service.type}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Map component */}
      <div className="flex-1 m-4 relative bg-muted/50 rounded-lg">
        <MapComponent
          selectedService={selectedService}
          location={location}
          setLocation={handleSetLocation}
          onContinue={handleContinue}
        />
      </div>
    </div>
  )
}
