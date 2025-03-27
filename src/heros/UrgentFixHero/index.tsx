'use client'

import React, { useState, useEffect } from 'react'
import { FormBlock } from '@/blocks/Form/Component'
import { Page, User } from '@/payload-types'
import type { Form } from '@payloadcms/plugin-form-builder/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getMe } from '@/lib/auth'
import ServiceCard from '@/components/ServiceCard'
import { MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import UrgentHelpCard from '@/components/UrgentHelpCard'
import { useServiceRequest } from '@/contexts/ServiceRequestContext'
import MapComponent, { LocationType } from '@/components/ui/MapComponent'

const UrgentFixHero: React.FC<Page['hero']> = ({ form, links }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Usar el contexto compartido
  const { selectedService, location, setSelectedService, setLocation } = useServiceRequest()

  // Fetch the authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const { user: currentUser } = await getMe()
        setUser(currentUser)
      } catch (error) {
        // Not authenticated or error
        console.log('User not authenticated or error fetching user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Standard services offered by UrgentFix
  const services = [
    { type: 'plumbing', icon: '🚿', name: 'Plumbing' },
    { type: 'electrical', icon: '⚡', name: 'Electricity' },
    { type: 'glass', icon: '🪟', name: 'Windows' },
    { type: 'hvac', icon: '🔥', name: 'HVAC' },
    { type: 'pests', icon: '🐜', name: 'Pest' },
    { type: 'locksmith', icon: '🔑', name: 'Locksmith' },
  ]

  const handleServiceSelect = (serviceType: string) => {
    setSelectedService(serviceType)
  }

  const handleContinue = () => {
    if (selectedService && location) {
      // Navegar a la página de detalles
      router.push('/request-service/details')
    }
  }

  const handleSetLocation = (newLocation: LocationType) => {
    setLocation(newLocation)
  }

  return (
    <section className="bg-background w-full py-6">
      <div className="container mx-auto px-4 space-y-6">
        {/* Greeting and title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{user ? `Hello, ${user.name}` : 'Welcome'}</h2>
          <p className="text-muted-foreground">What kind of emergency do you have today?</p>
        </div>

        {/* Available services */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Select your service</h3>
            {/* <Link href="/services" className="text-sm text-primary hover:underline">
              Ver todos los servicios
            </Link> */}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {services.map(
              (service: { type: string; icon: string; name: string }, index: number) => (
                <div key={index} onClick={() => handleServiceSelect(service.type)}>
                  <ServiceCard
                    icon={service.icon}
                    name={service.name}
                    type={service.type}
                    useServiceLinks={false}
                    isSelected={selectedService === service.type}
                  />
                </div>
              ),
            )}
          </div>
        </div>

        {/* Map component */}
        <div className="h-64 bg-muted/50 rounded-lg relative">
          <MapComponent
            selectedService={selectedService}
            location={location}
            setLocation={handleSetLocation}
            onContinue={handleContinue}
          />
        </div>

        {/* Form (optional) */}
        {form && (
          <div className="bg-card border rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold mb-4">Request a service</h3>
            <FormBlock enableIntro={false} form={form as Form} />
          </div>
        )}
      </div>
    </section>
  )
}

export default UrgentFixHero
