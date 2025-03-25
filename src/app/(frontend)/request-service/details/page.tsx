'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/contexts/ServiceRequestContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Camera } from 'lucide-react'
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

export default function RequestServiceDetailsPage() {
  const { selectedService, location } = useServiceRequest()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [images, setImages] = React.useState<string[]>([])

  // Check if we have the required information
  useEffect(() => {
    if (!selectedService || !location) {
      // If information is missing, redirect to the service request page
      router.replace('/request-service')
    }
  }, [selectedService, location, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Here would be the logic to send the request to the backend
    // Including selectedService and location from the context

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push('/request-service/confirmation')
    }, 1500)
  }

  // If we don't have the required information, show a loading state
  if (!selectedService || !location) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Link href="/request-service" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="ml-4 text-lg font-semibold">Complete Request</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Summary of previous selection */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <h2 className="font-semibold text-lg">Selected Information:</h2>
            <p>
              <strong>Service:</strong> {serviceNames[selectedService]}
            </p>
            <p>
              <strong>Location:</strong> Lat: {location.lat.toFixed(4)}, Lng:{' '}
              {location.lng.toFixed(4)}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Describe your emergency
            </label>
            <Textarea
              id="description"
              placeholder="Describe the problem in as much detail as possible..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <p className="block text-sm font-medium">Photos (optional)</p>
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md bg-muted">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="h-full w-full rounded-md object-cover"
                  />
                </div>
              ))}
              {images.length < 3 && (
                <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-muted-foreground/50">
                  <label
                    htmlFor="image-upload"
                    className="flex cursor-pointer flex-col items-center justify-center p-2 text-center"
                  >
                    <Camera className="mb-1 h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add photo</span>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contact" className="block text-sm font-medium">
              Contact phone
            </label>
            <Input id="contact" type="tel" placeholder="Phone number" required />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit request'}
          </Button>
        </form>
      </main>
    </div>
  )
}
