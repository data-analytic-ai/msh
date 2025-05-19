'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import MapComponent from '@/components/ui/MapComponent'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getClientSideURL } from '@/utilities/getURL'
import { useServiceRequestStore } from '@/store/serviceRequestStore'

// Service type name mappings
const serviceNames: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  glass: 'Windows',
  hvac: 'HVAC',
  pests: 'Pest Control',
  locksmith: 'Locksmith',
}

type FormData = {
  fullName: string
  email: string
  phone: string
  description: string
  urgency: string
  images: string[]
}

export default function RequestServiceDetailsPage() {
  const {
    selectedServices,
    location,
    formattedAddress,
    setFormattedAddress,
    setRequestId,
    updateFormData,
    setUserEmail,
    submitServiceRequest,
    setCurrentStep,
  } = useServiceRequest()

  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [images, setImages] = React.useState<string[]>([])
  const [formData, setFormData] = React.useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    description: '',
    urgency: 'emergency',
    images: [],
  })

  // Marcar el paso actual en el contexto
  useEffect(() => {
    setCurrentStep('details')

    // Debugging para detectar problemas de estado
    console.log('Estado en details:', {
      selectedServices,
      location,
      formattedAddress,
      currentStep: 'details',
    })
  }, [setCurrentStep, selectedServices, location, formattedAddress])

  // Verificar si tenemos la información formateada
  useEffect(() => {
    if (!formattedAddress && location) {
      // Si tenemos ubicación pero no dirección formateada, intentar obtenerla
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Save email to context for persistence across refreshes
    setUserEmail(formData.email)

    try {
      // Verificar que tenemos la ubicación antes de continuar
      if (!location) {
        throw new Error('No location selected')
      }

      // Log para diagnóstico
      console.log('Enviando formulario con datos:', {
        ...formData,
        selectedServices,
        location,
        formattedAddress,
      })

      // Guardar los datos del formulario en el contexto
      updateFormData({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        urgency: formData.urgency, // This matches the field name expected by the store
        images: images,
      })

      // Usar la función del contexto para enviar la solicitud
      const success = await submitServiceRequest(formData)

      if (!success) {
        throw new Error('Failed to submit service request')
      }

      // Verificar que se haya establecido el requestId correctamente
      const currentRequestId = useServiceRequestStore.getState().requestId
      console.log('Estado después de submitServiceRequest:', {
        requestId: currentRequestId,
        formData,
        success,
      })

      // Redireccionar a la página de confirmación
      setIsLoading(false)
      router.push('/request-service/confirmation')
    } catch (error) {
      console.error('Error sending request:', error)
      setIsLoading(false)
      // Mostrar mensaje de error al usuario
      alert(
        `Failed to submit request: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      )
    }
  }

  // Si no tenemos la información requerida, mostrar un estado de carga
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mapa en modo solo lectura */}
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

          {/* Summary of previous selection */}
          <div className="bg-primary/20 dark:text-white p-4 rounded-lg">
            <h2 className="font-semibold text-lg">Selected Service</h2>
            <p className="font-medium dark:text-white">
              {selectedServices.length > 0
                ? selectedServices
                    .map((service) => {
                      // Comprobar si es un objeto con id o un string directo
                      const serviceId = typeof service === 'object' ? service.id : service
                      return serviceNames[serviceId] || serviceId
                    })
                    .join(', ')
                : 'Not specified'}
            </p>
            <p className="text-sm mt-1 dark:text-white">
              Location: {formattedAddress || 'Loading address...'}
            </p>
          </div>

          {/* Customer information */}
          <div className="space-y-4 dark:text-white">
            <h2 className="font-semibold text-lg">Your Information</h2>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          {/* Request details */}
          <div className="space-y-4 dark:text-white ">
            <h2 className="font-semibold text-lg">Request Details</h2>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => handleSelectChange('urgency', value)}
                defaultValue="emergency"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Within a week</SelectItem>
                  <SelectItem value="medium">Medium - Within 48 hours</SelectItem>
                  <SelectItem value="high">High - Within 24 hours</SelectItem>
                  <SelectItem value="emergency">Emergency - As soon as possible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Describe your problem</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the problem with the most detail possible..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2 p-0 m-0">
              <p className="block text-sm font-medium">Photos (optional)</p>
              <div className="flex flex-wrap gap-2 w-full p-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md bg-muted w-[100px] h-[100px]"
                  >
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 40vw, 40vw"
                    />
                  </div>
                ))}
                {images.length < 3 && (
                  <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-muted-foreground/50 w-[100px] h-[100px] p-2">
                    <label
                      htmlFor="image-upload"
                      className="flex cursor-pointer flex-col items-center justify-center"
                    >
                      <Camera className="mb-0.5 h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Add photo</span>
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
          </div>

          <div className="pb-8">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send request'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

// TODO: Funcionalidad que rellene los campos con la información del usuario si ya está registrado
// TODO: Verificar antes de enviar el formulario si el usuario ya esta registrado, se le pide iniciar sesion y no se registra de nuevo.
// TODO: En la la informacion del formulario, agregar una opcion para indicar que es de otra persona.
// TODO: En la informacion del formulario, agregar un campo para indicar el codigo postal.
