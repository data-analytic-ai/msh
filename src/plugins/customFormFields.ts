import type { Block } from 'payload'

/**
 * Custom Form Fields Configuration
 *
 * This file defines custom form field blocks that extend the default
 * PayloadCMS form-builder plugin fields following the Field Overrides pattern.
 *
 * Reference: https://payloadcms.com/docs/plugins/form-builder#field-overrides
 */

// PhoneNumber Field Block
const phoneNumberField: Block = {
  slug: 'phoneNumber',
  interfaceName: 'PhoneNumberField',
  labels: {
    singular: 'Phone Number Field',
    plural: 'Phone Number Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Field Name',
    },
    {
      name: 'label',
      type: 'text',
      label: 'Field Label',
    },
    {
      name: 'width',
      type: 'number',
      label: 'Field Width (%)',
      admin: {
        description: 'Width of the field in the form layout',
        step: 1,
      },
    },
    {
      name: 'required',
      type: 'checkbox',
      label: 'Required Field',
    },
  ],
}

// ImageUpload Field Block
const imageUploadField: Block = {
  slug: 'imageUpload',
  interfaceName: 'ImageUploadField',
  labels: {
    singular: 'Image Upload Field',
    plural: 'Image Upload Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Field Name',
    },
    {
      name: 'label',
      type: 'text',
      label: 'Field Label',
    },
    {
      name: 'width',
      type: 'number',
      label: 'Field Width (%)',
    },
    {
      name: 'required',
      type: 'checkbox',
      label: 'Required Field',
    },
    {
      name: 'maxFiles',
      type: 'number',
      label: 'Maximum Number of Files',
      defaultValue: 5,
    },
  ],
}

// Location Field Block
const locationField: Block = {
  slug: 'location',
  interfaceName: 'LocationField',
  labels: {
    singular: 'Location Field',
    plural: 'Location Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Field Name',
    },
    {
      name: 'label',
      type: 'text',
      label: 'Field Label',
    },
    {
      name: 'width',
      type: 'number',
      label: 'Field Width (%)',
    },
    {
      name: 'required',
      type: 'checkbox',
      label: 'Required Field',
    },
  ],
}

// ColorPicker Field Block
const colorPickerField: Block = {
  slug: 'colorPicker',
  interfaceName: 'ColorPickerField',
  labels: {
    singular: 'Color Picker Field',
    plural: 'Color Picker Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Field Name',
    },
    {
      name: 'label',
      type: 'text',
      label: 'Field Label',
    },
    {
      name: 'width',
      type: 'number',
      label: 'Field Width (%)',
    },
    {
      name: 'required',
      type: 'checkbox',
      label: 'Required Field',
    },
    {
      name: 'defaultValue',
      type: 'text',
      label: 'Default Color',
      admin: {
        description: 'Default color value (hex format)',
      },
    },
  ],
}

// UrgencyLevel Field Block
const urgencyLevelField: Block = {
  slug: 'urgencyLevel',
  interfaceName: 'UrgencyLevelField',
  labels: {
    singular: 'Urgency Level Field',
    plural: 'Urgency Level Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Field Name',
    },
    {
      name: 'label',
      type: 'text',
      label: 'Field Label',
    },
    {
      name: 'width',
      type: 'number',
      label: 'Field Width (%)',
    },
    {
      name: 'required',
      type: 'checkbox',
      label: 'Required Field',
    },
    {
      name: 'defaultValue',
      type: 'select',
      label: 'Default Urgency Level',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Emergency', value: 'emergency' },
      ],
    },
  ],
}

// ServiceRequestConfirmation Field Block
const serviceRequestConfirmationField: Block = {
  slug: 'serviceRequestConfirmation',
  interfaceName: 'ServiceRequestConfirmationField',
  labels: {
    singular: 'Service Request Confirmation Field',
    plural: 'Service Request Confirmation Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Field Name',
      defaultValue: 'serviceRequestConfirmation',
    },
    {
      name: 'label',
      type: 'text',
      label: 'Custom Label (optional)',
      admin: {
        description: 'Leave empty to use default confirmation text',
      },
    },
    {
      name: 'width',
      type: 'number',
      label: 'Field Width (%)',
      defaultValue: 100,
    },
    {
      name: 'required',
      type: 'checkbox',
      label: 'Required Field',
      defaultValue: true,
      admin: {
        readOnly: true,
        description: 'This field is always required for service requests',
      },
    },
  ],
}

// Export custom fields configuration for form-builder plugin
export const customFormFields = {
  phoneNumber: phoneNumberField,
  imageUpload: imageUploadField,
  location: locationField,
  colorPicker: colorPickerField,
  urgencyLevel: urgencyLevelField,
  serviceRequestConfirmation: serviceRequestConfirmationField,
}

// Export individual field blocks for direct import if needed
export { phoneNumberField, imageUploadField, locationField, colorPickerField, urgencyLevelField }
