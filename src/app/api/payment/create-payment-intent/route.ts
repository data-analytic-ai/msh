/**
 * API para crear una intención de pago en Stripe
 *
 * Crea una intención de pago con el modo de captura manual para retener
 * el pago hasta que se confirme la finalización del servicio.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import payload from 'payload'

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil', // Versión requerida por los tipos instalados
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, serviceRequestId, contractorId, customerId, description } = body

    if (!amount || !serviceRequestId || !contractorId) {
      return NextResponse.json(
        { error: 'Se requiere monto, ID de solicitud y ID de contratista' },
        { status: 400 },
      )
    }

    // Crear la intención de pago con captura manual
    // Esto permite retener los fondos pero no transferirlos hasta confirmación
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: 'mxn',
      capture_method: 'manual', // Importante: permite retener el pago
      description: description || `Servicio #${serviceRequestId}`,
      metadata: {
        serviceRequestId,
        contractorId,
        customerId,
      },
    })

    // Actualizar la solicitud de servicio con el ID de la intención de pago
    try {
      await payload.update({
        collection: 'service-requests',
        id: serviceRequestId,
        data: {
          paymentStatus: 'pending',
          paymentIntentId: paymentIntent.id,
        },
      })
    } catch (error) {
      console.warn('No se pudo actualizar la colección service-requests:', error)
      // Continuar el proceso aún si falla la actualización
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error('Error al crear intención de pago:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pago' },
      { status: 500 },
    )
  }
}
