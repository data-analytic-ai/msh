'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/contexts/ServiceRequestContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Service type name mappings
const serviceNames: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  glass: 'Windows',
  hvac: 'HVAC',
  pests: 'Pest Control',
  locksmith: 'Locksmith',
}

export default function ConfirmationPage() {
  const { selectedService, location, resetRequest } = useServiceRequest()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  // Check if we have the required information
  useEffect(() => {
    if (!selectedService || !location) {
      // If information is missing, redirect to the service request page
      router.replace('/')
    }
  }, [selectedService, location, router])

  const handleFindContractors = () => {
    setIsLoading(true)
    // Simulate finding contractors
    setTimeout(() => {
      setIsLoading(false)
      // Reset the request state and navigate to the contractors page
      resetRequest()
      router.push('/contractors')
    }, 2000)
  }

  // If we don't have the required information, show a loading state
  if (!selectedService || !location) {
    return <div className="p-4">Loading...</div>
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
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service type:</span>
                <span className="font-medium">{serviceNames[selectedService]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
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
