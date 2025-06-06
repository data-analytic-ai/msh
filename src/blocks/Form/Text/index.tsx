import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React from 'react'
import { Type, HelpCircle } from 'lucide-react'

import { Error } from '../Error'
import { Width } from '../Width'

/**
 * Text - Enhanced text input field with validation and tooltips
 *
 * Text input field with descriptive validation messages and helpful tooltips
 * to guide users in providing the correct information.
 *
 * @param {TextField & FormProps} props - Field configuration and form methods
 * @returns {JSX.Element} - Rendered text input field
 */
export const Text: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  // Get field-specific validation and tooltip content
  const getFieldConfig = (fieldName: string) => {
    const configs: Record<
      string,
      {
        placeholder: string
        tooltip: string
        validation: any
      }
    > = {
      firstName: {
        placeholder: 'Ej: Juan',
        tooltip:
          'Tu nombre nos ayuda a personalizar el servicio y que el profesional pueda dirigirse a ti correctamente.',
        validation: {
          required: required
            ? 'Por favor ingresa tu nombre para que podamos identificarte correctamente'
            : false,
          minLength: {
            value: 2,
            message: 'El nombre debe tener al menos 2 caracteres',
          },
          pattern: {
            value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: 'El nombre solo puede contener letras y espacios',
          },
        },
      },
      lastName: {
        placeholder: 'Ej: Pérez',
        tooltip:
          'Tu apellido completa tu identificación y nos ayuda en la comunicación profesional.',
        validation: {
          required: required
            ? 'Por favor ingresa tu apellido para completar tu identificación'
            : false,
          minLength: {
            value: 2,
            message: 'El apellido debe tener al menos 2 caracteres',
          },
          pattern: {
            value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: 'El apellido solo puede contener letras y espacios',
          },
        },
      },
      default: {
        placeholder: 'Ingresa la información requerida',
        tooltip: 'Este campo es necesario para procesar tu solicitud correctamente.',
        validation: {
          required: required ? 'Este campo es requerido para continuar' : false,
        },
      },
    }

    return configs[fieldName] || configs.default
  }

  const fieldConfig = getFieldConfig(name)

  return (
    <TooltipProvider>
      <Width width={width}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={name}>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
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
                <p className="text-sm">{fieldConfig?.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Input
            defaultValue={defaultValue}
            id={name}
            type="text"
            placeholder={fieldConfig?.placeholder}
            {...register(name, fieldConfig?.validation)}
          />
        </div>

        {errors[name] && <Error message={errors[name]?.message as string} />}
      </Width>
    </TooltipProvider>
  )
}
