/**
 * Cliente de Stripe para el frontend
 *
 * Esta utilidad proporciona una instancia del cliente de Stripe
 * para utilizarse en componentes del lado del cliente.
 */

import { loadStripe } from '@stripe/stripe-js'

// Cargar la instancia de Stripe una sola vez para mejorar el rendimiento
let stripePromise: Promise<any> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

/**
 * Crea una intención de pago en Stripe
 *
 * @param amount - Cantidad a cobrar
 * @param serviceRequestId - ID de la solicitud de servicio
 * @param contractorId - ID del contratista
 * @param customerId - ID del cliente
 * @param description - Descripción del servicio
 * @returns Client secret para usar en el formulario de pago
 */
export const createPaymentIntent = async (
  amount: number,
  serviceRequestId: string,
  contractorId: string,
  customerId: string,
  description?: string,
) => {
  try {
    const response = await fetch('/api/payment/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        serviceRequestId,
        contractorId,
        customerId,
        description,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al crear intención de pago')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Error al crear intención de pago:', error)
    throw error
  }
}

/**
 * Captura un pago retenido (libera los fondos al contratista)
 *
 * @param paymentIntentId - ID de la intención de pago a capturar
 * @param serviceRequestId - ID de la solicitud de servicio
 * @returns Resultado de la operación
 */
export const capturePayment = async (paymentIntentId: string, serviceRequestId: string) => {
  try {
    const response = await fetch('/api/payment/capture-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        serviceRequestId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al capturar el pago')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error al capturar pago:', error)
    throw error
  }
}
