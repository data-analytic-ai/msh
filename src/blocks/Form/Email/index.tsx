import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React, { useState } from 'react'
import { Mail, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react'

import { Error } from '../Error'
import { Width } from '../Width'

/**
 * Email - Enhanced email input field with validation and tooltips
 *
 * Email input field with real-time validation feedback, descriptive error messages,
 * and helpful tooltips to guide users in providing correct email format.
 *
 * @param {EmailField & FormProps} props - Field configuration and form methods
 * @returns {JSX.Element} - Rendered email input field
 */
export const Email: React.FC<
  EmailField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const [currentValue, setCurrentValue] = useState(defaultValue || '')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  const validateEmail = (email: string) => {
    if (!email) return null
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentValue(value)
    setIsValid(validateEmail(value))
  }

  const getValidationIcon = () => {
    if (!currentValue) return null
    if (isValid === true) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (isValid === false) return <AlertCircle className="h-4 w-4 text-red-600" />
    return null
  }

  const fieldRegistration = register(name, {
    required: required
      ? 'Tu dirección de email es necesaria para enviarte confirmaciones y actualizaciones sobre tu solicitud'
      : false,
    pattern: {
      value: emailRegex,
      message:
        'Por favor ingresa un email válido (ejemplo: tu.nombre@gmail.com). Lo necesitamos para contactarte sobre tu solicitud.',
    },
    validate: (value) => {
      if (!value && required) {
        return 'Tu dirección de email es necesaria para enviarte confirmaciones y actualizaciones sobre tu solicitud'
      }
      if (value && !emailRegex.test(value)) {
        return 'El formato del email no es correcto. Asegúrate de incluir @ y un dominio válido (ej: .com, .es)'
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
                <Mail className="h-4 w-4 text-muted-foreground" />
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
                  <p className="font-semibold text-sm">¿Por qué necesitamos tu email?</p>
                  <ul className="text-xs space-y-1">
                    <li>• Confirmar tu solicitud de servicio</li>
                    <li>• Enviarte actualizaciones del progreso</li>
                    <li>• Compartir detalles de contacto del profesional</li>
                    <li>• Enviar la factura y recibo del servicio</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    <strong>Ejemplo válido:</strong> tu.nombre@gmail.com
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="relative">
            <Input
              {...fieldRegistration}
              defaultValue={defaultValue}
              id={name}
              type="email"
              placeholder="tu.email@ejemplo.com"
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
          {currentValue && isValid === false && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                Email no válido. Revisa que tengas @ y un dominio como .com o .es
              </p>
            </div>
          )}

          {currentValue && isValid === true && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                ¡Email válido! Te enviaremos confirmaciones a esta dirección
              </p>
            </div>
          )}
        </div>

        {errors[name] && <Error message={errors[name]?.message as string} />}
      </Width>
    </TooltipProvider>
  )
}
