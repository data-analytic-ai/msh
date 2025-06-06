/**
 * API para notificaciones del contratista
 *
 * Permite al contratista recibir notificaciones de:
 * - Nuevos trabajos asignados
 * - Pagos liberados
 * - Mensajes de clientes
 */

import { NextRequest, NextResponse } from 'next/server'
import { ServiceRequestsStore } from '@/lib/service-requests-store'

export interface ContractorNotification {
  id: string
  type: 'new_job' | 'payment_released' | 'client_message'
  title: string
  message: string
  serviceRequestId?: string
  amount?: number
  clientName?: string
  createdAt: Date
  read: boolean
}

// Almacenamiento temporal de notificaciones por contratista
const contractorNotifications = new Map<string, ContractorNotification[]>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractorId')

    if (!contractorId) {
      return NextResponse.json({ error: 'Se requiere ID del contratista' }, { status: 400 })
    }

    // Obtener notificaciones del contratista
    const notifications = contractorNotifications.get(contractorId) || []

    // Contar notificaciones no leídas
    const unreadCount = notifications.filter((n) => !n.read).length

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    })
  } catch (error: any) {
    console.error('Error al obtener notificaciones:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener notificaciones' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractorId, type, title, message, serviceRequestId, amount, clientName } = body

    if (!contractorId || !type || !title || !message) {
      return NextResponse.json({ error: 'Se requieren campos obligatorios' }, { status: 400 })
    }

    // Crear nueva notificación
    const notification: ContractorNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      serviceRequestId,
      amount,
      clientName,
      createdAt: new Date(),
      read: false,
    }

    // Agregar a las notificaciones del contratista
    const existingNotifications = contractorNotifications.get(contractorId) || []
    existingNotifications.unshift(notification) // Agregar al inicio

    // Mantener solo las últimas 50 notificaciones
    if (existingNotifications.length > 50) {
      existingNotifications.splice(50)
    }

    contractorNotifications.set(contractorId, existingNotifications)

    console.log(`📢 Nueva notificación para contratista ${contractorId}:`, notification)

    return NextResponse.json({
      success: true,
      notification,
    })
  } catch (error: any) {
    console.error('Error al crear notificación:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear notificación' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractorId, notificationId, read } = body

    if (!contractorId || !notificationId) {
      return NextResponse.json(
        { error: 'Se requiere ID del contratista y de la notificación' },
        { status: 400 },
      )
    }

    // Obtener notificaciones del contratista
    const notifications = contractorNotifications.get(contractorId) || []

    // Encontrar y actualizar la notificación
    const notificationIndex = notifications.findIndex((n) => n.id === notificationId)

    if (notificationIndex === -1) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 })
    }

    notifications[notificationIndex].read = read !== undefined ? read : true
    contractorNotifications.set(contractorId, notifications)

    console.log(`✅ Notificación ${notificationId} marcada como ${read ? 'leída' : 'no leída'}`)

    return NextResponse.json({
      success: true,
      notification: notifications[notificationIndex],
    })
  } catch (error: any) {
    console.error('Error al actualizar notificación:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar notificación' },
      { status: 500 },
    )
  }
}

// Función auxiliar para crear notificación de nuevo trabajo
export function createJobNotification(
  contractorId: string,
  serviceRequestId: string,
  clientName: string,
  amount: number,
) {
  const notification: ContractorNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'new_job',
    title: 'Nuevo trabajo asignado',
    message: `${clientName} ha solicitado un servicio. Monto: $${amount}`,
    serviceRequestId,
    amount,
    clientName,
    createdAt: new Date(),
    read: false,
  }

  const existingNotifications = contractorNotifications.get(contractorId) || []
  existingNotifications.unshift(notification)

  if (existingNotifications.length > 50) {
    existingNotifications.splice(50)
  }

  contractorNotifications.set(contractorId, existingNotifications)

  console.log(`📢 Notificación de trabajo creada para ${contractorId}:`, notification)
  return notification
}

// Función auxiliar para crear notificación de pago liberado
export function createPaymentNotification(
  contractorId: string,
  serviceRequestId: string,
  amount: number,
) {
  const notification: ContractorNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'payment_released',
    title: 'Pago liberado',
    message: `Se ha liberado el pago de $${amount} para el servicio #${serviceRequestId}`,
    serviceRequestId,
    amount,
    createdAt: new Date(),
    read: false,
  }

  const existingNotifications = contractorNotifications.get(contractorId) || []
  existingNotifications.unshift(notification)

  if (existingNotifications.length > 50) {
    existingNotifications.splice(50)
  }

  contractorNotifications.set(contractorId, existingNotifications)

  console.log(`💰 Notificación de pago creada para ${contractorId}:`, notification)
  return notification
}
