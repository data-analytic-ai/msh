import type { CollectionConfig } from 'payload'
import { adminsOrUser } from '../access/adminsOrUser'
import { adminsOrBidOwner } from '../access/adminsOrBidOwner'

/**
 * Bids Collection
 *
 * This collection stores contractor bids/proposals for service requests.
 * Each bid represents a contractor's offer to complete a specific service request.
 * Replaces the embedded quotes system for better scalability and management.
 */
export const Bids: CollectionConfig = {
  slug: 'bids',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'contractor', 'serviceRequest', 'amount', 'status', 'createdAt'],
    group: 'UrgentFix',
    description: 'Contractor bids and proposals for service requests',
  },
  access: {
    create: ({ req }) => {
      // Only contractors can create bids
      return req.user?.role === 'contractor'
    },
    read: ({ req }) => {
      // Admins can read all, contractors can read their own
      if (!req.user) return false

      if (['admin', 'superadmin'].includes(req.user.role as string)) {
        return true
      }

      if (req.user.role === 'contractor') {
        return {
          contractor: {
            equals: req.user.id,
          },
        }
      }

      // Customers will be handled via API endpoint filtering
      if (req.user.role === 'client') {
        return true // Let API handle filtering by serviceRequest.customer
      }

      return false
    },
    update: ({ req }) => {
      // Admins can update all, contractors can update their own bids
      if (!req.user) return false

      if (['admin', 'superadmin'].includes(req.user.role as string)) {
        return true
      }

      if (req.user.role === 'contractor') {
        return {
          contractor: {
            equals: req.user.id,
          },
        }
      }

      // Customers can update via API endpoint (which handles authorization)
      if (req.user.role === 'client') {
        return true
      }

      return false
    },
    delete: ({ req }) => {
      // Only admins and bid owners can delete
      if (!req.user) return false

      if (['admin', 'superadmin'].includes(req.user.role as string)) {
        return true
      }

      if (req.user.role === 'contractor') {
        return {
          contractor: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Bid Title',
      admin: {
        description: 'Auto-generated title for this bid',
      },
      hooks: {
        beforeChange: [
          async ({ operation, data, req }) => {
            if (
              operation === 'create' &&
              data &&
              !data.title &&
              data.serviceRequest &&
              data.contractor
            ) {
              // Generate title from service request and contractor
              try {
                const serviceRequest = await req.payload.findByID({
                  collection: 'service-requests',
                  id: data.serviceRequest,
                })

                const contractor = await req.payload.findByID({
                  collection: 'users',
                  id: data.contractor,
                })

                return `${contractor.firstName} ${contractor.lastName} - ${serviceRequest.requestTitle}`
              } catch (error) {
                return `Bid for Service Request`
              }
            }
            return data?.title
          },
        ],
      },
    },
    {
      name: 'serviceRequest',
      type: 'relationship',
      relationTo: 'service-requests',
      required: true,
      hasMany: false,
      admin: {
        description: 'Service request this bid is for',
      },
    },
    {
      name: 'contractor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        description: 'Contractor who submitted this bid',
      },
      filterOptions: {
        role: {
          equals: 'contractor',
        },
      },
      defaultValue: ({ req }) => {
        if (req.user?.role === 'contractor') {
          return req.user.id
        }
        return undefined
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Bid amount in USD',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of the proposed work',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending - Awaiting customer decision', value: 'pending' },
        { label: 'Accepted - Customer accepted this bid', value: 'accepted' },
        { label: 'Rejected - Customer rejected this bid', value: 'rejected' },
        { label: 'Withdrawn - Contractor withdrew this bid', value: 'withdrawn' },
        { label: 'Expired - Bid expired', value: 'expired' },
      ],
      admin: {
        description: 'Current status of the bid',
      },
      access: {
        update: ({ req }) => {
          // Contractors can change to withdrawn, customers can change to accepted/rejected
          if (!req.user) return false

          if (['admin', 'superadmin'].includes(req.user.role as string)) {
            return true
          }

          // Contractors and customers can update status
          return ['contractor', 'client'].includes(req.user.role as string)
        },
      },
    },
    {
      name: 'estimatedDuration',
      type: 'text',
      admin: {
        description: 'Estimated time to complete the work',
      },
    },
    {
      name: 'warranty',
      type: 'text',
      admin: {
        description: 'Warranty information offered',
      },
    },
    {
      name: 'materials',
      type: 'array',
      label: 'Materials Needed',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
          label: 'Material/Item',
        },
        {
          name: 'cost',
          type: 'number',
          label: 'Estimated Cost',
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
      ],
    },
    {
      name: 'priceBreakdown',
      type: 'group',
      admin: {
        description: 'Detailed price breakdown',
      },
      fields: [
        {
          name: 'labor',
          type: 'number',
          label: 'Labor Cost',
          min: 0,
        },
        {
          name: 'materials',
          type: 'number',
          label: 'Materials Cost',
          min: 0,
        },
        {
          name: 'additional',
          type: 'number',
          label: 'Additional Costs',
          min: 0,
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Breakdown Notes',
        },
      ],
    },
    {
      name: 'availability',
      type: 'text',
      admin: {
        description: 'When contractor is available to start',
      },
    },
    {
      name: 'portfolio',
      type: 'array',
      label: 'Portfolio Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Image Description',
        },
      ],
    },
    {
      name: 'validUntil',
      type: 'date',
      admin: {
        description: 'When this bid expires',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this bid',
      },
    },
    // Tracking fields
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        description: 'When the bid was submitted',
        readOnly: true,
      },
      defaultValue: () => new Date(),
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        description: 'When the bid was accepted',
        readOnly: true,
      },
    },
    {
      name: 'rejectedAt',
      type: 'date',
      admin: {
        description: 'When the bid was rejected',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, data, originalDoc, req }) => {
        // Set acceptance/rejection timestamps
        if (operation === 'update' && originalDoc && data?.status !== originalDoc.status) {
          if (data.status === 'accepted' && originalDoc.status !== 'accepted') {
            data.acceptedAt = new Date()
          }
          if (data.status === 'rejected' && originalDoc.status !== 'rejected') {
            data.rejectedAt = new Date()
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ operation, doc, previousDoc, req }) => {
        // Handle bid status changes
        if (operation === 'update' && previousDoc && doc.status !== previousDoc.status) {
          console.log(`Bid ${doc.id} status changed from ${previousDoc.status} to ${doc.status}`)

          // When a bid is accepted
          if (doc.status === 'accepted' && previousDoc.status !== 'accepted') {
            try {
              // Update service request status and assign contractor
              await req.payload.update({
                collection: 'service-requests',
                id: doc.serviceRequest,
                data: {
                  status: 'assigned',
                  assignedContractor: doc.contractor,
                },
              })

              // Reject all other bids for this service request
              const otherBids = await req.payload.find({
                collection: 'bids',
                where: {
                  and: [
                    {
                      serviceRequest: {
                        equals: doc.serviceRequest,
                      },
                    },
                    {
                      id: {
                        not_equals: doc.id,
                      },
                    },
                    {
                      status: {
                        equals: 'pending',
                      },
                    },
                  ],
                },
              })

              // Reject other pending bids
              for (const bid of otherBids.docs) {
                await req.payload.update({
                  collection: 'bids',
                  id: bid.id,
                  data: {
                    status: 'rejected',
                  },
                })
              }

              // Send notification to contractor
              await req.payload.create({
                collection: 'notifications',
                data: {
                  id: `bid-accepted-${doc.id}-${Date.now()}`,
                  type: 'quote_accepted',
                  title: '¡Tu propuesta fue aceptada!',
                  message: `Tu propuesta de $${doc.amount.toLocaleString()} ha sido aceptada.`,
                  priority: 'high',
                  channels: ['in_app', 'web_push', 'email'],
                  userId: doc.contractor,
                  read: false,
                  data: {
                    bidId: doc.id,
                    serviceRequestId: doc.serviceRequest,
                    amount: doc.amount,
                    actionUrl: `/contractor/dashboard`,
                  },
                  actionLabel: 'Ver trabajo',
                },
              })

              console.log(
                `✅ Bid accepted and contractor assigned for service request ${doc.serviceRequest}`,
              )
            } catch (error) {
              console.error('Error processing bid acceptance:', error)
            }
          }

          // When a bid is rejected
          if (doc.status === 'rejected' && previousDoc.status !== 'rejected') {
            try {
              // Send notification to contractor
              await req.payload.create({
                collection: 'notifications',
                data: {
                  id: `bid-rejected-${doc.id}-${Date.now()}`,
                  type: 'quote_rejected',
                  title: 'Propuesta no seleccionada',
                  message: `Tu propuesta de $${doc.amount.toLocaleString()} no fue seleccionada.`,
                  priority: 'normal',
                  channels: ['in_app', 'email'],
                  userId: doc.contractor,
                  read: false,
                  data: {
                    bidId: doc.id,
                    serviceRequestId: doc.serviceRequest,
                    amount: doc.amount,
                    actionUrl: `/contractor/dashboard/explore`,
                  },
                  actionLabel: 'Ver más solicitudes',
                },
              })

              console.log(`📧 Bid rejection notification sent to contractor ${doc.contractor}`)
            } catch (error) {
              console.error('Error sending bid rejection notification:', error)
            }
          }
        }

        // When a new bid is created
        if (operation === 'create') {
          try {
            // Get service request to notify customer
            const serviceRequest = await req.payload.findByID({
              collection: 'service-requests',
              id: doc.serviceRequest,
              depth: 1,
            })

            // Get contractor info
            const contractor = await req.payload.findByID({
              collection: 'users',
              id: doc.contractor,
            })

            // Determine customer ID
            let customerId = serviceRequest.customer
            if (typeof customerId === 'object' && customerId?.id) {
              customerId = customerId.id
            }

            // If no customer linked, try to find by email
            if (!customerId && serviceRequest.customerInfo?.email) {
              const users = await req.payload.find({
                collection: 'users',
                where: {
                  email: {
                    equals: serviceRequest.customerInfo.email,
                  },
                },
                limit: 1,
              })

              if (users.docs.length > 0 && users.docs[0]) {
                customerId = users.docs[0].id

                // Update service request to link customer
                await req.payload.update({
                  collection: 'service-requests',
                  id: doc.serviceRequest,
                  data: {
                    customer: customerId,
                  },
                })
              }
            }

            // Send notification to customer if we have a customer ID
            if (customerId) {
              await req.payload.create({
                collection: 'notifications',
                data: {
                  id: `bid-received-${doc.id}-${Date.now()}`,
                  type: 'quote_received',
                  title: 'Nueva propuesta recibida',
                  message: `${contractor.firstName} ${contractor.lastName} envió una propuesta de $${doc.amount.toLocaleString()} para "${serviceRequest.requestTitle}".`,
                  priority: 'high',
                  channels: ['in_app', 'web_push', 'email'],
                  userId: customerId,
                  read: false,
                  data: {
                    bidId: doc.id,
                    serviceRequestId: doc.serviceRequest,
                    contractorName: `${contractor.firstName} ${contractor.lastName}`,
                    amount: doc.amount,
                    actionUrl: `/quotes/${doc.serviceRequest}`,
                  },
                  actionLabel: 'Ver propuesta',
                },
              })

              console.log(`📧 New bid notification sent to customer ${customerId}`)
            }
          } catch (error) {
            console.error('Error sending new bid notification:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}
