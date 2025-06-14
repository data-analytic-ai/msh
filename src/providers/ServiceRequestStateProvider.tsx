/**
 * ServiceRequestStateProvider
 *
 * Client component that ensures service request data consistency across pages
 * in the service request flow using our Zustand store.
 */
'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useServiceRequestStore } from '@/store/serviceRequestStore'

// Rutas que requieren contexto completo
const ROUTES_REQUIRING_CONTEXT = ['/find-contractor', '/payment', '/tracking']

// Rutas que requieren al menos servicios y ubicación
const ROUTES_REQUIRING_BASIC_CONTEXT = ['/details']

// Rutas que pueden accederse libremente (no requieren datos del store)
const FREE_ACCESS_ROUTES = ['/dashboard', '/confirmation']

/**
 * ServiceRequestStateProvider - Ensures service request data is available
 */
export function ServiceRequestStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Get state and functions from our Zustand store
  const hasEssentialData = useServiceRequestStore((state) => state.hasEssentialData)
  const setCurrentStep = useServiceRequestStore((state) => state.setCurrentStep)
  const selectedServices = useServiceRequestStore((state) => state.selectedServices)
  const location = useServiceRequestStore((state) => state.location)
  const requestStatus = useServiceRequestStore((state) => state.requestStatus)

  // Check if current route requires context
  const requiresContext = ROUTES_REQUIRING_CONTEXT.some((route) => pathname?.includes(route))
  const requiresBasicContext = ROUTES_REQUIRING_BASIC_CONTEXT.some((route) =>
    pathname?.includes(route),
  )
  const isFreeAccessRoute = FREE_ACCESS_ROUTES.some((route) => pathname?.includes(route))

  // Check if we need to redirect due to missing data
  useEffect(() => {
    // Allow free access to dashboard and other specified routes
    if (isFreeAccessRoute) {
      console.log('Free access route, no data requirements')
      return
    }

    // Si estamos en la ruta de detalles, solo verificamos servicios y ubicación
    if (requiresBasicContext) {
      if (!(selectedServices.length > 0 && location)) {
        console.log('Redirigiendo al inicio desde detalles por falta de datos básicos')
        router.push('/')
      }
      return
    }

    // Para las rutas que requieren contexto completo
    if (requiresContext && !hasEssentialData()) {
      console.log('Redirigiendo al inicio por falta de datos esenciales')
      router.push('/')
    }
  }, [
    pathname,
    requiresContext,
    requiresBasicContext,
    isFreeAccessRoute,
    hasEssentialData,
    selectedServices,
    location,
    requestStatus,
    router,
  ])

  return <>{children}</>
}
