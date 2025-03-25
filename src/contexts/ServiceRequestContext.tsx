'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type ServiceRequestContextType = {
  selectedService: string | null
  location: { lat: number; lng: number } | null
  setSelectedService: (service: string | null) => void
  setLocation: (location: { lat: number; lng: number } | null) => void
  resetRequest: () => void
}

const ServiceRequestContext = createContext<ServiceRequestContextType | undefined>(undefined)

export function ServiceRequestProvider({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const resetRequest = () => {
    setSelectedService(null)
    setLocation(null)
  }

  return (
    <ServiceRequestContext.Provider
      value={{
        selectedService,
        location,
        setSelectedService,
        setLocation,
        resetRequest,
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  )
}

export function useServiceRequest() {
  const context = useContext(ServiceRequestContext)
  if (context === undefined) {
    throw new Error('useServiceRequest must be used within a ServiceRequestProvider')
  }
  return context
}
