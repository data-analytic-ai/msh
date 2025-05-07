/**
 * Contractors Collection
 *
 * Stores information about service contractors available on the platform.
 * This collection represents businesses or individuals who provide services
 * to customers. It includes contact information, service offerings, and location data.
 *
 * Relationships:
 * - Relates to the Services collection through servicesOffered field
 */

import { CollectionConfig } from 'payload'

const Contractors: CollectionConfig = {
  slug: 'contractors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'verified'],
    group: 'Service Management',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Contractor Name',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
      label: 'Contact Email',
    },
    {
      name: 'contactPhone',
      type: 'text',
      required: true,
      label: 'Contact Phone',
    },
    {
      name: 'website',
      type: 'text',
      required: false,
      label: 'Website URL',
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      label: 'Address',
    },
    {
      name: 'location',
      type: 'group',
      label: 'Location Coordinates',
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
      name: 'servicesOffered',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      required: true,
      label: 'Services Offered',
    },
    {
      name: 'yearsExperience',
      type: 'number',
      required: true,
      label: 'Years of Experience',
      min: 0,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      label: 'Rating',
      min: 0,
      max: 5,
    },
    {
      name: 'reviewCount',
      type: 'number',
      required: true,
      label: 'Number of Reviews',
      min: 0,
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Profile Image',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Cover Image',
    },
    {
      name: 'specialties',
      type: 'array',
      label: 'Specialties',
      fields: [
        {
          name: 'specialty',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'certifications',
      type: 'array',
      label: 'Certifications',
      fields: [
        {
          name: 'certification',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'workingHours',
      type: 'group',
      label: 'Working Hours',
      fields: [
        {
          name: 'monday',
          type: 'text',
          label: 'Monday',
        },
        {
          name: 'tuesday',
          type: 'text',
          label: 'Tuesday',
        },
        {
          name: 'wednesday',
          type: 'text',
          label: 'Wednesday',
        },
        {
          name: 'thursday',
          type: 'text',
          label: 'Thursday',
        },
        {
          name: 'friday',
          type: 'text',
          label: 'Friday',
        },
        {
          name: 'saturday',
          type: 'text',
          label: 'Saturday',
        },
        {
          name: 'sunday',
          type: 'text',
          label: 'Sunday',
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram',
        },
        {
          name: 'twitter',
          type: 'text',
          label: 'Twitter',
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn',
        },
      ],
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Verified Contractor',
    },
    {
      name: 'dataSource',
      type: 'select',
      options: [
        {
          label: 'Manual Entry',
          value: 'manual',
        },
        {
          label: 'Google Maps',
          value: 'google_maps',
        },
        {
          label: 'Yelp',
          value: 'yelp',
        },
        {
          label: 'External API',
          value: 'external_api',
        },
      ],
      defaultValue: 'manual',
      required: true,
      label: 'Data Source',
    },
    {
      name: 'dataSourceId',
      type: 'text',
      required: false,
      label: 'Data Source ID',
      admin: {
        description: 'ID or reference in the external data source',
      },
    },
    {
      name: 'lastScraped',
      type: 'date',
      required: false,
      label: 'Last Scraped',
      admin: {
        description: 'When this data was last updated from external source',
      },
    },
  ],
  timestamps: true,
}

export default Contractors
