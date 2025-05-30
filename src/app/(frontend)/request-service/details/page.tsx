'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MapComponent from '@/components/ui/MapComponent'
import { ServiceRequestForm } from '@/blocks/Form/ServiceRequestForm'

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
 * @returns {JSX.Element} - Service request details page
 */
export default function RequestServiceDetailsPage() {
  const { selectedServices, location, formattedAddress, setFormattedAddress, setCurrentStep } =
    useServiceRequest()

  const router = useRouter()

  // Mark the current step in the context
  useEffect(() => {
    setCurrentStep('details')

    // Debugging to detect state issues
    console.log('State in details:', {
      selectedServices,
      location,
      formattedAddress,
      currentStep: 'details',
    })
  }, [setCurrentStep, selectedServices, location, formattedAddress])

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

  // Handle successful form submission
  const handleSubmitSuccess = () => {
    console.log('Form submitted successfully, redirecting to confirmation')
    router.push('/request-service/confirmation')
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
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="ml-4 text-lg font-semibold">Complete Request</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="space-y-6">
          {/* Map in read-only mode */}
          <div className="w-full h-48 rounded-lg overflow-hidden shadow-md">
            <MapComponent
              selectedService={selectedServices}
              location={location}
              setLocation={() => {}}
              onContinue={() => {}}
              formattedAddress={formattedAddress}
              setFormattedAddress={setFormattedAddress}
              readOnly={true}
            />
          </div>

          {/* PayloadCMS Form Integration */}
          <ServiceRequestForm onSubmitSuccess={handleSubmitSuccess} className="w-full" />
        </div>
      </main>
    </div>
  )
}

// TODO: Funcionalidad que rellene los campos con la información del usuario si ya está registrado
// TODO: Verificar antes de enviar el formulario si el usuario ya esta registrado, se le pide iniciar sesion y no se registra de nuevo.
// TODO: En la la informacion del formulario, agregar una opcion para indicar que es de otra persona.
// TODO: En la informacion del formulario, agregar un campo para indicar el codigo postal.
// TODO: Integrar funcionalidad de subida de imágenes usando PayloadCMS media collection
