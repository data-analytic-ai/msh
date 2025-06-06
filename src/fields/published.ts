import type { Field } from 'payload'

export const publishedField: Field = {
  name: '_status',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  admin: {
    position: 'sidebar',
  },
  options: [
    {
      label: 'Draft',
      value: 'draft',
    },
    {
      label: 'Published',
      value: 'published',
    },
  ],
}
