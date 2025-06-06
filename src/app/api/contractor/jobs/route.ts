/**
 * API para gestión de trabajos del contratista
 *
 * Permite al contratista:
 * - Ver trabajos asignados
 * - Aceptar/rechazar trabajos
 * - Actualizar estado de trabajos
 * - Ver historial de trabajos
 */

import { NextRequest, NextResponse } from 'next/server'
import { ServiceRequestsStore } from '@/lib/service-requests-store'
import { createJobNotification, createPaymentNotification } from '../notifications/route'

export interface ContractorJob {
  id: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  service: string
  description?: string
  address: string
  amount: number
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'held' | 'released'
  createdAt: Date
  acceptedAt?: Date
  startedAt?: Date
  completedAt?: Date
  scheduledAt?: Date
  notes?: string
}

// Almacenamiento temporal de trabajos por contratista
const contractorJobs = new Map<string, ContractorJob[]>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractorId')
    const status = searchParams.get('status')

    if (!contractorId) {
      return NextResponse.json({ error: 'Se requiere ID del contratista' }, { status: 400 })
    }

    // Obtener trabajos del contratista
    let jobs = contractorJobs.get(contractorId) || []

    // Filtrar por estado si se especifica
    if (status) {
      jobs = jobs.filter((job) => job.status === status)
    }

    // Ordenar por fecha de creación (más recientes primero)
    jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Estadísticas
    const allJobs = contractorJobs.get(contractorId) || []
    const stats = {
      total: allJobs.length,
      assigned: allJobs.filter((j) => j.status === 'assigned').length,
      accepted: allJobs.filter((j) => j.status === 'accepted').length,
      inProgress: allJobs.filter((j) => j.status === 'in_progress').length,
      completed: allJobs.filter((j) => j.status === 'completed').length,
      cancelled: allJobs.filter((j) => j.status === 'cancelled').length,
    }

    return NextResponse.json({
      jobs,
      stats,
      total: jobs.length,
    })
  } catch (error: any) {
    console.error('Error al obtener trabajos del contratista:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener trabajos' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contractorId,
      clientName,
      clientPhone,
      clientEmail,
      service,
      description,
      address,
      amount,
      scheduledAt,
    } = body

    if (!contractorId || !clientName || !service || !address || !amount) {
      return NextResponse.json({ error: 'Se requieren campos obligatorios' }, { status: 400 })
    }

    // Crear nuevo trabajo
    const job: ContractorJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientName,
      clientPhone,
      clientEmail,
      service,
      description,
      address,
      amount,
      status: 'assigned',
      paymentStatus: 'pending',
      createdAt: new Date(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    }

    // Agregar a los trabajos del contratista
    const existingJobs = contractorJobs.get(contractorId) || []
    existingJobs.unshift(job)
    contractorJobs.set(contractorId, existingJobs)

    // Crear notificación para el contratista
    createJobNotification(contractorId, job.id, clientName, amount)

    console.log(`🔨 Nuevo trabajo asignado a contratista ${contractorId}:`, job)

    return NextResponse.json({
      success: true,
      job,
    })
  } catch (error: any) {
    console.error('Error al crear trabajo:', error)
    return NextResponse.json({ error: error.message || 'Error al crear trabajo' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractorId, jobId, status, notes } = body

    if (!contractorId || !jobId) {
      return NextResponse.json(
        { error: 'Se requiere ID del contratista y del trabajo' },
        { status: 400 },
      )
    }

    // Obtener trabajos del contratista
    const jobs = contractorJobs.get(contractorId) || []

    // Encontrar el trabajo
    const jobIndex = jobs.findIndex((j) => j.id === jobId)

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    const job = jobs[jobIndex]
    const previousStatus = job.status

    // Actualizar el trabajo
    if (status) {
      job.status = status

      // Actualizar timestamps según el estado
      switch (status) {
        case 'accepted':
          job.acceptedAt = new Date()
          break
        case 'in_progress':
          job.startedAt = new Date()
          break
        case 'completed':
          job.completedAt = new Date()
          job.paymentStatus = 'held' // El pago se retiene hasta confirmación del cliente
          break
      }
    }

    if (notes) {
      job.notes = notes
    }

    jobs[jobIndex] = job
    contractorJobs.set(contractorId, jobs)

    // Si el trabajo se completó, crear notificación de pago retenido
    if (status === 'completed' && previousStatus !== 'completed') {
      // Aquí podrías integrar con el sistema de pagos para retener el pago
      console.log(`💰 Pago retenido para trabajo ${jobId}, monto: $${job.amount}`)
    }

    console.log(`✅ Trabajo ${jobId} actualizado a estado: ${status}`)

    return NextResponse.json({
      success: true,
      job,
    })
  } catch (error: any) {
    console.error('Error al actualizar trabajo:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar trabajo' },
      { status: 500 },
    )
  }
}

// Función auxiliar para simular liberación de pago
export async function releasePayment(contractorId: string, jobId: string) {
  try {
    const jobs = contractorJobs.get(contractorId) || []
    const jobIndex = jobs.findIndex((j) => j.id === jobId)

    if (jobIndex === -1) {
      throw new Error('Trabajo no encontrado')
    }

    const job = jobs[jobIndex]

    if (job.paymentStatus !== 'held') {
      throw new Error('El pago no está retenido')
    }

    // Actualizar estado del pago
    job.paymentStatus = 'released'
    jobs[jobIndex] = job
    contractorJobs.set(contractorId, jobs)

    // Crear notificación de pago liberado
    createPaymentNotification(contractorId, jobId, job.amount)

    console.log(
      `💰 Pago liberado para contratista ${contractorId}, trabajo ${jobId}, monto: $${job.amount}`,
    )

    return { success: true, job }
  } catch (error: any) {
    console.error('Error al liberar pago:', error)
    throw error
  }
}

// Función auxiliar para obtener estadísticas del contratista
export function getContractorStats(contractorId: string) {
  const jobs = contractorJobs.get(contractorId) || []

  const totalEarnings = jobs
    .filter((j) => j.paymentStatus === 'released')
    .reduce((sum, j) => sum + j.amount, 0)

  const heldPayments = jobs
    .filter((j) => j.paymentStatus === 'held')
    .reduce((sum, j) => sum + j.amount, 0)

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const thisMonthEarnings = jobs
    .filter((j) => j.paymentStatus === 'released' && j.completedAt && j.completedAt >= thisMonth)
    .reduce((sum, j) => sum + j.amount, 0)

  return {
    totalJobs: jobs.length,
    completedJobs: jobs.filter((j) => j.status === 'completed').length,
    totalEarnings,
    heldPayments,
    thisMonthEarnings,
    averageRating: 4.8, // Esto vendría de las calificaciones reales
    totalReviews: 127,
  }
}
