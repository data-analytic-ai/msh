import type { CollectionConfig } from 'payload'
import { adminsOrUser } from '../access/adminsOrUser'
import { adminsOrRequestOwner } from '../access/adminsOrRequestOwner'

export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  admin: {
    useAsTitle: 'requestTitle',
    defaultColumns: ['requestTitle', 'serviceType', 'status', 'createdAt'],
    group: 'UrgentFix',
  },
  access: {
    create: () => true, // Todos pueden crear solicitudes
    read: adminsOrRequestOwner, // Admin o el usuario que lo creó
    update: adminsOrRequestOwner, // Admin o el usuario que lo creó pueden actualizar
    delete: adminsOrUser, // El admin o usuario pueden eliminar
  },
  fields: [
    {
      name: 'requestTitle',
      type: 'text',
      required: true,
      label: 'Título de la solicitud',
    },
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
        { label: 'Techado', value: 'roofing' },
        { label: 'Revestimiento', value: 'siding' },
        { label: 'Reparaciones Generales', value: 'general' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'urgencyLevel',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Baja - Programar en los próximos días', value: 'low' },
        { label: 'Media - Atender en las próximas 24 horas', value: 'medium' },
        { label: 'Alta - Atender lo antes posible', value: 'high' },
        { label: 'Emergencia - Necesito asistencia inmediata', value: 'emergency' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      access: {
        update: ({ req }) => {
          // Verificar si es admin o contratista
          if (!req.user) return false

          return ['admin', 'superadmin', 'contractor'].includes(req.user.role)
        },
      },
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Asignado', value: 'assigned' },
        { label: 'En proceso', value: 'in-progress' },
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
          label: 'Dirección',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'Ciudad',
        },
        {
          name: 'state',
          type: 'text',
          required: true,
          label: 'Estado/Provincia',
        },
        {
          name: 'zipCode',
          type: 'text',
          required: true,
          label: 'Código Postal',
        },
      ],
    },
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Nombre completo',
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Correo electrónico',
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: 'Teléfono',
        },
        {
          name: 'preferredContact',
          type: 'select',
          required: true,
          defaultValue: 'phone',
          options: [
            { label: 'Teléfono', value: 'phone' },
            { label: 'Correo', value: 'email' },
            { label: 'SMS', value: 'sms' },
          ],
        },
      ],
    },
    {
      name: 'preferredDateTime',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      label: 'Fecha y hora preferida',
    },
    {
      name: 'photos',
      type: 'array',
      label: 'Fotos del problema',
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Descripción de la foto',
        },
      ],
    },
    {
      name: 'quotes',
      type: 'array',
      admin: {
        condition: (data) => Boolean(data?.status !== 'pending'),
      },
      fields: [
        {
          name: 'contractorName',
          type: 'text',
          label: 'Nombre del contratista',
        },
        {
          name: 'amount',
          type: 'number',
          label: 'Monto estimado',
          min: 0,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Descripción del presupuesto',
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pendiente', value: 'pending' },
            { label: 'Aceptado', value: 'accepted' },
            { label: 'Rechazado', value: 'rejected' },
          ],
        },
      ],
    },
    {
      name: 'notes',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'content',
          type: 'textarea',
          label: 'Contenido de la nota',
          required: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          hasMany: false,
          label: 'Autor',
        },
        {
          name: 'createdAt',
          type: 'date',
          label: 'Fecha de creación',
          defaultValue: () => new Date(),
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      label: 'Cliente',
      hasMany: false,
      defaultValue: ({ req }) => {
        if (req.user) {
          return req.user.id
        }
      },
    },
    {
      name: 'assignedContractor',
      type: 'relationship',
      relationTo: 'users',
      label: 'Contratista asignado',
      hasMany: false,
      admin: {
        condition: (data) => Boolean(data?.status !== 'pending'),
      },
      access: {
        update: ({ req }) => {
          // Verificar si es admin o contratista
          if (!req.user) return false

          return ['admin', 'superadmin', 'contractor'].includes(req.user.role)
        },
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user) {
          if (data.customer === undefined) {
            data.customer = req.user.id
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create') {
          // Aquí podrías implementar notificaciones
          console.log(`Nueva solicitud de servicio creada: ${doc.id}`)
        } else if (operation === 'update') {
          // Notificar cambios de estatus
          console.log(`Solicitud de servicio actualizada: ${doc.id}`)
        }
      },
    ],
  },
}
