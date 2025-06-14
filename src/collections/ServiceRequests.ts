import type { CollectionConfig } from 'payload'
import { adminsOrUser } from '../access/adminsOrUser'
import { adminsOrRequestOwner } from '../access/adminsOrRequestOwner'
import { adminsOrRequestOwnerOrContractors } from '../access/adminsOrRequestOwnerOrContractors'

/**
 * ServiceRequests Collection
 *
 * This collection stores service requests created by customers through the request-service flow.
 * It includes location data, service type, status tracking, and
 * relationships with users (customers and contractors).
 */
export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  admin: {
    useAsTitle: 'requestTitle',
    defaultColumns: ['requestTitle', 'serviceType', 'status', 'createdAt'],
    group: 'UrgentFix',
    description: 'Service requests submitted by customers',
  },
  access: {
    create: () => true, // Anyone can create service requests
    read: adminsOrRequestOwnerOrContractors, // Allow admins, request owners, or contractors to read
    update: adminsOrRequestOwnerOrContractors, // Admin or the request owner or contractors can update
    delete: adminsOrUser, // Admin or user can delete
  },
  fields: [
    {
      name: 'requestId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Unique identifier for this service request',
      },
      hooks: {
        beforeChange: [
          ({ operation, data }) => {
            if (operation === 'create') {
              // Generate a unique request ID
              return `REQ-${Math.floor(Math.random() * 100000)}`
            }
            return data?.requestId
          },
        ],
      },
    },
    {
      name: 'requestTitle',
      type: 'text',
      required: true,
      label: 'Request Title',
      admin: {
        description: 'Title of the service request',
      },
      hooks: {
        beforeChange: [
          ({ operation, data, value }) => {
            // Generate title automatically if not provided
            if (operation === 'create' && !value && data?.serviceType) {
              type ServiceTypes =
                | 'plumbing'
                | 'electrical'
                | 'glass'
                | 'hvac'
                | 'pests'
                | 'locksmith'
                | 'roofing'
                | 'siding'
                | 'general'

              const serviceLabels: Record<ServiceTypes, string> = {
                plumbing: 'Plumbing',
                electrical: 'Electrical',
                glass: 'Windows & Glass',
                hvac: 'HVAC',
                pests: 'Pest Control',
                locksmith: 'Locksmith',
                roofing: 'Roofing',
                siding: 'Siding',
                general: 'General Repairs',
              }

              const serviceType = data.serviceType as ServiceTypes
              return `${serviceLabels[serviceType] || 'Service'} request`
            }
            return value
          },
        ],
      },
    },
    {
      name: 'serviceType',
      type: 'select',
      hasMany: true,
      required: true,
      admin: {
        description: 'Type of service requested',
      },
      options: [
        { label: 'Plumbing', value: 'plumbing' },
        { label: 'Electrical', value: 'electrical' },
        { label: 'Windows & Glass', value: 'glass' },
        { label: 'HVAC', value: 'hvac' },
        { label: 'Pest Control', value: 'pests' },
        { label: 'Locksmith', value: 'locksmith' },
        { label: 'Roofing', value: 'roofing' },
        { label: 'Siding', value: 'siding' },
        { label: 'General Repairs', value: 'general' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of the service needed',
      },
    },
    {
      name: 'urgencyLevel',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      admin: {
        description: 'How urgent is this service request',
      },
      options: [
        { label: 'Low - Within a week', value: 'low' },
        { label: 'Medium - Within 48 hours', value: 'medium' },
        { label: 'High - Within 24 hours', value: 'high' },
        { label: 'Emergency - As soon as possible', value: 'emergency' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
        description: 'Current status of the service request',
      },
      access: {
        update: ({ req }) => {
          // Check if admin or contractor
          if (!req.user) return false
          return ['admin', 'superadmin', 'contractor'].includes(req.user.role as string)
        },
      },
      options: [
        { label: 'Pending - Awaiting contractor quotes', value: 'pending' },
        { label: 'Receiving Quotes - Contractors are bidding', value: 'receiving-quotes' },
        { label: 'Assigned - Quote accepted, contractor assigned', value: 'assigned' },
        { label: 'In Progress - Work has started', value: 'in-progress' },
        { label: 'Awaiting Payment - Work completed, awaiting payment', value: 'awaiting-payment' },
        { label: 'Completed - Service completed and paid', value: 'completed' },
        { label: 'Cancelled - Request cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'location',
      type: 'group',
      admin: {
        description: 'Service location details',
      },
      fields: [
        {
          name: 'formattedAddress',
          type: 'text',
          required: true,
          label: 'Full Address',
          admin: {
            description: 'Complete formatted address',
          },
        },
        {
          name: 'coordinates',
          type: 'group',
          admin: {
            description: 'Geographic coordinates',
          },
          fields: [
            {
              name: 'lat',
              type: 'number',
              required: true,
              label: 'Latitude',
            },
            {
              name: 'lng',
              type: 'number',
              required: true,
              label: 'Longitude',
            },
          ],
        },
        {
          name: 'city',
          type: 'text',
          label: 'City',
          admin: {
            description: 'City extracted from address',
          },
        },
        {
          name: 'state',
          type: 'text',
          label: 'State/Province',
          admin: {
            description: 'State/province extracted from address',
          },
        },
        {
          name: 'zipCode',
          type: 'text',
          label: 'Zip/Postal Code',
          admin: {
            description: 'Postal code extracted from address',
          },
        },
      ],
    },
    {
      name: 'customerInfo',
      type: 'group',
      admin: {
        description: 'Customer contact information',
      },
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
          label: 'First Name',
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          label: 'Last Name',
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Email Address',
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: 'Phone Number',
        },
        {
          name: 'preferredContact',
          type: 'select',
          required: true,
          defaultValue: 'phone',
          options: [
            { label: 'Phone', value: 'phone' },
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
          ],
        },
      ],
    },
    {
      name: 'preferredDateTime',
      type: 'date',
      admin: {
        description: 'When the customer would prefer service',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      label: 'Preferred Date and Time',
    },
    {
      name: 'photos',
      type: 'array',
      label: 'Problem Photos',
      admin: {
        description: 'Photos of the problem requiring service',
      },
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
          label: 'Photo Description',
        },
      ],
    },
    // Note: Bids are now managed as a separate collection
    // Use the /api/bids endpoint to query bids for this service request
    {
      name: 'notes',
      type: 'array',
      admin: {
        description: 'Internal notes about this request',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'content',
          type: 'textarea',
          label: 'Note Content',
          required: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          hasMany: false,
          label: 'Author',
        },
        {
          name: 'createdAt',
          type: 'date',
          label: 'Creation Date',
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
      label: 'Customer',
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'User who submitted the request',
      },
      filterOptions: {
        role: {
          in: ['client', 'superadmin', 'admin'],
        },
      },
      defaultValue: ({ req }) => {
        if (req.user) {
          return req.user.id
        }
        return undefined
      },
    },
    {
      name: 'assignedContractor',
      type: 'relationship',
      relationTo: 'users',
      label: 'Assigned Contractor',
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Contractor assigned to this service request',
        condition: (data) => Boolean(data?.status !== 'pending'),
      },
      access: {
        create: ({ req }) =>
          Boolean(req.user && ['admin', 'superadmin'].includes(req.user.role as string)),
        update: ({ req }) =>
          Boolean(req.user && ['admin', 'superadmin'].includes(req.user.role as string)),
      },
      filterOptions: {
        role: {
          equals: 'contractor',
        },
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'not_initiated',
      admin: {
        position: 'sidebar',
        description: 'Current status of the payment',
      },
      options: [
        { label: 'Not Initiated', value: 'not_initiated' },
        { label: 'Pending', value: 'pending' },
        { label: 'Authorized', value: 'authorized' },
        { label: 'Captured', value: 'captured' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'paymentIntentId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Stripe Payment Intent ID',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, operation, doc, previousDoc }) => {
        if (operation === 'create') {
          console.log(`New service request created: ${doc.requestId}`)

          // Auto-transition to receiving-quotes status
          if (doc.status === 'pending') {
            // Update status to receiving-quotes to indicate contractors can now bid
            const payload = req.payload
            try {
              await payload.update({
                collection: 'service-requests',
                id: doc.id,
                data: {
                  status: 'receiving-quotes',
                },
              })
              console.log(`Status updated to receiving-quotes for request: ${doc.requestId}`)
            } catch (error) {
              console.error('Failed to update status to receiving-quotes:', error)
            }
          }

          // TODO: Implement contractor notification logic here
          // 1. Find nearby contractors with matching services
          // 2. Send notifications about new opportunity
          // 3. Update analytics/statistics
        }

        // Handle status transitions
        if (operation === 'update' && previousDoc && doc.status !== previousDoc.status) {
          console.log(
            `Service request ${doc.requestId} status changed from ${previousDoc.status} to ${doc.status}`,
          )

          // Log significant transitions
          if (doc.status === 'assigned' && previousDoc.status === 'receiving-quotes') {
            console.log(`✅ Contractor assigned to request ${doc.requestId}`)
          }

          if (doc.status === 'completed' && previousDoc.status === 'in-progress') {
            console.log(`🎉 Service request ${doc.requestId} completed`)
            // TODO: Trigger completion notifications and payment processing
          }
        }
      },
    ],
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          // Extraer ciudad, estado y código postal del formattedAddress
          // Esta es una implementación básica, podría mejorarse con un servicio de geocodificación real
          if (data.location?.formattedAddress) {
            const addressParts = data.location.formattedAddress.split(',')
            if (addressParts.length >= 3) {
              data.location.city =
                data.location.city || addressParts[addressParts.length - 3]?.trim()

              // Extraer estado y código postal
              const stateZip = addressParts[addressParts.length - 2]?.trim().split(' ')
              if (stateZip && stateZip.length >= 2) {
                data.location.state = data.location.state || stateZip[0]
                data.location.zipCode = data.location.zipCode || stateZip[1]
              }
            }
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
