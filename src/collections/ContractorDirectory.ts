import type { CollectionConfig } from 'payload'
import { admins } from '../access/admins'
import { authenticated } from '../access/authenticated'

/**
 * ContractorDirectory Collection
 *
 * This collection stores information about contractors available in New York.
 * Data is populated from Google Maps API/scraping and used to display available
 * contractors to users when requesting services.
 */
export const ContractorDirectory: CollectionConfig = {
  slug: 'contractor-directory',
  admin: {
    useAsTitle: 'businessName',
    defaultColumns: ['businessName', 'services', 'rating', 'isAvailable'],
    group: 'UrgentFix',
    description: 'Directory of contractors in New York for UrgentFix services',
  },
  access: {
    create: admins, // Only admins can create directory entries
    read: () => true, // Anyone can read contractor directory
    update: admins, // Only admins can update
    delete: admins, // Only admins can delete
  },
  fields: [
    {
      name: 'businessName',
      type: 'text',
      required: true,
      label: 'Business Name',
      admin: {
        description: 'Name of the contractor business',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      admin: {
        description: 'First name of business contact or owner',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      admin: {
        description: 'Last name of business contact or owner',
      },
    },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      required: true,
      admin: {
        description: 'Services offered by this contractor',
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
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      label: 'Available for Work',
      admin: {
        description: 'Whether this contractor is currently available for new jobs',
        position: 'sidebar',
      },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Verified Contractor',
      admin: {
        description: 'Whether this contractor has been verified by UrgentFix',
        position: 'sidebar',
      },
    },
    {
      name: 'placeId',
      type: 'text',
      admin: {
        description: 'Google Maps Place ID for this business',
        position: 'sidebar',
      },
    },
    {
      name: 'location',
      type: 'group',
      admin: {
        description: 'Business location details',
      },
      fields: [
        {
          name: 'formattedAddress',
          type: 'text',
          required: true,
          label: 'Full Address',
          admin: {
            description: 'Complete formatted address from Google Maps',
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
        {
          name: 'neighborhood',
          type: 'text',
          label: 'Neighborhood',
          admin: {
            description: 'Neighborhood or district in New York',
          },
        },
      ],
    },
    {
      name: 'contactInfo',
      type: 'group',
      admin: {
        description: 'Contact information',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'website',
          type: 'text',
          label: 'Website URL',
        },
      ],
    },
    {
      name: 'businessDetails',
      type: 'group',
      admin: {
        description: 'Business details and metrics',
      },
      fields: [
        {
          name: 'description',
          type: 'textarea',
          label: 'Business Description',
        },
        {
          name: 'yearsInBusiness',
          type: 'number',
          min: 0,
          label: 'Years in Business',
        },
        {
          name: 'employeeCount',
          type: 'number',
          min: 1,
          label: 'Number of Employees',
        },
        {
          name: 'licenses',
          type: 'array',
          label: 'Professional Licenses',
          fields: [
            {
              name: 'licenseType',
              type: 'text',
              label: 'License Type',
            },
            {
              name: 'licenseNumber',
              type: 'text',
              label: 'License Number',
            },
            {
              name: 'expirationDate',
              type: 'date',
              label: 'Expiration Date',
            },
          ],
        },
        {
          name: 'certifications',
          type: 'array',
          label: 'Certifications',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Certification Name',
            },
            {
              name: 'issuedBy',
              type: 'text',
              label: 'Issuing Organization',
            },
            {
              name: 'year',
              type: 'number',
              label: 'Year Obtained',
            },
          ],
        },
      ],
    },
    {
      name: 'googleData',
      type: 'group',
      admin: {
        description: 'Data from Google Maps',
      },
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          label: 'Google Rating',
        },
        {
          name: 'reviewCount',
          type: 'number',
          min: 0,
          label: 'Number of Reviews',
        },
        {
          name: 'openingHours',
          type: 'array',
          label: 'Business Hours',
          fields: [
            {
              name: 'day',
              type: 'select',
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
              label: 'Day',
            },
            {
              name: 'open',
              type: 'text',
              label: 'Opening Time',
            },
            {
              name: 'close',
              type: 'text',
              label: 'Closing Time',
            },
          ],
        },
        {
          name: 'categories',
          type: 'array',
          label: 'Business Categories',
          fields: [
            {
              name: 'category',
              type: 'text',
              label: 'Category',
            },
          ],
        },
      ],
    },
    {
      name: 'urgentFixMetrics',
      type: 'group',
      admin: {
        description: 'UrgentFix platform metrics',
      },
      fields: [
        {
          name: 'responseTime',
          type: 'select',
          options: [
            { label: 'Under 15 minutes', value: 'under15' },
            { label: '15-30 minutes', value: '15to30' },
            { label: '30-60 minutes', value: '30to60' },
            { label: 'Over 60 minutes', value: 'over60' },
          ],
          label: 'Average Response Time',
        },
        {
          name: 'completionRate',
          type: 'number',
          min: 0,
          max: 100,
          label: 'Job Completion Rate (%)',
        },
        {
          name: 'onTimeRate',
          type: 'number',
          min: 0,
          max: 100,
          label: 'On-Time Arrival Rate (%)',
        },
        {
          name: 'platformRating',
          type: 'number',
          min: 0,
          max: 5,
          label: 'UrgentFix Platform Rating',
        },
        {
          name: 'jobsCompleted',
          type: 'number',
          min: 0,
          label: 'Total Jobs Completed',
        },
      ],
    },
    {
      name: 'media',
      type: 'group',
      admin: {
        description: 'Business photos and media',
      },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Business Logo',
        },
        {
          name: 'photos',
          type: 'array',
          label: 'Business Photos',
          fields: [
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Photo',
            },
            {
              name: 'caption',
              type: 'text',
              label: 'Caption',
            },
          ],
        },
      ],
    },
    {
      name: 'scrapingData',
      type: 'group',
      admin: {
        description: 'Metadata about web scraping',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'lastScraped',
          type: 'date',
          label: 'Last Scraped Date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'dataSource',
          type: 'text',
          label: 'Data Source',
        },
        {
          name: 'scrapingStatus',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Complete', value: 'complete' },
            { label: 'Failed', value: 'failed' },
            { label: 'Needs Update', value: 'needs-update' },
          ],
          label: 'Scraping Status',
        },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User account associated with this contractor (if any)',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
