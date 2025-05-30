import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Textarea as TextAreaComponent } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React, { useState } from 'react'
import { FileText, HelpCircle } from 'lucide-react'

import { Error } from '../Error'
import { Width } from '../Width'

/**
 * Textarea - Enhanced textarea field with validation and tooltips
 *
 * Textarea input field with character counting, descriptive validation messages
 * and helpful tooltips to guide users in providing detailed information.
 *
 * @param {TextField & FormProps} props - Field configuration and form methods
 * @returns {JSX.Element} - Rendered textarea field
 */
export const Textarea: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, errors, label, register, required, rows = 4, width }) => {
  const [characterCount, setCharacterCount] = useState((defaultValue as string)?.length || 0)

  // Get field-specific configuration
  const getFieldConfig = (fieldName: string) => {
    const configs: Record<
      string,
      {
        placeholder: string
        tooltip: string
        minLength: number
        maxLength: number
        validation: any
      }
    > = {
      description: {
        placeholder:
          "Describe detalladamente el problema que tienes. Por ejemplo: 'El grifo de la cocina gotea constantemente desde hace 3 días...'",
        tooltip:
          'Una descripción detallada nos ayuda a enviar al profesional adecuado con las herramientas correctas, lo que acelera la resolución y puede reducir el costo.',
        minLength: 20,
        maxLength: 1000,
        validation: {
          required: required
            ? 'La descripción del problema es esencial para poder ayudarte correctamente'
            : false,
          minLength: {
            value: 20,
            message:
              'Por favor proporciona más detalles. Necesitamos al menos 20 caracteres para entender bien el problema',
          },
          maxLength: {
            value: 1000,
            message: 'La descripción es muy larga. Por favor resume en máximo 1000 caracteres',
          },
        },
      },
      default: {
        placeholder: 'Ingresa información adicional...',
        tooltip: 'Proporciona información detallada para ayudarnos a procesar tu solicitud.',
        minLength: 10,
        maxLength: 500,
        validation: {
          required: required ? 'Este campo es requerido para continuar' : false,
          minLength: {
            value: 10,
            message: 'Por favor proporciona más información (mínimo 10 caracteres)',
          },
        },
      },
    }

    return configs[fieldName] || configs.default
  }

  const fieldConfig = getFieldConfig(name)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(e.target.value.length)
  }

  return (
    <TooltipProvider>
      <Width width={width}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={name}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
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
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="text-sm">{fieldConfig?.tooltip}</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip:</strong> Incluye ubicación específica, tiempo del problema, y
                    cualquier intento de solución previo.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="relative">
            <TextAreaComponent
              defaultValue={defaultValue}
              id={name}
              rows={rows}
              placeholder={fieldConfig?.placeholder}
              className="resize-vertical"
              {...register(name, fieldConfig?.validation)}
              onChange={(e) => {
                handleTextChange(e)
              }}
            />

            {/* Character counter */}
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              {characterCount}/{fieldConfig?.maxLength}
            </div>
          </div>

          {/* Character count guidance */}
          {fieldConfig?.minLength &&
            characterCount < fieldConfig.minLength &&
            characterCount > 0 && (
              <div className="text-xs text-amber-600">
                Faltan {fieldConfig.minLength - characterCount} caracteres más para una descripción
                completa
              </div>
            )}

          {fieldConfig?.minLength &&
            fieldConfig?.minLength &&
            characterCount >= fieldConfig.minLength &&
            characterCount <= fieldConfig.maxLength && (
              <div className="text-xs text-green-600">¡Perfecto! Descripción completa y clara</div>
            )}
        </div>

        {errors[name] && <Error message={errors[name]?.message as string} />}
      </Width>
    </TooltipProvider>
  )
}
