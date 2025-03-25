'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Camera, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { use } from 'react'

// Tipos de servicios disponibles
const services = [
  { type: 'plumbing', icon: '🚿', name: 'Plomería' },
  { type: 'electrical', icon: '⚡', name: 'Electricidad' },
  { type: 'glass', icon: '🪟', name: 'Vidrios' },
  { type: 'hvac', icon: '🔥', name: 'HVAC' },
  { type: 'pests', icon: '🐜', name: 'Control de Plagas' },
  { type: 'locksmith', icon: '🔑', name: 'Cerrajería' },
]

export default function RequestServiceByTypePage({
  params,
}: {
  params: Promise<{ service: string }>
}) {
  // Obtener el valor de service del parámetro de ruta
  const { service } = use(params)
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [step, setStep] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtener datos de la URL
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  // Usar useMemo para evitar recrear el objeto en cada renderizado
  const location = useMemo(() => {
    return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
  }, [lat, lng])

  const selectedService = service
  const serviceInfo = services.find((s) => s.type === selectedService)

  useEffect(() => {
    // Si no hay ubicación, redireccionar a la página principal de solicitud
    if (!location) {
      router.push('/')
    }
  }, [location, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular API call
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 1500)
  }

  const handleFindContractors = () => {
    setIsLoading(true)
    // Simular API call
    setTimeout(() => {
      setIsLoading(false)
      router.push('/contractors')
    }, 2000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Link href="/request-service" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <h1 className="ml-4 text-lg font-semibold">
            Solicitar {serviceInfo?.name || 'Servicio'}
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mostramos la información del servicio seleccionado */}
            <div className="p-4 bg-primary/10 rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{serviceInfo?.icon}</div>
                <div>
                  <h2 className="font-semibold">{serviceInfo?.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Ubicación:{' '}
                    {location
                      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                      : 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Describe tu emergencia</Label>
              <Textarea
                id="description"
                placeholder="Describe el problema lo más detallado posible..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Fotos (opcional)</Label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md bg-muted">
                    <Image
                      src={image}
                      alt={`Uploaded ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, 33vw"
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
                      <span className="text-xs text-muted-foreground">Añadir foto</span>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Continuar'}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Solicitud enviada</h2>
                <p className="text-muted-foreground">
                  Tu solicitud ha sido enviada correctamente. Ahora buscaremos contratistas
                  disponibles en tu zona.
                </p>
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resumen de la solicitud</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de servicio:</span>
                  <span className="font-medium">{serviceInfo?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="font-medium">
                    {location
                      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                      : 'No especificada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">Hoy, {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleFindContractors}
              className="w-full bg-secondary hover:bg-secondary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Buscando contratistas...
                </span>
              ) : (
                'Buscar contratistas'
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
