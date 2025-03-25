import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: () => true || authenticated, // Permitir registro público
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'userType'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'userType',
      type: 'select',
      required: true,
      options: [
        { label: 'Cliente', value: 'client' },
        { label: 'Contratista', value: 'contractor' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: 'Apellido',
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      label: 'Número de Teléfono',
    },
    {
      name: 'phoneVerified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Teléfono Verificado',
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Dirección',
        },
        {
          name: 'lat',
          type: 'number',
          label: 'Latitud',
        },
        {
          name: 'lng',
          type: 'number',
          label: 'Longitud',
        },
      ],
    },
    // Campos específicos para contratistas
    {
      name: 'contractorFields',
      type: 'group',
      label: 'Información de Contratista',
      admin: {
        condition: (data) => data.userType === 'contractor',
      },
      fields: [
        {
          name: 'services',
          type: 'select',
          hasMany: true,
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
          name: 'yearsExperience',
          type: 'number',
          required: true,
          label: 'Años de Experiencia',
        },
        {
          name: 'hasLicense',
          type: 'checkbox',
          label: '¿Tiene licencia?',
        },
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          defaultValue: 0,
          label: 'Calificación promedio',
        },
        {
          name: 'reviewCount',
          type: 'number',
          defaultValue: 0,
          label: 'Número de reseñas',
        },
      ],
    },
  ],
  timestamps: true,
}
