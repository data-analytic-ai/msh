'use client'

/**
 * PaymentPage - Página de pago de servicios
 *
 * Muestra información del contratista seleccionado y el formulario de pago.
 * Maneja la creación de la intención de pago y la redirección después del pago.
 *
 * @returns {JSX.Element} - Componente de página de pago
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { PaymentFormWrapper } from '@/components/payment/PaymentForm'
import { createPaymentIntent } from '@/lib/stripe-client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import { formatCurrency } from '@/lib/payment-config'

export default function PaymentPage() {
  const router = useRouter()
  const { selectedContractor, location, setCurrentStep } = useServiceRequest()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serviceRequestId, setServiceRequestId] = useState<string>(uuidv4())

  // Marcar el paso actual en el contexto
  useEffect(() => {
    setCurrentStep('payment')
  }, [setCurrentStep])

  // Precio estimado (podría venir del contratista o ser estimado según el servicio)
  const estimatedPrice = 450 // En dólares estadounidenses (USD)

  // Tiempo estimado de llegada
  const estimatedArrivalTime = '10-15 minutos'

  useEffect(() => {
    // Verificar si hay un contratista seleccionado
    if (!selectedContractor) {
      router.push('/find-contractor')
      return
    }

    // Crear intención de pago con Stripe
    const initPayment = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Crear ID de usuario ficticio (en un caso real, debería venir del sistema de autenticación)
        const mockCustomerId = 'customer_' + Date.now()

        // Crear intención de pago
        const result = await createPaymentIntent(
          estimatedPrice,
          serviceRequestId,
          selectedContractor.id,
          mockCustomerId,
          `Servicio de ${selectedContractor.services.join(', ')}`,
        )

        if (result && result.clientSecret) {
          setClientSecret(result.clientSecret)
          setPaymentIntentId(result.paymentIntentId)
        } else {
          setError('No se pudo inicializar el pago. Inténtelo nuevamente.')
        }
      } catch (err: any) {
        console.error('Error al inicializar el pago:', err)
        setError(err.message || 'Ocurrió un error al procesar el pago')
      } finally {
        setIsLoading(false)
      }
    }

    initPayment()
  }, [selectedContractor, router, serviceRequestId])

  // Manejar pago exitoso
  const handlePaymentSuccess = (paymentId: string) => {
    // Guardar ID de la solicitud y ID del pago en sessionStorage para uso posterior
    sessionStorage.setItem('serviceRequestId', serviceRequestId)
    sessionStorage.setItem('paymentIntentId', paymentId)

    // Redirigir a la página de seguimiento
    router.push('/tracking')
  }

  // Manejar error en el pago
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // Si no hay contratista seleccionado, mostrar mensaje
  if (!selectedContractor && !isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <h2 className="text-xl font-semibold">No hay contratista seleccionado</h2>
          <p className="text-muted-foreground max-w-md">
            Para proceder con el pago, primero seleccione un contratista.
          </p>
          <Button asChild>
            <Link href="/find-contractor">Seleccionar contratista</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 dark:text-white">
      {/* Navegación */}
      <div className="mb-6">
        <Link href="/find-contractor" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver a selección de contratista
        </Link>
      </div>

      {/* Título de la página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pago</h1>
        <p className="text-muted-foreground">
          Complete los datos de pago para solicitar el servicio
        </p>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-background rounded-lg dark:bg-background ">
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-6 bg-error-light text-error-light-foreground rounded-md">
              <p className="font-semibold mb-2">Error:</p>
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>
                Reintentar
              </Button>
            </div>
          ) : clientSecret ? (
            <PaymentFormWrapper
              clientSecret={clientSecret}
              amount={estimatedPrice}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              contractorName={`${selectedContractor.name} ${selectedContractor.lastName || ''}`}
            />
          ) : (
            <div className="p-6 bg-warning-light text-warning-light-foreground rounded-md">
              <p>No se pudo inicializar el pago. Inténtelo nuevamente.</p>
            </div>
          )}
        </div>

        {/* Información del contratista */}
        <div className="bg-background text-foreground p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Detalles del servicio</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contratista</h3>
              <p className="font-medium">
                {selectedContractor?.name} {selectedContractor?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedContractor?.services?.join(', ')}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Precio estimado</h3>
              <p className="font-medium">{formatCurrency(estimatedPrice)}</p>
              <p className="text-xs text-muted-foreground">
                El precio final puede variar según el trabajo realizado
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Tiempo estimado de llegada
              </h3>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                <p className="font-medium">{estimatedArrivalTime}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm">
                El pago se retendrá hasta que confirmes que el servicio ha sido completado
                satisfactoriamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
