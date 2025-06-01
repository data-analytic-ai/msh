'use client'

import React, { useEffect, useState } from 'react'
import { FormBlock, type Data } from './Component'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import type { Form } from '@/payload-types'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

export interface ServiceRequestFormProps {
  formId?: string
  onSubmitSuccess?: () => void
  className?: string
}

/**
 * ServiceRequestForm - Service request form integration component
 *
 * A specialized form component that integrates PayloadCMS forms with the
 * service request flow. It fetches the appropriate form configuration from
 * PayloadCMS and handles submission through the service request hook.
 *
 * @param {ServiceRequestFormProps} props - Form configuration and callbacks
 * @returns {JSX.Element} - Rendered service request form
 */
export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  formId = '68393763cdc1c7abb2481be3', // Use the actual form ID created
  onSubmitSuccess,
  className = '',
}) => {
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { selectedServices, formattedAddress, updateFormData, submitServiceRequest, setUserEmail } =
    useServiceRequest()

  // Fetch form configuration from PayloadCMS
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)

        // Try to find form by ID first, then by title
        let response = await fetch(`/api/forms/${formId}`)

        if (!response.ok) {
          // If not found by ID, try searching by title
          response = await fetch(`/api/forms?where[title][equals]=Service Request Form`)
        }

        if (response.ok) {
          const formData = await response.json()

          if (formData.docs && formData.docs.length > 0) {
            setForm(formData.docs[0])
          } else if (formData.id) {
            setForm(formData)
          } else {
            throw new Error('Form not found')
          }
        } else {
          throw new Error('Failed to fetch form')
        }
      } catch (err) {
        console.error('Error fetching form:', err)
        setError('Unable to load form configuration')
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [formId])

  // Handle form submission with proper field mapping
  const handleServiceRequestSubmit = async (data: Data): Promise<boolean> => {
    try {
      console.log('ServiceRequestForm: Raw form data received:', data)

      // Map form fields to the expected structure
      const mappedData = {
        // Use firstName and lastName directly from the form
        firstName: (data.firstName as string) || '',
        lastName: (data.lastName as string) || '',
        email: (data.email as string) || '',
        // Use the correct phone field name from PayloadCMS
        phone: (data.phoneNumberClient as string) || '',
        description: (data.description as string) || '',
        // Use the correct urgency field name from PayloadCMS
        urgency: (data.urgencyLevelServiceRequestTag as string) || '',
        // Use the correct images field name from PayloadCMS
        images: data.costumerServiceRequestImages || [],
        // Keep original form data for debugging
        originalFormData: data,
      }

      console.log('ServiceRequestForm: Mapped data for submission:', mappedData)

      // Validate required fields with defensive checks
      if (!mappedData.firstName || !mappedData.firstName.trim()) {
        console.error('Missing required field: firstName')
        return false
      }
      if (!mappedData.lastName || !mappedData.lastName.trim()) {
        console.error('Missing required field: lastName')
        return false
      }
      if (!mappedData.email || !mappedData.email.trim()) {
        console.error('Missing required field: email')
        return false
      }
      if (!mappedData.phone || !mappedData.phone.trim()) {
        console.error('Missing required field: phone')
        return false
      }
      if (!mappedData.description || !mappedData.description.trim()) {
        console.error('Missing required field: description')
        return false
      }
      if (!mappedData.urgency || !mappedData.urgency.trim()) {
        console.error('Missing required field: urgency')
        return false
      }

      // Save email for persistence
      if (mappedData.email) {
        setUserEmail(mappedData.email)
      }

      // Update form data in the service request store
      updateFormData(mappedData)

      // Submit through the service request system
      const success = await submitServiceRequest(mappedData)

      if (success && onSubmitSuccess) {
        onSubmitSuccess()
      }

      return success
    } catch (error) {
      console.error('Service request submission failed:', error)
      return false
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading form...</p>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <p className="text-red-600 mb-4">{error || 'Form configuration not available'}</p>
        <p className="text-sm text-muted-foreground">
          Selected Services:{' '}
          {selectedServices?.map((s) => (typeof s === 'object' ? s.id : s)).join(', ') || 'None'}
        </p>
        <p className="text-sm text-muted-foreground">Location: {formattedAddress || 'Not set'}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Service context information */}
      <div className="mb-6 p-4 bg-primary/10 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Service Request Summary</h3>
        <p className="text-sm">
          <strong>Services:</strong>{' '}
          {selectedServices?.map((s) => (typeof s === 'object' ? s.id : s)).join(', ') ||
            'Not specified'}
        </p>
        <p className="text-sm">
          <strong>Location:</strong> {formattedAddress || 'Loading address...'}
        </p>
      </div>

      <FormBlock
        form={form as FormType}
        enableIntro={false}
        mode="serviceRequest"
        onServiceRequestSubmit={handleServiceRequestSubmit}
        customSubmitLabel="Submit Service Request"
        hideProgressBar={false}
      />
    </div>
  )
}
