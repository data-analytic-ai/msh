'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Info, User, MapPin } from 'lucide-react'
import Link from 'next/link'
import MapComponent from '@/components/ui/MapComponent'
import { ServiceRequestForm } from '@/blocks/Form/ServiceRequestForm'
import { UserAccountHandler } from '../dashboard/components/UserAccountHandler'

// Service type name mappings
const serviceNames: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  glass: 'Windows',
  hvac: 'HVAC',
  pests: 'Pest Control',
  locksmith: 'Locksmith',
}

/**
 * RequestServiceDetailsPage - Service request details form page
 *
 * This page combines the location display with a PayloadCMS-powered form
 * for collecting service request details. It integrates with the service
 * request flow and maintains backward compatibility with the existing system.
 *
 * Now includes user profile auto-population and address management for
 * authenticated users, allowing them to save time by reusing previous
 * information and manage multiple service locations.
 *
 * After form submission, it shows the UserAccountHandler component to
 * manage user authentication before proceeding to confirmation.
 *
 * @returns {JSX.Element} - Service request details page
 */
export default function RequestServiceDetailsPage() {
  const {
    selectedServices,
    location,
    formattedAddress,
    setFormattedAddress,
    setCurrentStep,
    requestId,
    userEmail,
  } = useServiceRequest()

  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const {
    profileData,
    hasBeenAutoPopulated,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile()

  // Estado para controlar qué vista mostrar
  const [showAccountHandler, setShowAccountHandler] = useState(false)
  const [formSubmissionComplete, setFormSubmissionComplete] = useState(false)

  // Mark the current step in the context
  useEffect(() => {
    setCurrentStep('details')

    // Debugging to detect state issues
    console.log('State in details:', {
      selectedServices,
      location,
      formattedAddress,
      currentStep: 'details',
      isAuthenticated,
      hasBeenAutoPopulated,
    })
  }, [
    setCurrentStep,
    selectedServices,
    location,
    formattedAddress,
    isAuthenticated,
    hasBeenAutoPopulated,
  ])

  // Verify if we have the formatted information
  useEffect(() => {
    if (!formattedAddress && location) {
      // If we have location but no formatted address, try to get it
      if (window.google && window.google.maps) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode(
          { location: { lat: location.lat, lng: location.lng } },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              setFormattedAddress(results[0].formatted_address)
            }
          },
        )
      }
    }
  }, [location, formattedAddress, setFormattedAddress])

  // Verificar autenticación existente - pero permitir a los clientes completar el formulario
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log('🔍 User is already authenticated:', user.role)

      // Solo redirigir usuarios que NO son clientes
      if (user.role === 'admin' || user.role === 'superadmin') {
        console.log('🚀 Admin/SuperAdmin detected, redirecting to admin panel')
        if (typeof window !== 'undefined') {
          window.location.href = '/admin'
        }
      } else if (user.role === 'contractor') {
        console.log('🚀 Contractor detected, redirecting to contractor dashboard')
        if (typeof window !== 'undefined') {
          window.location.href = '/contractor/dashboard'
        }
      }
      // Los clientes (role === 'client') pueden permanecer en esta página para completar/ver solicitudes
    }
  }, [isAuthenticated, user, isLoading])

  // Handle successful form submission
  const handleSubmitSuccess = () => {
    console.log('Form submitted successfully')
    setFormSubmissionComplete(true)

    // Guardar requestId en sessionStorage para uso posterior
    if (requestId && typeof window !== 'undefined') {
      sessionStorage.setItem('current_request_id', requestId)
    }

    // Si el usuario ya está autenticado, ir directamente a dashboard
    if (isAuthenticated && requestId) {
      console.log('User already authenticated, redirecting to dashboard immediately')
      if (typeof window !== 'undefined') {
        window.location.href = `/dashboard/${requestId}`
      }
    } else {
      // Si no está autenticado, mostrar el UserAccountHandler
      console.log('User not authenticated, showing account handler')
      setShowAccountHandler(true)
    }
  }

  // Handle successful authentication from UserAccountHandler
  const handleAuthenticationComplete = () => {
    console.log('Authentication completed - UserAccountHandler will handle redirect')
    // UserAccountHandler ahora maneja toda la redirección con refresh completo
    // No necesitamos hacer nada aquí
  }

  // Handle back button when showing account handler
  const handleBackToForm = () => {
    setShowAccountHandler(false)
    setFormSubmissionComplete(false)
  }

  // If we don't have the required information, show a loading state
  if (!selectedServices || !location) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="ml-4 text-lg font-semibold">Request Information</h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="space-y-6 text-center">
            <p className="text-lg">No active service request found.</p>
            <Button onClick={() => router.push('/')}>Start a New Request</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-background dark:text-white">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          {showAccountHandler ? (
            <button
              onClick={handleBackToForm}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          )}
          <h1 className="ml-4 text-lg font-semibold">
            {showAccountHandler ? 'Account Setup' : 'Complete Request'}
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        {showAccountHandler ? (
          // Mostrar UserAccountHandler después del envío del formulario
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="text-green-800 dark:text-green-200 text-sm">
                  <strong>¡Solicitud Enviada Exitosamente!</strong> Ahora necesitamos configurar tu
                  cuenta para que puedas seguir el progreso de tu solicitud y recibir cotizaciones
                  de contratistas.
                </div>
              </div>
            </div>

            <UserAccountHandler
              userEmail={userEmail}
              requestId={requestId}
              onAuthenticationComplete={handleAuthenticationComplete}
            />
          </div>
        ) : (
          // Mostrar formulario normal
          <div className="space-y-6">
            {/* Profile Loading State */}
            {isAuthenticated && profileLoading && (
              <div className="border border-border bg-muted p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5" />
                  <div className="text-sm">Loading your profile information...</div>
                </div>
              </div>
            )}

            {/* Profile Error State */}
            {isAuthenticated && profileError && (
              <div className="border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Profile Error:</strong> {profileError}
                </div>
              </div>
            )}

            {/* Enhanced PayloadCMS Form Integration with User Profile */}
            <ServiceRequestForm onSubmitSuccess={handleSubmitSuccess} className="w-full" />
          </div>
        )}
      </main>
    </div>
  )
}

// TODO: Funcionalidad que rellene los campos con la información del usuario si ya está registrado
// TODO: Verificar antes de enviar el formulario si el usuario ya esta registrado, se le pide iniciar sesion y no se registra de nuevo.
// TODO: En la la informacion del formulario, agregar una opcion para indicar que es de otra persona.
// TODO: En la informacion del formulario, agregar un campo para indicar el codigo postal.
// TODO: Integrar funcionalidad de subida de imágenes usando PayloadCMS media collection
