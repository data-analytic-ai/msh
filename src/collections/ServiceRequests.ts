import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

interface User {
  userType: 'client' | 'contractor'
}

export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  admin: {
    useAsTitle: 'serviceType',
    defaultColumns: ['serviceType', 'status', 'client.name', 'createdAt'],
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Plomería', value: 'plumbing' },
        { label: 'Electricidad', value: 'electrical' },
        { label: 'Vidrios', value: 'glass' },
        { label: 'HVAC', value: 'hvac' },
        { label: 'Plagas', value: 'pests' },
        { label: 'Cerrajería', value: 'locksmith' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Buscando contratistas', value: 'finding_contractors' },
        { label: 'Contratista seleccionado', value: 'contractor_selected' },
        { label: 'En progreso', value: 'in_progress' },
        { label: 'Completado', value: 'completed' },
        { label: 'Cancelado', value: 'cancelled' },
      ],
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
          required: true,
        },
        {
          name: 'lat',
          type: 'number',
          required: true,
        },
        {
          name: 'lng',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Imágenes del problema',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        condition: (data) => {
          if (data) {
            const user = data as User
            return user.userType === 'client'
          }
          return true
        },
      },
    },
    {
      name: 'contractors',
      type: 'array',
      label: 'Contratistas notificados',
      fields: [
        {
          name: 'contractor',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'notified',
          options: [
            { label: 'Notificado', value: 'notified' },
            { label: 'Propuesta enviada', value: 'proposal_sent' },
            { label: 'Seleccionado', value: 'selected' },
            { label: 'Rechazado', value: 'rejected' },
          ],
        },
        {
          name: 'price',
          type: 'group',
          admin: {
            condition: (data) => data.status === 'proposal_sent' || data.status === 'selected',
          },
          fields: [
            {
              name: 'min',
              type: 'number',
              required: true,
              min: 0,
            },
            {
              name: 'max',
              type: 'number',
              required: true,
              min: 0,
            },
          ],
        },
        {
          name: 'estimatedArrival',
          type: 'number',
          label: 'Tiempo estimado de llegada (minutos)',
          admin: {
            condition: (data) => data.status === 'proposal_sent' || data.status === 'selected',
          },
        },
      ],
    },
    {
      name: 'selectedContractor',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: (data) =>
          data.status === 'contractor_selected' ||
          data.status === 'in_progress' ||
          data.status === 'completed',
      },
    },
    {
      name: 'payment',
      type: 'group',
      admin: {
        condition: (data) =>
          data.status === 'contractor_selected' ||
          data.status === 'in_progress' ||
          data.status === 'completed',
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pendiente', value: 'pending' },
            { label: 'Autorizado', value: 'authorized' },
            { label: 'Retenido', value: 'held' },
            { label: 'Liberado', value: 'released' },
            { label: 'Reembolsado', value: 'refunded' },
          ],
        },
        {
          name: 'paymentMethod',
          type: 'select',
          options: [
            { label: 'Tarjeta de crédito', value: 'credit_card' },
            { label: 'PayPal', value: 'paypal' },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
        },
      ],
    },
    {
      name: 'completionDetails',
      type: 'group',
      admin: {
        condition: (data) => data.status === 'completed',
      },
      fields: [
        {
          name: 'completedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'confirmation',
          type: 'select',
          required: true,
          options: [
            { label: 'Firma digital', value: 'signature' },
            { label: 'Confirmación SMS', value: 'sms' },
          ],
        },
        {
          name: 'clientRating',
          type: 'number',
          min: 1,
          max: 5,
        },
        {
          name: 'clientReview',
          type: 'textarea',
        },
      ],
    },
  ],
  timestamps: true,
}
