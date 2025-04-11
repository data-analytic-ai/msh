'use client'

/**
 * ConfirmationPage
 *
 * Página de confirmación que muestra al usuario que su solicitud de servicio
 * ha sido recibida correctamente y le proporciona información de seguimiento.
 */
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocationType, ServiceType, useServiceRequest } from '@/context/ServiceRequestContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Check,
  ArrowLeft,
  Calendar,
  MapPin,
  Wrench,
  AlertTriangle,
  FileText,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import MapComponent from '@/components/ui/MapComponent'

// Mapeo de tipos de servicio a nombres legibles
const serviceNames: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  glass: 'Windows',
  hvac: 'HVAC',
  pests: 'Pest Control',
  locksmith: 'Locksmith',
  roofing: 'Roofing',
  siding: 'Siding',
  general: 'General Repairs',
}

// Definir el tipo urgency para eliminar el error
type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

export default function ConfirmationPage() {
  const {
    selectedServices,
    location,
    formattedAddress,
    formData,
    requestId,
    userEmail,
    syncWithDatabase,
    isAuthenticated,
    login,
  } = useServiceRequest()

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const currentTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Try to recover data if we don't have it but we have an email
  useEffect(() => {
    // If we don't have essential data but we have a user email, try to sync
    if ((!selectedServices || !location || !requestId) && userEmail) {
      handleSyncRequest()
    }
  }, [selectedServices, location, requestId, userEmail ])

  const handleSyncRequest = async () => {
    if (!userEmail) return

    setIsSyncing(true)
    try {
      const response = await fetch(`/api/user-requests?email=${userEmail}`)
      if (response.ok) {
        const data = await response.json()
        if (data.userToken) {
          // If we received a token, login the user
          login(userEmail, data.userToken)
        }
        await syncWithDatabase()
      }
    } catch (error) {
      console.error('Error syncing with database:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleFindContractors = () => {
    setIsLoading(true)

    // If the user is not authenticated, we need to create an account or login
    if (!isAuthenticated && userEmail) {
      // Try to authenticate the user and then redirect
      handleSyncRequest().then(() => {
        router.push('/request-service/find-contractor')
      })
    } else {
      // User is already authenticated, redirect directly
      setTimeout(() => {
        setIsLoading(false)
        router.push('/request-service/find-contractor')
      }, 1000)
    }
  }

  // If we are syncing, show a loading state
  if (isSyncing) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="ml-4 text-lg font-semibold">Recovering Request...</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Recovering your request information...</p>
            <p className="text-sm text-muted-foreground">Please wait a moment</p>
          </div>
        </main>
      </div>
    )
  }

  // If we don't have the required information, show a loading state
  if (!selectedServices || !location) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to home
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
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="ml-4 text-lg font-semibold">Request Submitted</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="space-y-6">
          {/* Mapa en modo solo lectura */}
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <MapComponent
              selectedService={selectedServices}
              location={location}
              setLocation={() => {}}
              onContinue={() => {}}
              formattedAddress={formattedAddress}
              readOnly={true}
            />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Request submitted!</h2>
                <p className="text-muted-foreground">
                  Your request has been successfully submitted. We will now find available
                  contractors in your area.
                </p>
                <div className="text-sm font-medium text-muted-foreground border-t pt-4">
                  <p>Reference ID: {requestId || 'Not available'}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold px-4 pt-4">Request Summary</h3>
              <></>

              <div className="flex items-start gap-3 pb-2 border-b">
                <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Service Location</h4>
                  <p className="text-sm text-muted-foreground">{formattedAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-2 border-b">
                <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Submission Date & Time</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentDate} at {currentTime}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                    <Wrench className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-medium">Service Type</h5>
                    <p className="text-sm text-muted-foreground">
                      {selectedServices.length > 0
                        ? selectedServices.map((service) => serviceNames[service]).join(', ')
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {formData?.urgency && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium">Urgency</h5>
                      <p className="text-sm text-muted-foreground">
                        {{
                          low: 'Low - Within a week',
                          medium: 'Medium - Within 48 hours',
                          high: 'High - Within 24 hours',
                          emergency: 'Emergency - As soon as possible',
                        }[formData.urgency as UrgencyLevel] || 'Not specified'}
                      </p>
                    </div>
                  </div>
                )}

                {formData?.description && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium">Description</h5>
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What happens next?</h3>
            <div className="bg-muted p-4 rounded-md">
              <ol className="list-decimal list-inside space-y-2">
                <li>Professionals in your area will receive notification of your request.</li>
                <li>Within the next 24 hours, you should receive responses.</li>
                <li>We will send you updates via email and phone.</li>
                <li>You can select the professional that best suits your needs.</li>
              </ol>
            </div>
          </div>

          <Button
            onClick={handleFindContractors}
            className="w-full bg-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Finding contractors...
              </span>
            ) : (
              'View available contractors'
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
