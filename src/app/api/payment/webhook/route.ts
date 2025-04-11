/**
 * Webhook de Stripe para manejar eventos
 *
 * Este endpoint recibe y procesa eventos enviados por Stripe
 * como pagos exitosos, fallos, disputas, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import payload from 'payload'
import { headers } from 'next/headers'

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature') as string

  let event: Stripe.Event

  try {
    // Verificar la firma del webhook para asegurarnos que proviene de Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    )
  } catch (err: any) {
    console.error(`Error al verificar la firma del webhook: ${err.message}`)
    return NextResponse.json(
      { error: `Error de firma del webhook: ${err.message}` },
      { status: 400 },
    )
  }

  // Manejar diferentes tipos de eventos
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Solo procesar si el pago está en estado "succeeded"
        if (paymentIntent.status === 'succeeded') {
          const serviceRequestId = paymentIntent.metadata.serviceRequestId

          if (serviceRequestId) {
            // Actualizar el estado del pago en la base de datos
            await payload.update({
              collection: 'service-requests',
              id: serviceRequestId,
              data: {
                paymentStatus: 'completed',
              },
            })
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        const failedServiceRequestId = failedPayment.metadata.serviceRequestId

        if (failedServiceRequestId) {
          // Actualizar el estado del pago en la base de datos
          await payload.update({
            collection: 'service-requests',
            id: failedServiceRequestId,
            data: {
              paymentStatus: 'failed',
            },
          })
        }
        break

      default:
        console.log(`Evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Error al procesar el evento: ${error.message}`)
    return NextResponse.json(
      { error: `Error al procesar el evento: ${error.message}` },
      { status: 500 },
    )
  }
}
