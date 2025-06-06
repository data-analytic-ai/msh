import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React, { useState } from 'react'
import { Phone, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react'

import { Error } from '../Error'
import { Width } from '../Width'

/**
 * PhoneNumber - US phone number input field with formatting and validation
 *
 * A specialized phone number input that automatically formats phone numbers
 * to US standard format (XXX) XXX-XXXX, validates the input, and provides
 * descriptive feedback to users.
 *
 * @param {TextField & FormProps} props - Field configuration and form methods
 * @returns {JSX.Element} - Rendered phone number input field
 */
export const PhoneNumber: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const [value, setValue] = useState(defaultValue || '')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '')

    // Limit to 10 digits
    const limited = cleaned.substring(0, 10)

    // Apply formatting
    if (limited.length >= 6) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}-${limited.substring(6)}`
    } else if (limited.length >= 3) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3)}`
    } else if (limited.length > 0) {
      return `(${limited}`
    }

    return limited
  }

  const validatePhoneNumber = (phoneNumber: string): boolean | null => {
    if (!phoneNumber) return null
    const cleaned = phoneNumber.replace(/\D/g, '')
    return cleaned.length === 10
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatPhoneNumber(inputValue)
    setValue(formatted)
    setIsValid(validatePhoneNumber(formatted))

    // Update the form register with clean number for validation
    const cleaned = formatted.replace(/\D/g, '')
    e.target.value = cleaned
  }

  const getValidationIcon = () => {
    if (!value) return null
    if (isValid === true) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (isValid === false) return <AlertCircle className="h-4 w-4 text-red-600" />
    return null
  }

  const fieldRegistration = register(name, {
    required: required
      ? 'Tu número de teléfono es necesario para que los profesionales puedan contactarte directamente'
      : false,
    validate: (value: string) => {
      if (!required && !value) return true
      if (required && !value)
        return 'Tu número de teléfono es necesario para que los profesionales puedan contactarte directamente'

      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length !== 10) {
        return 'El número debe tener exactamente 10 dígitos. Ejemplo: (555) 123-4567'
      }

      // Additional validation for US phone numbers
      if (cleaned.startsWith('0') || cleaned.startsWith('1')) {
        return 'Por favor ingresa un número válido. Los números no pueden empezar con 0 o 1'
      }

      return true
    },
  })

  return (
    <TooltipProvider>
      <Width width={width}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={name}>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {label}
                {required && (
                  <span className="required text-red-500">
                    * <span className="sr-only">(required)</span>
                  </span>
                )}
              </div>
            </Label>

            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">¿Por qué necesitamos tu teléfono?</p>
                  <ul className="text-xs space-y-1">
                    <li>• Coordinar horarios de visita</li>
                    <li>• Llamarte si hay algún retraso</li>
                    <li>• Confirmar detalles del servicio</li>
                    <li>• Contacto directo con el profesional</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    <strong>Formato automático:</strong> (555) 123-4567
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="relative">
            <Input
              {...fieldRegistration}
              id={name}
              type="tel"
              value={value}
              placeholder="(555) 123-4567"
              maxLength={14}
              className={`pr-10 ${
                isValid === true
                  ? 'border-green-500 focus:border-green-500'
                  : isValid === false
                    ? 'border-red-500 focus:border-red-500'
                    : ''
              }`}
              onChange={(e) => {
                fieldRegistration.onChange(e)
                handleChange(e)
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {getValidationIcon()}
            </div>
          </div>

          {/* Real-time validation feedback */}
          {value && isValid === false && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                {value.replace(/\D/g, '').length < 10
                  ? `Faltan ${10 - value.replace(/\D/g, '').length} dígitos. Necesitamos 10 dígitos en total.`
                  : 'Formato no válido. Asegúrate de que no empiece con 0 o 1.'}
              </p>
            </div>
          )}

          {value && isValid === true && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                ¡Número válido! Los profesionales podrán contactarte a este número
              </p>
            </div>
          )}
        </div>

        {errors[name] && <Error message={errors[name]?.message as string} />}
      </Width>
    </TooltipProvider>
  )
}
