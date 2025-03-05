import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

export const EmergencyServices: Block = {
  slug: 'emergencyServices',
  interfaceName: 'EmergencyServicesBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: {
        description: 'Encabezado principal del bloque de servicios',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      required: true,
      admin: {
        description: 'Descripción del servicio de emergencia',
      },
    },
    {
      name: 'services',
      type: 'array',
      required: true,
      admin: {
        description: 'Lista de servicios de emergencia disponibles',
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
          name: 'serviceIcon',
          type: 'text',
          required: true,
          admin: {
            description: 'Emoji o código de icono para el servicio (ej: 🚿, 💡, 🪟)',
          },
        },
        {
          name: 'serviceDescription',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'showRequestForm',
      type: 'checkbox',
      label: 'Mostrar formulario de solicitud de servicio',
      defaultValue: false,
    },
    {
      name: 'requestForm',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: 'Formulario para solicitar servicios de emergencia',
        condition: (_, { showRequestForm }) => Boolean(showRequestForm),
      },
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        label: 'Botones de acción',
        maxRows: 2,
      },
    }),
    {
      name: 'showContractorSection',
      type: 'checkbox',
      label: 'Mostrar sección para contratistas',
      defaultValue: false,
    },
    {
      name: 'contractorHeading',
      type: 'text',
      admin: {
        condition: (_, { showContractorSection }) => Boolean(showContractorSection),
      },
    },
    {
      name: 'contractorDescription',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      admin: {
        condition: (_, { showContractorSection }) => Boolean(showContractorSection),
      },
    },
    {
      name: 'contractorLinks',
      type: 'array',
      label: 'Enlaces para contratistas',
      admin: {
        condition: (_, { showContractorSection }) => Boolean(showContractorSection),
      },
      fields: [
        {
          name: 'link',
          type: 'group',
          fields: [
            {
              name: 'type',
              type: 'select',
              defaultValue: 'reference',
              options: [
                {
                  label: 'Page',
                  value: 'reference',
                },
                {
                  label: 'Custom URL',
                  value: 'custom',
                },
              ],
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                condition: (_, { type }) => Boolean(type === 'custom'),
              },
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
              admin: {
                condition: (_, { type }) => Boolean(type === 'reference'),
              },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                condition: (_, { type }) => Boolean(type === 'custom'),
              },
            },
          ],
        },
      ],
    },
  ],
  labels: {
    plural: 'Bloques de Servicios de Emergencia',
    singular: 'Bloque de Servicios de Emergencia',
  },
}
