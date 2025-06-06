import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'
import { FormBlock } from '@/blocks/Form/config'
export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'urgentFixHero',
      label: 'Type',
      options: [
        {
          label: 'UrgentFix Hero',
          value: 'urgentFixHero',
        },
        {
          label: 'HeroLeads',
          value: 'heroLeads',
        },
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'RFSDHUB Hero Section',
          value: 'rfsdhubHeroSection',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) =>
          [
            'highImpact',
            'mediumImpact',
            'rfsdhubHeroSection',
            'heroLeads',
            'urgentFixHero',
          ].includes(type),
      },
      relationTo: 'media',
      required: false,
    },
    /* {                  
      name: 'Form layout',
      type: 'blocks',
      blocks: [FormBlock],
      admin: {
        initCollapsed: true,
        condition: (_, { type } = {}) => type === 'rfsdhubHeroSection',
      },
    }, */
    {
      name: 'form', // campo opcional para seleccionar un formulario
      type: 'relationship',
      relationTo: 'forms',
      required: false,
      admin: {
        description: 'Selecciona el formulario que se mostrará en el hero',
        condition: (_, { type } = {}) => ['rfsdhubHeroSection', 'urgentFixHero'].includes(type),
      },
    },
  ],
  label: false,
}
