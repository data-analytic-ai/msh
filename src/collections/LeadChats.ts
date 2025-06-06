import type { CollectionConfig } from 'payload'
import { adminsOrUser } from '../access/adminsOrUser'

/**
 * LeadChats Collection
 *
 * Manages chat messages between contractors and customers for premium leads.
 * Only available when contractor has purchased lead access and chat is enabled.
 */
export const LeadChats: CollectionConfig = {
  slug: 'leadChats',
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['sender', 'serviceRequest', 'message', 'createdAt'],
    group: 'Premium Leads',
    description: 'Chat messages for premium leads',
  },
  access: {
    create: () => true, // API can create chat messages
    read: adminsOrUser, // Users can read their own chat messages
    update: () => false, // Chat messages are immutable
    delete: () => false, // Chat messages cannot be deleted
  },
  fields: [
    {
      name: 'serviceRequest',
      type: 'relationship',
      relationTo: 'service-requests',
      required: true,
      admin: {
        description: 'Service request this chat belongs to',
      },
    },
    {
      name: 'leadAccess',
      type: 'relationship',
      relationTo: 'leadAccess',
      required: true,
      admin: {
        description: 'Lead access record that enables this chat',
      },
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who sent this message',
      },
    },
    {
      name: 'senderType',
      type: 'select',
      required: true,
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Contractor', value: 'contractor' },
        { label: 'System', value: 'system' },
      ],
      admin: {
        description: 'Type of user who sent the message',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description: 'Chat message content',
      },
    },
    {
      name: 'messageType',
      type: 'select',
      defaultValue: 'text',
      options: [
        { label: 'Text Message', value: 'text' },
        { label: 'Quote/Estimate', value: 'quote' },
        { label: 'Schedule Request', value: 'schedule' },
        { label: 'Contact Info', value: 'contact' },
        { label: 'System Message', value: 'system' },
      ],
      admin: {
        description: 'Type of message',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether message has been read by recipient',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        description: 'When message was read',
        position: 'sidebar',
      },
    },
    {
      name: 'attachments',
      type: 'array',
      admin: {
        description: 'File attachments for this message',
      },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
    {
      name: 'quoteInfo',
      type: 'group',
      admin: {
        description: 'Quote information if this is a quote message',
        condition: (data) => data.messageType === 'quote',
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Quoted amount in USD',
          },
        },
        {
          name: 'validUntil',
          type: 'date',
          admin: {
            description: 'Quote expiration date',
          },
        },
        {
          name: 'includesLabor',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'includesMaterials',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        // Set sender type based on user role
        if (operation === 'create' && data.sender && req.user) {
          const user = req.user
          if (user.role === 'contractor') {
            data.senderType = 'contractor'
          } else {
            data.senderType = 'customer'
          }
        }
        return data
      },
    ],
  },
}
