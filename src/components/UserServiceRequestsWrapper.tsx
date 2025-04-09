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
import { useServiceRequest } from '@/context/ServiceRequestContext'

export const UserServiceRequestsWrapper = () => {
  const { resetServiceAndLocation } = useServiceRequest()

  // Asegurarnos de que no se usen servicios o ubicación en este componente de la página Home
  useEffect(() => {
    // Este componente forma parte de la página Home, así que también necesitamos
    // asegurarnos de que no use datos de servicios o ubicación
    resetServiceAndLocation()
  }, [resetServiceAndLocation])

  return <UserServiceRequests />
}
