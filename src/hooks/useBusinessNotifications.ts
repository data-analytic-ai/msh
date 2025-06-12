/**
 * useBusinessNotifications - Business-specific notification helpers
 *
 * Provides convenient methods for sending common business notifications
 * with predefined templates and configurations.
 *
 * @returns {Object} Business notification methods
 */

import { useNotifications } from '@/contexts/NotificationContext'
import { useCallback } from 'react'

export const useBusinessNotifications = () => {
  const { notify } = useNotifications()

  // Notify contractor when their quote is accepted
  const notifyQuoteAccepted = useCallback(
    async (data: {
      contractorId: string
      requestTitle: string
      amount: number
      customerName: string
      requestId: string
    }) => {
      await notify('quote_accepted', {
        title: '¡Tu cotización fue aceptada!',
        message: `${data.customerName} aceptó tu cotización de $${data.amount.toLocaleString()} para "${data.requestTitle}".`,
        userId: data.contractorId,
        priority: 'high',
        data: {
          requestId: data.requestId,
          amount: data.amount,
          customerName: data.customerName,
          actionUrl: `/contractor/dashboard`,
        },
        actionLabel: 'Ver trabajo',
      })
    },
    [notify],
  )

  // Notify contractor when their quote is rejected
  const notifyQuoteRejected = useCallback(
    async (data: {
      contractorId: string
      requestTitle: string
      amount: number
      requestId: string
    }) => {
      await notify('quote_rejected', {
        title: 'Cotización no seleccionada',
        message: `Tu cotización de $${data.amount.toLocaleString()} para "${data.requestTitle}" no fue seleccionada.`,
        userId: data.contractorId,
        priority: 'normal',
        data: {
          requestId: data.requestId,
          amount: data.amount,
          actionUrl: `/contractor/dashboard/explore`,
        },
        actionLabel: 'Ver más solicitudes',
      })
    },
    [notify],
  )

  // Notify customer when they receive a new quote
  const notifyQuoteReceived = useCallback(
    async (data: {
      customerId: string
      contractorName: string
      amount: number
      requestTitle: string
      requestId: string
    }) => {
      await notify('quote_received', {
        title: 'Nueva cotización recibida',
        message: `${data.contractorName} envió una cotización de $${data.amount.toLocaleString()} para "${data.requestTitle}".`,
        userId: data.customerId,
        priority: 'high',
        data: {
          requestId: data.requestId,
          contractorName: data.contractorName,
          amount: data.amount,
          actionUrl: `/request-service/dashboard/${data.requestId}`,
        },
        actionLabel: 'Ver cotización',
      })
    },
    [notify],
  )

  // Notify contractor when assigned to a job
  const notifyJobAssigned = useCallback(
    async (data: {
      contractorId: string
      requestTitle: string
      customerName: string
      requestId: string
      urgencyLevel?: string
    }) => {
      const urgencyText = data.urgencyLevel === 'urgent' ? ' (URGENTE)' : ''

      await notify('job_assigned', {
        title: `Nuevo trabajo asignado${urgencyText}`,
        message: `Se te asignó el trabajo "${data.requestTitle}" de ${data.customerName}.`,
        userId: data.contractorId,
        priority: data.urgencyLevel === 'urgent' ? 'urgent' : 'high',
        data: {
          requestId: data.requestId,
          customerName: data.customerName,
          urgencyLevel: data.urgencyLevel,
          actionUrl: `/contractor/dashboard`,
        },
        actionLabel: 'Ver trabajo',
      })
    },
    [notify],
  )

  // Notify customer when job is completed
  const notifyJobCompleted = useCallback(
    async (data: {
      customerId: string
      contractorName: string
      requestTitle: string
      requestId: string
    }) => {
      await notify('job_completed', {
        title: 'Trabajo completado',
        message: `${data.contractorName} marcó como completado el trabajo "${data.requestTitle}".`,
        userId: data.customerId,
        priority: 'normal',
        data: {
          requestId: data.requestId,
          contractorName: data.contractorName,
          actionUrl: `/request-service/dashboard/${data.requestId}`,
        },
        actionLabel: 'Ver detalles',
      })
    },
    [notify],
  )

  // Notify contractor when payment is received
  const notifyPaymentReceived = useCallback(
    async (data: {
      contractorId: string
      amount: number
      requestTitle: string
      requestId: string
    }) => {
      await notify('payment_received', {
        title: 'Pago recibido',
        message: `Recibiste un pago de $${data.amount.toLocaleString()} por "${data.requestTitle}".`,
        userId: data.contractorId,
        priority: 'high',
        data: {
          requestId: data.requestId,
          amount: data.amount,
          actionUrl: `/contractor/dashboard`,
        },
        actionLabel: 'Ver pagos',
      })
    },
    [notify],
  )

  // Notify contractor when payment is released from hold
  const notifyPaymentReleased = useCallback(
    async (data: {
      contractorId: string
      amount: number
      requestTitle: string
      requestId: string
    }) => {
      await notify('payment_released', {
        title: 'Pago liberado',
        message: `Se liberó el pago de $${data.amount.toLocaleString()} por "${data.requestTitle}". Ya está disponible en tu cuenta.`,
        userId: data.contractorId,
        priority: 'normal',
        data: {
          requestId: data.requestId,
          amount: data.amount,
          actionUrl: `/contractor/dashboard`,
        },
        actionLabel: 'Ver saldo',
      })
    },
    [notify],
  )

  // Notify user when profile is verified
  const notifyProfileVerified = useCallback(
    async (data: { userId: string; userType: 'contractor' | 'client' }) => {
      const dashboardUrl =
        data.userType === 'contractor' ? '/contractor/dashboard' : '/request-service/dashboard'

      await notify('profile_verified', {
        title: '¡Perfil verificado!',
        message: `Tu perfil ha sido verificado exitosamente. Ahora tienes acceso completo a la plataforma.`,
        userId: data.userId,
        priority: 'normal',
        data: {
          userType: data.userType,
          actionUrl: dashboardUrl,
        },
        actionLabel: 'Ir al dashboard',
      })
    },
    [notify],
  )

  // Send system update notification
  const notifySystemUpdate = useCallback(
    async (data: {
      userId: string
      title: string
      message: string
      actionUrl?: string
      actionLabel?: string
    }) => {
      await notify('system_update', {
        title: data.title,
        message: data.message,
        userId: data.userId,
        priority: 'low',
        data: {
          actionUrl: data.actionUrl,
        },
        actionLabel: data.actionLabel,
      })
    },
    [notify],
  )

  return {
    notifyQuoteAccepted,
    notifyQuoteRejected,
    notifyQuoteReceived,
    notifyJobAssigned,
    notifyJobCompleted,
    notifyPaymentReceived,
    notifyPaymentReleased,
    notifyProfileVerified,
    notifySystemUpdate,
  }
}

export default useBusinessNotifications
