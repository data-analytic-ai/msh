'use client'

/**
 * UserServiceRequestsWrapper
 *
 * Client component wrapper for UserServiceRequests to handle client-side rendering.
 * This wrapper is needed because UserServiceRequests uses React hooks which need
 * to be used in a client component.
 */
import React, { useEffect } from 'react'
import { UserServiceRequests } from './UserServiceRequests'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { useAuth } from '@/providers/AuthProvider'

export const UserServiceRequestsWrapper = () => {
  const { resetServiceAndLocation, requestId, currentStep } = useServiceRequest()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Solo reseteamos el servicio y ubicación si no estamos en un flujo activo de solicitud
    // Si tenemos un requestId o estamos en un paso específico del flujo, no reseteamos
    if (!requestId && currentStep === 'service') {
      resetServiceAndLocation()
    }
  }, [resetServiceAndLocation, requestId, currentStep])

  // Solo renderizar el componente si el usuario está autenticado
  if (!isAuthenticated) {
    return null
  }

  return <UserServiceRequests />
}
