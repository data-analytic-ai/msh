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
  apiVersion: '2025-03-31.basil',
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
    try {
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
          paymentStatus: 'captured',
        },
      })

      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
      })
    } catch (payloadError: any) {
      console.error('Error con Payload CMS:', payloadError)
      if (payloadError.message && payloadError.message.includes("can't be found")) {
        return NextResponse.json(
          { error: 'Error de configuración: La colección service-requests no está disponible.' },
          { status: 500 },
        )
      }
      throw payloadError // Re-lanzar para que sea capturado por el catch exterior
    }
  } catch (error: any) {
    console.error('Error al capturar el pago:', error)
    return NextResponse.json(
      { error: error.message || 'Error al capturar el pago' },
      { status: 500 },
    )
  }
}
