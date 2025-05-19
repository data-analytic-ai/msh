/**
 * Contractors Collection
 *
 * Stores information about service contractors available on the platform.
 * This collection represents businesses or individuals who provide services
 * to customers. It includes contact information, service offerings, and location data.
 *
 * Relationships:
 * - Relates to the Services collection through servicesOffered field
 * - Can be sourced from manual entry or external APIs like Google Places
 */

import { CollectionConfig } from 'payload'

const Contractors: CollectionConfig = {
  slug: 'contractors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'verified', 'dataSource'],
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
      required: false,
      label: 'Description',
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: false,
      label: 'Contact Email',
    },
    {
      name: 'contactPhone',
      type: 'text',
      required: false,
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
      required: false,
      label: 'Services Offered',
    },
    {
      name: 'yearsExperience',
      type: 'number',
      required: false,
      label: 'Years of Experience',
      min: 0,
    },
    {
      name: 'rating',
      type: 'number',
      required: false,
      label: 'Rating',
      min: 0,
      max: 5,
    },
    {
      name: 'reviewCount',
      type: 'number',
      required: false,
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
      name: 'openNow',
      type: 'checkbox',
      label: 'Open Now',
      defaultValue: false,
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
        description: 'ID or reference in the external data source (e.g., Google Place ID)',
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
    {
      name: 'googleTypes',
      type: 'array',
      label: 'Google Place Types',
      admin: {
        description: 'Category types from Google Places API',
      },
      fields: [
        {
          name: 'type',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'responseTime',
      type: 'text',
      label: 'Response Time',
      required: false,
      admin: {
        description: 'Estimated response time for service requests',
      },
    },
    {
      name: 'businessStatus',
      type: 'select',
      options: [
        {
          label: 'Operational',
          value: 'OPERATIONAL',
        },
        {
          label: 'Closed Temporarily',
          value: 'CLOSED_TEMPORARILY',
        },
        {
          label: 'Closed Permanently',
          value: 'CLOSED_PERMANENTLY',
        },
      ],
      required: false,
      label: 'Business Status',
    },
    {
      name: 'viewport',
      type: 'group',
      label: 'Viewport Coordinates',
      fields: [
        {
          name: 'south',
          type: 'number',
          required: false,
          label: 'South',
        },
        {
          name: 'west',
          type: 'number',
          required: false,
          label: 'West',
        },
        {
          name: 'north',
          type: 'number',
          required: false,
          label: 'North',
        },
        {
          name: 'east',
          type: 'number',
          required: false,
          label: 'East',
        },
      ],
    },
    {
      name: 'invitationStatus',
      type: 'select',
      options: [
        {
          label: 'Not Invited',
          value: 'not_invited',
        },
        {
          label: 'Invitation Sent',
          value: 'invited',
        },
        {
          label: 'Registered',
          value: 'registered',
        },
        {
          label: 'Declined',
          value: 'declined',
        },
      ],
      defaultValue: 'not_invited',
      required: true,
      label: 'Invitation Status',
    },
    {
      name: 'invitationDate',
      type: 'date',
      required: false,
      label: 'Invitation Date',
      admin: {
        description: 'When the invitation was sent to this contractor',
      },
    },
  ],
  timestamps: true,
}

export default Contractors
