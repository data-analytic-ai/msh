import type { CollectionConfig } from 'payload'
import { adminsOrUser } from '../access/adminsOrUser'

/**
 * LeadAccess Collection
 *
 * Manages premium lead access for contractors. When a contractor purchases
 * access to a service request lead, a record is created here that grants
 * them access to sensitive customer information including contact details,
 * exact address, and chat functionality.
 */
export const LeadAccess: CollectionConfig = {
  slug: 'leadAccess',
  admin: {
    useAsTitle: 'contractor',
    defaultColumns: [
      'contractor',
      'serviceRequest',
      'hasAccessToContactInfo',
      'leadPrice',
      'purchasedAt',
    ],
    group: 'Premium Leads',
    description: 'Premium lead access records for contractors',
  },
  access: {
    create: () => true, // API can create lead access records
    read: adminsOrUser, // Admins or the contractor can read their own records
    update: () => true, // Allow updates for payment status changes
    delete: () => false, // Prevent deletion for audit trail
  },
  fields: [
    {
      name: 'contractor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Contractor who purchased lead access',
      },
      filterOptions: {
        role: {
          equals: 'contractor',
        },
      },
    },
    {
      name: 'serviceRequest',
      type: 'relationship',
      relationTo: 'service-requests',
      required: true,
      admin: {
        description: 'Service request this access applies to',
      },
    },
    {
      name: 'hasAccessToContactInfo',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether contractor has access to customer contact information',
      },
    },
    {
      name: 'leadPrice',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Price paid for this lead access (USD)',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        description: 'Status of the payment for this lead',
      },
    },
    {
      name: 'paymentIntentId',
      type: 'text',
      admin: {
        description: 'Stripe Payment Intent ID for this purchase',
        position: 'sidebar',
      },
    },
    {
      name: 'purchasedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        description: 'When this lead access was purchased',
        position: 'sidebar',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'When this lead access expires (optional)',
        position: 'sidebar',
      },
    },
    {
      name: 'leadType',
      type: 'select',
      defaultValue: 'basic',
      options: [
        { label: 'Basic Lead ($15)', value: 'basic' },
        { label: 'Premium Lead ($25)', value: 'premium' },
        { label: 'Specialized Lead ($35)', value: 'specialized' },
      ],
      admin: {
        description: 'Type and pricing tier of the lead',
      },
    },
    {
      name: 'contactAttempts',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times contractor contacted the customer',
        position: 'sidebar',
      },
    },
    {
      name: 'chatEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether chat is enabled for this lead',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this lead access',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        // Set purchase date on creation
        if (operation === 'create') {
          data.purchasedAt = new Date()
        }
        return data
      },
    ],
  },
}
