'use client'

/**
 * TrackingPage - Página de seguimiento del servicio
 *
 * Muestra el estado actual del servicio solicitado y permite al cliente
 * comunicarse con el contratista, además de confirmar la finalización
 * del servicio para liberar el pago retenido.
 *
 * @returns {JSX.Element} Componente de página de seguimiento
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Phone, MessageCircle, MapPin, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { capturePayment } from '@/lib/stripe-client'
import { Badge } from '@/components/ui/badge'

// Enum para los estados del servicio
enum ServiceStatus {
  CONFIRMED = 'confirmed',
  ON_WAY = 'on_way',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export default function TrackingPage() {
  const router = useRouter()
  const { selectedContractor, requestId, formData, setCurrentStep } = useServiceRequest()
  const [currentStatus, setCurrentStatus] = useState<ServiceStatus>(ServiceStatus.CONFIRMED)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [serviceRequestId, setServiceRequestId] = useState<string | null>(null)

  // Marcar el paso actual en el contexto
  useEffect(() => {
    setCurrentStep('tracking')
  }, [setCurrentStep])

  // Obtener IDs del sessionStorage o formData
  useEffect(() => {
    // Obtener paymentIntentId
    const storedPaymentIntentId = sessionStorage.getItem('paymentIntentId')
    if (storedPaymentIntentId) {
      setPaymentIntentId(storedPaymentIntentId)
    } else if (formData && formData.paymentIntentId) {
      setPaymentIntentId(formData.paymentIntentId)
    }

    // Obtener serviceRequestId
    const storedServiceRequestId = sessionStorage.getItem('serviceRequestId')
    if (storedServiceRequestId) {
      setServiceRequestId(storedServiceRequestId)
    } else if (requestId) {
      // Usar requestId del contexto como fallback
      setServiceRequestId(requestId)
    }

    console.log('🔍 IDs obtenidos:', {
      paymentIntentId: storedPaymentIntentId || formData?.paymentIntentId,
      serviceRequestId: storedServiceRequestId || requestId,
      contextRequestId: requestId,
    })
  }, [formData, requestId])

  // Para demo, vamos a simular el progreso del servicio
  useEffect(() => {
    // Simular progreso del servicio para la demo
    const statusProgression = [
      { status: ServiceStatus.CONFIRMED, delay: 0 },
      { status: ServiceStatus.ON_WAY, delay: 5000 },
      { status: ServiceStatus.ARRIVED, delay: 15000 },
      { status: ServiceStatus.IN_PROGRESS, delay: 20000 },
    ]

    // Configurar temporizadores para cambiar el estado
    const timers: NodeJS.Timeout[] = []

    statusProgression.forEach(({ status, delay }) => {
      const timer = setTimeout(() => {
        setCurrentStatus(status)
      }, delay)
      timers.push(timer)
    })

    // Limpiar temporizadores cuando el componente se desmonte
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  // Manejar la confirmación de finalización del servicio
  const handleConfirmCompletion = async () => {
    const finalServiceRequestId = serviceRequestId || requestId

    if (!finalServiceRequestId || !paymentIntentId) {
      setError('No se encontró información de la solicitud o del pago')
      console.error('❌ Faltan datos:', {
        serviceRequestId: finalServiceRequestId,
        paymentIntentId,
        requestId,
      })
      return
    }

    console.log('💳 Iniciando captura de pago:', {
      paymentIntentId,
      serviceRequestId: finalServiceRequestId,
    })

    setIsLoading(true)
    setError(null)

    try {
      // Capturar el pago retenido
      const result = await capturePayment(paymentIntentId, finalServiceRequestId)

      if (result && result.success) {
        // Actualizar el estado
        setCurrentStatus(ServiceStatus.COMPLETED)
        console.log('✅ Pago capturado exitosamente')

        // Limpiar los datos de sessionStorage
        setTimeout(() => {
          sessionStorage.removeItem('paymentIntentId')
          sessionStorage.removeItem('serviceRequestId')
          // Redirigir a la página de finalización
          router.push('/completion')
        }, 2000)
      } else {
        setError('No se pudo completar el pago. Contacte con soporte.')
        console.error('❌ Error en la respuesta:', result)
      }
    } catch (err: any) {
      console.error('Error al capturar el pago:', err)
      setError(err.message || 'Ocurrió un error al procesar el pago')
    } finally {
      setIsLoading(false)
    }
  }

  // Si no hay contratista seleccionado ni ID de solicitud, mostrar mensaje
  if (!selectedContractor && !requestId && !serviceRequestId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <h2 className="text-xl font-semibold">No hay servicio en progreso</h2>
          <p className="text-muted-foreground max-w-md">
            No se encontró información de un servicio en curso.
          </p>
          <Button asChild>
            <Link href="/">Solicitar un servicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Obtener información del contratista
  const contractorName = selectedContractor
    ? `${selectedContractor.name} ${selectedContractor.lastName || ''}`
    : 'Contratista'
  const contractorRating = selectedContractor?.rating || 4.9
  const contractorService = selectedContractor?.services?.join(', ') || 'Servicio'

  // Usar el ID que esté disponible para mostrar
  const displayRequestId = serviceRequestId || requestId

  // Textos para cada estado
  const statusMessages = {
    [ServiceStatus.CONFIRMED]: 'Tu solicitud ha sido confirmada y asignada a Juan Pérez.',
    [ServiceStatus.ON_WAY]: 'El contratista está en camino. Llegará en aproximadamente 5 minutos.',
    [ServiceStatus.ARRIVED]: 'El contratista ha llegado a tu ubicación.',
    [ServiceStatus.IN_PROGRESS]: 'El contratista está trabajando en resolver tu problema.',
    [ServiceStatus.COMPLETED]:
      'El servicio ha sido completado. Por favor confirma y califica al contratista.',
  }

  return (
    <div className="container mx-auto px-4 py-6 dark:text-white">
      {/* Navegación */}
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Título de la página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Seguimiento</h1>
        <p className="text-muted-foreground">Sigue el progreso de tu servicio solicitado</p>
        {displayRequestId && (
          <Badge variant="outline" className="mt-2">
            ID: {displayRequestId}
          </Badge>
        )}
      </div>

      {/* Información del contratista */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-lg font-bold">
              {contractorName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{contractorName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {contractorService} • {contractorRating} ★
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado del servicio */}
      <div className="bg-background rounded-lg shadow-sm border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Estado del servicio</h2>

        <div className="space-y-6">
          {/* Estado 1: Confirmado */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  currentStatus === ServiceStatus.CONFIRMED ||
                  currentStatus === ServiceStatus.ON_WAY ||
                  currentStatus === ServiceStatus.ARRIVED ||
                  currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED
                    ? 'bg-success text-success-foreground'
                    : 'border border-muted'
                }`}
              >
                {(currentStatus === ServiceStatus.CONFIRMED ||
                  currentStatus === ServiceStatus.ON_WAY ||
                  currentStatus === ServiceStatus.ARRIVED ||
                  currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED) && <Check className="h-4 w-4" />}
              </div>
              {currentStatus !== ServiceStatus.COMPLETED && (
                <div className="w-0.5 grow bg-muted my-1"></div>
              )}
            </div>
            <div>
              <h3 className="font-medium">Confirmado</h3>
              <p className="text-sm text-muted-foreground">
                {statusMessages[ServiceStatus.CONFIRMED]}
              </p>
            </div>
          </div>

          {/* Estado 2: En camino */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  currentStatus === ServiceStatus.ON_WAY ||
                  currentStatus === ServiceStatus.ARRIVED ||
                  currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED
                    ? 'bg-success text-success-foreground'
                    : 'border border-muted'
                }`}
              >
                {(currentStatus === ServiceStatus.ON_WAY ||
                  currentStatus === ServiceStatus.ARRIVED ||
                  currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED) && <Check className="h-4 w-4" />}
              </div>
              {currentStatus !== ServiceStatus.COMPLETED && (
                <div className="w-0.5 grow bg-muted my-1"></div>
              )}
            </div>
            <div>
              <h3 className="font-medium">En camino</h3>
              <p className="text-sm text-muted-foreground">
                {statusMessages[ServiceStatus.ON_WAY]}
              </p>
            </div>
          </div>

          {/* Estado 3: Llegó */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  currentStatus === ServiceStatus.ARRIVED ||
                  currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED
                    ? 'bg-success text-success-foreground'
                    : 'border border-muted'
                }`}
              >
                {(currentStatus === ServiceStatus.ARRIVED ||
                  currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED) && <Check className="h-4 w-4" />}
              </div>
              {currentStatus !== ServiceStatus.COMPLETED && (
                <div className="w-0.5 grow bg-muted my-1"></div>
              )}
            </div>
            <div>
              <h3 className="font-medium">Llegó</h3>
              <p className="text-sm text-muted-foreground">
                {statusMessages[ServiceStatus.ARRIVED]}
              </p>
            </div>
          </div>

          {/* Estado 4: En progreso */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED
                    ? 'bg-success text-success-foreground'
                    : 'border border-muted'
                }`}
              >
                {(currentStatus === ServiceStatus.IN_PROGRESS ||
                  currentStatus === ServiceStatus.COMPLETED) && <Check className="h-4 w-4" />}
              </div>
              {currentStatus !== ServiceStatus.COMPLETED && (
                <div className="w-0.5 grow bg-muted my-1"></div>
              )}
            </div>
            <div>
              <h3 className="font-medium">En progreso</h3>
              <p className="text-sm text-muted-foreground">
                {statusMessages[ServiceStatus.IN_PROGRESS]}
              </p>
            </div>
          </div>

          {/* Estado 5: Completado */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  currentStatus === ServiceStatus.COMPLETED
                    ? 'bg-success text-success-foreground'
                    : 'border border-muted'
                }`}
              >
                {currentStatus === ServiceStatus.COMPLETED && <Check className="h-4 w-4" />}
              </div>
            </div>
            <div>
              <h3 className="font-medium">Completado</h3>
              <p className="text-sm text-muted-foreground">
                {statusMessages[ServiceStatus.COMPLETED]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acción de confirmación */}
      <div className="space-y-4 dark:text-white">
        {currentStatus === ServiceStatus.IN_PROGRESS ? (
          <>
            <Button
              onClick={handleConfirmCompletion}
              disabled={isLoading}
              className="w-full bg-success hover:bg-success/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Procesando...
                </span>
              ) : (
                'Confirmar finalización del servicio'
              )}
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <p className="text-sm text-muted-foreground text-center">
              Al confirmar la finalización, el pago retenido será liberado al contratista.
            </p>
          </>
        ) : currentStatus === ServiceStatus.COMPLETED ? (
          <div className="bg-success/50 text-success-foreground p-4 rounded-lg text-center dark:text-white">
            <h3 className="text-lg font-semibold mb-2">¡Servicio completado!</h3>
            <p className="text-sm">
              El pago ha sido procesado. Gracias por utilizar nuestros servicios.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Podrás confirmar la finalización del servicio cuando el contratista termine su trabajo.
          </p>
        )}
      </div>
    </div>
  )
}
