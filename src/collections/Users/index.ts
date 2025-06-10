import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { admins } from '../../access/admins'

/**
 * Users Collection
 *
 * This collection stores all user data with different roles in the application.
 * The role field determines the access level and permissions of each user.
 * Contractor users are automatically synced with the Contractors collection.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => {
      // Allow access to admin panel if user is admin/superadmin, or if no user (for login page)
      // if (!req.user) return true // Allow unauthenticated access for login
      return req.user?.role === 'admin' || req.user?.role === 'superadmin'
    },
    create: () => true, // Permitir registro público
    delete: admins,
    read: authenticated,
    update: ({ req: { user } }) => {
      // Solo administradores pueden actualizar cualquier usuario
      // Usuarios normales solo pueden actualizar su propio perfil
      if (user?.role === 'admin' || user?.role === 'superadmin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
  },
  admin: {
    defaultColumns: ['firstName', 'lastName', 'email', 'role'],
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'client',
      options: [
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'Administrador', value: 'admin' },
        { label: 'Contratista', value: 'contractor' },
        { label: 'Cliente', value: 'client' },
      ],
    },
    // Basic Information
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
      name: 'phone',
      type: 'text',
      required: false,
      label: 'Phone Number',
    },
    {
      name: 'phoneVerified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Phone Verified',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Profile Picture',
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Address',
        },
        {
          name: 'lat',
          type: 'number',
          label: 'Latitude',
        },
        {
          name: 'lng',
          type: 'number',
          label: 'Longitude',
        },
      ],
    },
    // Business Information (for contractors)
    {
      name: 'businessName',
      type: 'text',
      label: 'Business Name',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'businessType',
      type: 'select',
      options: [
        { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
        { label: 'Partnership', value: 'partnership' },
        { label: 'LLC', value: 'llc' },
        { label: 'Corporation', value: 'corporation' },
      ],
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'businessLicense',
      type: 'text',
      label: 'Business License',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'businessAddress',
      type: 'text',
      label: 'Business Address',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'businessCity',
      type: 'text',
      label: 'Business City',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'businessState',
      type: 'text',
      label: 'Business State',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'businessZip',
      type: 'text',
      label: 'Business Zip Code',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'taxId',
      type: 'text',
      label: 'Tax ID',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'yearsOfExperience',
      type: 'number',
      label: 'Years of Experience',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    // Services and Specializations
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Plumbing', value: 'plumbing' },
        { label: 'Electrical', value: 'electrical' },
        { label: 'HVAC', value: 'hvac' },
        { label: 'Roofing', value: 'roofing' },
        { label: 'Painting', value: 'painting' },
        { label: 'Flooring', value: 'flooring' },
        { label: 'Carpentry', value: 'carpentry' },
        { label: 'Landscaping', value: 'landscaping' },
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Locksmith', value: 'locksmith' },
        { label: 'Glass', value: 'glass' },
        { label: 'Pest Control', value: 'pests' },
        { label: 'General Repairs', value: 'general' },
      ],
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'specializations',
      type: 'array',
      label: 'Specializations',
      fields: [
        {
          name: 'specialization',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'serviceRadius',
      type: 'number',
      label: 'Service Radius (km)',
      defaultValue: 25,
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'hourlyRate',
      type: 'number',
      label: 'Hourly Rate ($)',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'minimumJobValue',
      type: 'number',
      label: 'Minimum Job Value ($)',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    // Payment Information
    {
      name: 'stripeAccountId',
      type: 'text',
      label: 'Stripe Account ID',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'bankAccountVerified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Bank Account Verified',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'paymentMethodsAccepted',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Credit/Debit Cards', value: 'card' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Cash', value: 'cash' },
      ],
      defaultValue: ['card'],
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    // Settings
    {
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      label: 'Available for Jobs',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'autoAcceptJobs',
      type: 'checkbox',
      defaultValue: false,
      label: 'Auto Accept Jobs',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'notificationPreferences',
      type: 'group',
      label: 'Notification Preferences',
      fields: [
        {
          name: 'email',
          type: 'checkbox',
          defaultValue: true,
          label: 'Email Notifications',
        },
        {
          name: 'sms',
          type: 'checkbox',
          defaultValue: false,
          label: 'SMS Notifications',
        },
        {
          name: 'push',
          type: 'checkbox',
          defaultValue: true,
          label: 'Push Notifications',
        },
        {
          name: 'newJobs',
          type: 'checkbox',
          defaultValue: true,
          label: 'New Jobs Notifications',
        },
        {
          name: 'jobUpdates',
          type: 'checkbox',
          defaultValue: true,
          label: 'Job Updates Notifications',
        },
        {
          name: 'payments',
          type: 'checkbox',
          defaultValue: true,
          label: 'Payment Notifications',
        },
      ],
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    // Statistics and Status
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 0,
      label: 'Average Rating',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      label: 'Number of Reviews',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'completedJobs',
      type: 'number',
      defaultValue: 0,
      label: 'Completed Jobs',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Verified Contractor',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
    // Google Maps Integration
    {
      name: 'googlePlaceId',
      type: 'text',
      label: 'Google Place ID',
      admin: {
        condition: (data) => data.role === 'contractor',
        description: 'ID from Google Places API if this contractor was imported',
      },
    },
    {
      name: 'dataSource',
      type: 'select',
      options: [
        { label: 'Manual Registration', value: 'manual' },
        { label: 'Google Maps', value: 'google_maps' },
        { label: 'Platform Invitation', value: 'invitation' },
      ],
      defaultValue: 'manual',
      admin: {
        condition: (data) => data.role === 'contractor',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        // Sync contractor data to Contractors collection
        if (doc.role === 'contractor') {
          try {
            const contractorData = {
              name: `${doc.firstName} ${doc.lastName}`,
              description: doc.specializations?.map((s: any) => s.specialization).join(', ') || '',
              contactEmail: doc.email,
              contactPhone: doc.phone || '',
              website: '',
              address: doc.businessAddress || doc.location?.address || '',
              location: {
                lat: doc.location?.lat || 0,
                lng: doc.location?.lng || 0,
              },
              servicesOffered: [], // Will be populated via relationship
              yearsExperience: doc.yearsOfExperience || 0,
              rating: doc.rating || 0,
              reviewCount: doc.reviewCount || 0,
              profileImage: doc.avatar || null,
              specialties:
                doc.specializations?.map((s: any) => ({ specialty: s.specialization })) || [],
              verified: doc.verified || false,
              dataSource: doc.dataSource || 'manual',
              dataSourceId: doc.googlePlaceId || '',
              businessStatus: 'OPERATIONAL' as const,
              invitationStatus: 'registered' as const,
              userId: doc.id, // Link back to user
            }

            // Check if contractor already exists
            const existingContractor = await req.payload.find({
              collection: 'contractors',
              where: {
                or: [
                  { userId: { equals: doc.id } },
                  { dataSourceId: { equals: doc.googlePlaceId } },
                ],
              },
              limit: 1,
            })

            if (existingContractor.docs.length > 0) {
              // Update existing contractor
              const contractorId = existingContractor.docs[0]?.id
              if (contractorId) {
                await req.payload.update({
                  collection: 'contractors',
                  id: contractorId,
                  data: contractorData,
                })
              }
            } else {
              // Create new contractor
              await req.payload.create({
                collection: 'contractors',
                data: contractorData,
              })
            }
          } catch (error) {
            console.error('Error syncing contractor data:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}
