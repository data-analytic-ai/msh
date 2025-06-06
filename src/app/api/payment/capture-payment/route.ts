/**
 * API para capturar un pago retenido en Stripe
 *
 * Esta ruta se llama cuando el servicio ha sido completado y verificado,
 * para liberar los fondos retenidos al contratista.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { ServiceRequestsStore } from '@/lib/service-requests-store'
import { createPaymentNotification } from '../../contractor/notifications/route'
import { releasePayment } from '../../contractor/jobs/route'

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

    // Verificar que la solicitud de servicio existe
    const serviceRequest = ServiceRequestsStore.get(serviceRequestId)

    if (!serviceRequest) {
      console.log(`❌ Solicitud de servicio no encontrada: ${serviceRequestId}`)
      console.log(
        '📋 Solicitudes disponibles:',
        ServiceRequestsStore.getAllEntries().map(([id]) => id),
      )

      // Para desarrollo, permitir capturar el pago aunque no tengamos la solicitud
      console.log('🔄 Procediendo con captura de pago para desarrollo...')
    } else {
      console.log(`✅ Solicitud de servicio encontrada: ${serviceRequestId}`, serviceRequest)
    }

    try {
      // Capturar el pago (liberar los fondos retenidos)
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)

      console.log(`💰 Pago capturado exitosamente: ${paymentIntentId}`)

      // Actualizar el estado usando el store compartido
      if (serviceRequest) {
        ServiceRequestsStore.update(serviceRequestId, {
          paymentStatus: 'captured',
          status: 'completed',
        })

        // Notificar al contratista sobre el pago liberado
        if (serviceRequest.contractorId) {
          createPaymentNotification(
            serviceRequest.contractorId,
            serviceRequestId,
            serviceRequest.amount,
          )

          // Intentar liberar el pago en el sistema del contratista
          try {
            await releasePayment(serviceRequest.contractorId, serviceRequestId)
          } catch (error) {
            console.log('⚠️ No se pudo actualizar el estado en el sistema del contratista:', error)
          }
        }
      }

      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: 'Pago capturado exitosamente',
      })
    } catch (stripeError: any) {
      console.error('❌ Error de Stripe al capturar pago:', stripeError)

      // Actualizar estado como fallido si existe la solicitud
      if (serviceRequest) {
        ServiceRequestsStore.update(serviceRequestId, {
          paymentStatus: 'failed',
        })
      }

      return NextResponse.json(
        { error: `Error al capturar el pago: ${stripeError.message}` },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('❌ Error general al capturar el pago:', error)
    return NextResponse.json(
      { error: error.message || 'Error al capturar el pago' },
      { status: 500 },
    )
  }
}

// Función auxiliar para obtener una solicitud de servicio
export function getServiceRequest(id: string) {
  return ServiceRequestsStore.get(id)
}

// Función auxiliar para listar todas las solicitudes (para debugging)
export function getAllServiceRequests() {
  return ServiceRequestsStore.getAllEntries()
}
