'use client'

/**
 * PaymentForm - Formulario de pago con Stripe
 *
 * Componente para procesar pagos utilizando Stripe Elements.
 * Muestra un formulario para ingresar los datos de la tarjeta y procesar el pago.
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.clientSecret - Client secret generado por Stripe
 * @param {number} props.amount - Monto a pagar
 * @param {Function} props.onSuccess - Función a ejecutar cuando el pago es exitoso
 * @param {Function} props.onError - Función a ejecutar cuando hay un error
 * @returns {JSX.Element} - Componente de formulario de pago
 */

import React, { useState, useEffect } from 'react'
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Info, Shield } from 'lucide-react'

// Wrapper que proporciona el provider de Stripe
export const PaymentFormWrapper = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  contractorName,
}: {
  clientSecret: string
  amount: number
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
  contractorName: string
}) => {
  const stripePromise = getStripe()

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        contractorName={contractorName}
      />
    </Elements>
  )
}

// Componente de formulario de pago
function PaymentForm({
  amount,
  onSuccess,
  onError,
  contractorName,
}: {
  amount: number
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
  contractorName: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirmar el pago con los datos de la tarjeta
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/request-service/confirmation`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'Hubo un error al procesar el pago')
        onError(error.message || 'Hubo un error al procesar el pago')
      } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
        // El pago fue autorizado y se retiene hasta la captura
        onSuccess(paymentIntent.id)
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocurrió un error inesperado')
      onError(error.message || 'Ocurrió un error inesperado')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-[500px] mx-auto">
      <CardHeader>
        <CardTitle>Pago de Servicio</CardTitle>
        <CardDescription>
          El pago se retendrá hasta confirmar la finalización del servicio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">Contratista</span>
              <p className="font-medium">{contractorName}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Monto</span>
              <p className="font-medium text-lg">${amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p>El pago se retendrá hasta que confirmes la finalización del servicio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{errorMessage}</div>
            )}

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">Tus datos de pago están seguros y encriptados</span>
              </div>
            </div>
          </form>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Procesando...' : 'Pagar y confirmar'}
        </Button>
        <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>El proceso de pago puede tardar unos segundos</span>
        </div>
      </CardFooter>
    </Card>
  )
}
