/**
 * Notifications Collection
 *
 * Stores all system notifications for users including in-app, email, SMS, and push notifications.
 * Supports different notification types and channels with user preference filtering.
 */

import type { CollectionConfig, Access } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'userId', 'read', 'createdAt'],
    listSearchableFields: ['title', 'message', 'type'],
  },
  access: {
    // Users can only see their own notifications
    read: (({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        return true
      }
      return {
        userId: {
          equals: user?.id,
        },
      }
    }) as Access,
    create: (({ req: { user } }) => {
      // Only authenticated users and system can create notifications
      return !!user
    }) as Access,
    update: (({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        return true
      }
      return {
        userId: {
          equals: user?.id,
        },
      }
    }) as Access,
    delete: (({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        return true
      }
      return {
        userId: {
          equals: user?.id,
        },
      }
    }) as Access,
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Cotización recibida', value: 'quote_received' },
        { label: 'Cotización aceptada', value: 'quote_accepted' },
        { label: 'Cotización rechazada', value: 'quote_rejected' },
        { label: 'Trabajo asignado', value: 'job_assigned' },
        { label: 'Trabajo completado', value: 'job_completed' },
        { label: 'Pago recibido', value: 'payment_received' },
        { label: 'Pago liberado', value: 'payment_released' },
        { label: 'Actualización del sistema', value: 'system_update' },
        { label: 'Perfil verificado', value: 'profile_verified' },
      ],
      admin: {
        description: 'Tipo de notificación que determina el comportamiento y canales',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: {
        description: 'Título principal de la notificación',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description: 'Mensaje detallado de la notificación',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'normal',
      options: [
        { label: 'Baja', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'Alta', value: 'high' },
        { label: 'Urgente', value: 'urgent' },
      ],
      admin: {
        description: 'Prioridad de la notificación',
      },
    },
    {
      name: 'channels',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['in_app'],
      options: [
        { label: 'En la aplicación', value: 'in_app' },
        { label: 'Push web', value: 'web_push' },
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' },
      ],
      admin: {
        description: 'Canales por los que se enviará la notificación',
      },
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Usuario destinatario de la notificación',
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Indica si la notificación ha sido leída',
      },
    },
    {
      name: 'data',
      type: 'json',
      admin: {
        description: 'Datos adicionales específicos del tipo de notificación (JSON)',
      },
    },
    {
      name: 'actionUrl',
      type: 'text',
      admin: {
        description: 'URL de acción opcional para la notificación',
      },
    },
    {
      name: 'actionLabel',
      type: 'text',
      admin: {
        description: 'Etiqueta del botón de acción opcional',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Fecha de expiración opcional de la notificación',
      },
    },
    {
      name: 'sentChannels',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'En la aplicación', value: 'in_app' },
        { label: 'Push web', value: 'web_push' },
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' },
      ],
      admin: {
        description: 'Canales por los que se envió exitosamente la notificación',
        readOnly: true,
      },
    },
    {
      name: 'errorLog',
      type: 'textarea',
      admin: {
        description: 'Log de errores si falló el envío por algún canal',
        readOnly: true,
      },
    },
    // Analytics and Metrics
    {
      name: 'viewedAt',
      type: 'date',
      admin: {
        description: 'Fecha y hora cuando fue vista la notificación',
        readOnly: true,
      },
    },
    {
      name: 'clickedAt',
      type: 'date',
      admin: {
        description: 'Fecha y hora cuando se hizo clic en la notificación',
        readOnly: true,
      },
    },
    {
      name: 'dismissedAt',
      type: 'date',
      admin: {
        description: 'Fecha y hora cuando fue descartada la notificación',
        readOnly: true,
      },
    },
    {
      name: 'deliveryAttempts',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Número de intentos de entrega',
        readOnly: true,
      },
    },
    {
      name: 'deliveryStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Entregada', value: 'delivered' },
        { label: 'Falló', value: 'failed' },
        { label: 'Reintentando', value: 'retrying' },
      ],
      admin: {
        description: 'Estado de entrega de la notificación',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }: any) => {
        // Generate ID for new notifications
        if (operation === 'create' && !data.id) {
          data.id = `${data.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }: any) => {
        // Log notification creation for debugging
        if (operation === 'create') {
          console.log(`📧 Notification created: ${doc.type} for user ${doc.userId}`)
        }
      },
    ],
  },
}

export default Notifications
