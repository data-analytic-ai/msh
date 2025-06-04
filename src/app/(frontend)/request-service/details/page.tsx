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
import { UserAccountHandler } from '../confirmation/components/UserAccountHandler'

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
  const { isAuthenticated } = useAuth()
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

  // Si el usuario ya está autenticado, ir directamente a confirmación
  useEffect(() => {
    if (isAuthenticated && formSubmissionComplete && requestId) {
      console.log('User is authenticated and form submitted, redirecting to dashboard')
      router.push(`/request-service/dashboard/${requestId}`)
    }
  }, [isAuthenticated, formSubmissionComplete, requestId, router])

  // Handle successful form submission
  const handleSubmitSuccess = () => {
    console.log('Form submitted successfully')
    setFormSubmissionComplete(true)

    // Si el usuario ya está autenticado, ir directamente a dashboard
    if (isAuthenticated && requestId) {
      console.log('User already authenticated, redirecting to dashboard immediately')
      router.push(`/request-service/dashboard/${requestId}`)
    } else {
      // Si no está autenticado, mostrar el UserAccountHandler
      console.log('User not authenticated, showing account handler')
      setShowAccountHandler(true)
    }
  }

  // Handle successful authentication from UserAccountHandler
  const handleAuthenticationComplete = () => {
    console.log('Authentication completed, redirecting to dashboard')
    if (requestId) {
      router.push(`/request-service/dashboard/${requestId}`)
    }
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
            {/* User Profile Auto-Population Info */}
            {isAuthenticated && hasBeenAutoPopulated && (
              <div className="border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Information Auto-filled:</strong> We&apos;ve pre-filled your contact
                    information from your last service request. You can edit any details before
                    submitting.
                  </div>
                </div>
              </div>
            )}

            {/* Address Management Info for Authenticated Users */}
            {isAuthenticated && profileData && profileData.addresses.length > 0 && (
              <div className="border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="text-green-800 dark:text-green-200 text-sm">
                    <strong>Saved Addresses Available:</strong> You have{' '}
                    {profileData.addresses.length} saved address
                    {profileData.addresses.length !== 1 ? 'es' : ''}. You can select from them or
                    use a new location in the form below.
                  </div>
                </div>
              </div>
            )}

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
