/**
 * API para capturar un pago retenido en Stripe
 *
 * Esta ruta se llama cuando el servicio ha sido completado y verificado,
 * para liberar los fondos retenidos al contratista.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import payload from 'payload'

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, serviceRequestId } = body

    if (!paymentIntentId || !serviceRequestId) {
      return NextResponse.json(
        { error: 'Se requiere ID de intención de pago y ID de solicitud' },
        { status: 400 },
      )
    }

    // Verificar que el servicio está completado antes de capturar el pago
    const serviceRequest = await payload.findByID({
      collection: 'service-requests',
      id: serviceRequestId,
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Solicitud de servicio no encontrada' }, { status: 404 })
    }

    if (serviceRequest.status !== 'completed') {
      return NextResponse.json(
        { error: 'No se puede capturar el pago porque el servicio no está completado' },
        { status: 400 },
      )
    }

    // Capturar el pago (liberar los fondos retenidos)
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)

    // Actualizar el estado del pago en la solicitud de servicio
    await payload.update({
      collection: 'service-requests',
      id: serviceRequestId,
      data: {
        paymentStatus: 'completed',
      },
    })

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    })
  } catch (error: any) {
    console.error('Error al capturar el pago:', error)
    return NextResponse.json(
      { error: error.message || 'Error al capturar el pago' },
      { status: 500 },
    )
  }
}
