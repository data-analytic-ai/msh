import { useMemo } from 'react'
import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'

/**
 * useServiceRequestFields - Hook for service request field management
 *
 * Provides predefined field configurations for common service request forms
 * and utilities for handling specialized field types.
 *
 * @returns {Object} - Field configurations and utilities
 */
export const useServiceRequestFields = () => {
  const serviceRequestFieldConfigs = useMemo(
    () => ({
      firstName: {
        blockType: 'text',
        name: 'firstName',
        label: 'First Name',
        required: true,
        width: 50,
      },
      lastName: {
        blockType: 'text',
        name: 'lastName',
        label: 'Last Name',
        required: true,
        width: 50,
      },
      email: {
        blockType: 'email',
        name: 'email',
        label: 'Email Address',
        required: true,
        width: 50,
      },
      phone: {
        blockType: 'phoneNumber',
        name: 'phone',
        label: 'Phone Number',
        required: true,
        width: 50,
      },
      location: {
        blockType: 'location',
        name: 'location',
        label: 'Service Location',
        required: true,
        width: 100,
      },
      urgencyLevel: {
        blockType: 'urgencyLevel',
        name: 'urgencyLevel',
        label: 'Urgency Level',
        required: true,
        width: 100,
      },
      description: {
        blockType: 'textarea',
        name: 'description',
        label: 'Problem Description',
        required: true,
        width: 100,
      },
      images: {
        blockType: 'imageUpload',
        name: 'images',
        label: 'Upload Images (Optional)',
        required: false,
        width: 100,
      },
    }),
    [],
  )

  const getFieldsByStep = (step: number, fieldsPerStep: number = 4) => {
    const allFields = Object.values(serviceRequestFieldConfigs)
    const startIndex = step * fieldsPerStep
    const endIndex = startIndex + fieldsPerStep
    return allFields.slice(startIndex, endIndex)
  }

  const isFullWidthField = (fieldType: string): boolean => {
    return ['textarea', 'message', 'location', 'imageUpload', 'urgencyLevel'].includes(fieldType)
  }

  const getFieldValidationRules = (fieldType: string, required: boolean = false) => {
    const rules: any = {}

    if (required) {
      rules.required = 'This field is required'
    }

    switch (fieldType) {
      case 'email':
        rules.pattern = {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Please enter a valid email address',
        }
        break
      case 'phoneNumber':
        rules.validate = (value: string) => {
          const cleaned = value.replace(/\D/g, '')
          return cleaned.length === 10 || 'Phone number must be 10 digits'
        }
        break
      case 'location':
        rules.minLength = {
          value: 10,
          message: 'Please enter a complete address',
        }
        break
      case 'textarea':
        rules.minLength = {
          value: 20,
          message: 'Please provide a detailed description (at least 20 characters)',
        }
        break
    }

    return rules
  }

  return {
    serviceRequestFieldConfigs,
    getFieldsByStep,
    isFullWidthField,
    getFieldValidationRules,
  }
}

export type ServiceRequestFieldType = keyof ReturnType<
  typeof useServiceRequestFields
>['serviceRequestFieldConfigs']
