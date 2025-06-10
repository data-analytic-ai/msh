/**
 * ServiceRequestConfirmation - Custom field component for service request confirmation
 *
 * A specialized confirmation field that displays after the problem description
 * in service request forms. Includes required checkbox acceptance and
 * informational content with relevant links.
 *
 * @param {ServiceRequestConfirmationFieldProps} props - Field configuration
 * @returns {JSX.Element} - Rendered confirmation field
 */
'use client'

import React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, ExternalLink, Shield, AlertTriangle } from 'lucide-react'
import { Error } from '../Error'
import { Width } from '../Width'

export interface ServiceRequestConfirmationField {
  blockType: 'serviceRequestConfirmation'
  name: string
  label?: string
  width?: number
  required?: boolean
  defaultValue?: boolean
}

export interface ServiceRequestConfirmationFieldProps extends ServiceRequestConfirmationField {
  errors: Partial<FieldErrorsImpl<{ [x: string]: any }>>
  register: UseFormRegister<FieldValues>
}

export const ServiceRequestConfirmation: React.FC<ServiceRequestConfirmationFieldProps> = ({
  name,
  label,
  required = true,
  width,
  errors,
  register,
  defaultValue = false,
}) => {
  const { setValue } = useFormContext()
  const props = register(name, { required: required })

  return (
    <Width width={width || 100}>
      <div className="space-y-4">
        {/* Informational Section */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="space-y-3">
              <p className="font-medium">Important information before submitting your request:</p>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    <strong>ER24 is a platform</strong> that connects users with independent service
                    providers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    <strong>ER24 is not a service provider</strong> and does not supervise, control,
                    or guarantee the quality of the services provided.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    You may receive <strong>one or multiple quotes</strong> from contractors in your
                    area.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    <strong>No payment is required</strong> to submit this request.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    If you accept a quote, <strong>payment will be processed securely</strong>{' '}
                    through the ER24 platform.
                  </span>
                </li>
              </ul>

              <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                <p className="text-sm">
                  By submitting this request, you also agree to our{' '}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Terms of Service
                    <ExternalLink className="h-3 w-3" />
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  .
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
          <CheckboxUi
            defaultChecked={defaultValue}
            id={name}
            {...props}
            onCheckedChange={(checked) => {
              setValue(props.name, checked)
            }}
            className="mt-0.5"
          />
          <Label htmlFor={name} className="text-sm leading-5 cursor-pointer">
            {required && (
              <span className="text-destructive mr-1">
                * <span className="sr-only">(required)</span>
              </span>
            )}
            {label ||
              'I acknowledge that ER24 is a referral platform only and is not the service provider. I accept responsibility for choosing and authorizing the contractor and I authorize verified contractors to contact me regarding this request.'}
          </Label>
        </div>

        {/* Error Display */}
        {errors[name] && (
          <div className="text-sm text-destructive">
            <Error />
          </div>
        )}
      </div>
    </Width>
  )
}
