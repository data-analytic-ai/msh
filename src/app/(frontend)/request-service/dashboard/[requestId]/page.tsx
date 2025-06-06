/**
 * ServiceRequestDashboard
 *
 * Customer dashboard for managing service requests and viewing quotes.
 * Accessible only to authenticated users with 'client' role.
 * Provides unrestricted access to QuotesInbox for receiving notifications.
 *
 * Acts as a coordinator for smaller components that handle specific functionalities.
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'
import { ArrowLeft, Home, Settings, AlertTriangle } from 'lucide-react'

// Components
import { RequestHeader } from '../../confirmation/components/RequestHeader'
import { NextStepsInfo } from '../../confirmation/components/NextStepsInfo'
import QuotesInbox from '../../confirmation/components/QuotesInbox'

export default function ServiceRequestDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const requestIdFromUrl = params.requestId as string

  const [isPageLoading, setIsPageLoading] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)

  // Check authentication and user role
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login')
      router.push('/request-service/details')
      return
    }

    // Check if user has client role
    if (user.role !== 'client') {
      console.log('User is not a client, access denied. Role:', user.role)
      setAccessError(
        'Este dashboard es solo para clientes. Los contratistas deben usar el dashboard de contratistas.',
      )
      setIsPageLoading(false)
      return
    }

    // Validate requestId from URL
    if (!requestIdFromUrl || typeof requestIdFromUrl !== 'string') {
      setAccessError('ID de solicitud inválido.')
      setIsPageLoading(false)
      return
    }

    // All checks passed, allow access
    setAccessError(null)
    setIsPageLoading(false)
  }, [authLoading, isAuthenticated, user, requestIdFromUrl, router])

  // Loading state
  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Access denied - wrong role
  if (accessError) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
            <h1 className="ml-4 text-lg font-semibold">Dashboard de Cliente</h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="max-w-md mx-auto text-center space-y-6 mt-12">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Acceso denegado</h2>
              <p className="text-muted-foreground">{accessError}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
              {user?.role === 'contractor' && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/contractor/dashboard')}
                  className="w-full"
                >
                  Dashboard de Contratista
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RequestHeader />

      <main className="flex-1 p-4">
        <div className="space-y-6">
          {/* Welcome message for client */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-1">
              ¡Bienvenido/a, {user?.firstName || 'Cliente'}!
            </h2>
            <p className="text-sm text-blue-700">
              Este es tu dashboard personal donde puedes gestionar tus solicitudes de servicio y
              recibir cotizaciones en tiempo real.
            </p>
          </div>

          {/* Next steps information */}
          <NextStepsInfo />

          {/* Quotes management system - Always accessible */}
          <QuotesInbox requestId={requestIdFromUrl} isAuthenticated={true} />

          {/* Additional client information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Tu solicitud</h3>
              <p className="text-sm text-muted-foreground mb-3">
                ID de solicitud:{' '}
                <span className="font-mono bg-muted px-2 py-1 rounded">{requestIdFromUrl}</span>
              </p>
              <Link href={`/request-service/quotes/${requestIdFromUrl}`}>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar cotizaciones
                </Button>
              </Link>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Soporte</h3>
              <p className="text-sm text-muted-foreground mb-3">
                ¿Necesitas ayuda? Contacta nuestro equipo de soporte.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Contactar soporte
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
