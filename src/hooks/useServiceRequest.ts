/**
 * useServiceRequest - Service request hook interface
 *
 * A custom hook that provides a simplified interface to access service request
 * state from the Zustand store. Acts as a bridge between components and the store,
 * exposing only the necessary properties and functions.
 *
 * @returns {Object} Service request state and methods
 */
'use client'

import { useServiceRequestStore } from '@/store/serviceRequestStore'
import { useRouter } from 'next/navigation'

export type LocationType = {
  lat: number
  lng: number
}

export type ServiceType = {
  id: string
  name: string
  icon?: string
  category?: string
}

/**
 * Adapter hook that mimics the old useServiceRequest hook
 * but uses the new Zustand store underneath
 */
export const useServiceRequest = () => {
  const router = useRouter()

  // Get all state and actions from Zustand store
  const store = useServiceRequestStore()

  // Extract only the properties and functions needed by components
  const {
    requestId,
    selectedServices,
    location,
    formattedAddress,
    formData,
    requestStatus,
    selectedContractor,
    currentStep,
    setCurrentStep,
    updateFormData,
    setSelectedContractor,
    userEmail,
    isAuthenticated,
    setRequestId,
    setLocation,
    setSelectedServices,
    setFormattedAddress,
    setUserEmail,
    submitServiceRequest,
    resetServiceAndLocation,
  } = store

  // Adapter for goToStep to make it compatible with the old API
  const goToStep = (step: any) => {
    store.setCurrentStep(step)

    // Map steps to routes
    const routeMap: Record<string, string> = {
      service: '/request-service',
      location: '/request-service/location',
      details: '/request-service/details',
      confirmation: '/request-service/confirmation',
      'find-contractor': '/request-service/find-contractor',
      payment: '/request-service/payment',
      tracking: '/request-service/tracking',
    }

    // Navigate to the appropriate route
    if (routeMap[step]) {
      router.push(routeMap[step])
    }
  }

  return {
    requestId,
    selectedServices,
    location,
    formattedAddress,
    formData,
    requestStatus,
    selectedContractor,
    currentStep,
    setCurrentStep,
    updateFormData,
    setSelectedContractor,
    goToStep,
    userEmail,
    isAuthenticated,
    setRequestId,
    hasEssentialData: store.hasEssentialData,
    setLocation,
    setSelectedServices,
    setFormattedAddress,
    setUserEmail,
    submitServiceRequest,
    resetServiceAndLocation,
  }
}
