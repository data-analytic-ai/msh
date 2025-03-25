import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

export const UrgentFixServices: Block = {
  slug: 'urgentFixServices',
  interfaceName: 'UrgentFixServicesBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: {
        description: 'Main heading for the services block',
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
        description: 'Description of the available services',
      },
    },
    {
      name: 'services',
      type: 'array',
      required: false,
      admin: {
        description: 'List of available services',
      },
      fields: [
        {
          name: 'serviceType',
          type: 'select',
          required: false,
          options: [
            { label: 'Plumbing', value: 'plumbing' },
            { label: 'Electrical', value: 'electrical' },
            { label: 'Windows', value: 'glass' },
            { label: 'HVAC', value: 'hvac' },
            { label: 'Pest Control', value: 'pests' },
            { label: 'Locksmith', value: 'locksmith' },
            { label: 'Roofing', value: 'roofing' },
            { label: 'Siding', value: 'siding' },
            { label: 'General Repairs', value: 'general' },
          ],
        },
        {
          name: 'serviceIcon',
          type: 'text',
          required: false,
          admin: {
            description: 'Icon or emoji for the service (e.g. 🚿, 💡, 🪟)',
          },
        },
        {
          name: 'serviceDescription',
          type: 'textarea',
          required: true,
        },
        {
          name: 'serviceImage',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Representative image for the service (optional)',
          },
        },
      ],
    },
    {
      name: 'showRequestForm',
      type: 'checkbox',
      label: 'Show service request form',
      defaultValue: false,
    },
    {
      name: 'requestForm',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: 'Form for requesting services',
        condition: (_, { showRequestForm }) => Boolean(showRequestForm),
      },
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        label: 'Action buttons',
        maxRows: 2,
      },
    }),
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
        { label: 'Cards', value: 'cards' },
      ],
      admin: {
        description: 'Service presentation style',
      },
    },
    {
      name: 'enableHover',
      type: 'checkbox',
      label: 'Enable hover effects',
      defaultValue: true,
    },
  ],
  labels: {
    plural: 'UrgentFix Services Blocks',
    singular: 'UrgentFix Services Block',
  },
}
