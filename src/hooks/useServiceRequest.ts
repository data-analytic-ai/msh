/**
 * useServiceRequest - Adapter hook
 *
 * This adapter hook provides backward compatibility for components
 * that are still using the old useServiceRequest hook from the context.
 * Internally, it uses the new Zustand store.
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

  // Return the same API shape as the old context
  return {
    ...store,
    goToStep,
  }
}
