import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister, Control } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React, { useState } from 'react'
import { AlertTriangle, Clock, Zap, Calendar, HelpCircle, Info } from 'lucide-react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'

/**
 * UrgencyLevel - Service request urgency selection field
 *
 * A specialized select field for choosing service request urgency levels
 * with predefined options and visual indicators for each urgency type.
 * Responsive design with detailed descriptions and tooltips.
 *
 * @param {SelectField & FormProps} props - Field configuration and form methods
 * @returns {JSX.Element} - Rendered urgency level select field
 */
export const UrgencyLevel: React.FC<
  SelectField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
    control?: Control<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width, control }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || '')

  const urgencyOptions = [
    {
      value: 'emergency',
      label: 'Emergencia',
      description: 'Atención inmediata (riesgo de seguridad)',
      timeframe: 'Dentro de 2-4 horas',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      examples: 'Fuga de gas, corte eléctrico total, inundación',
    },
    {
      value: 'high',
      label: 'Alta',
      description: 'Problema serio que necesita atención rápida',
      timeframe: 'Dentro de 24 horas',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      examples: 'Calefacción no funciona, problema eléctrico importante',
    },
    {
      value: 'medium',
      label: 'Media',
      description: 'Problema que puede esperar unos días',
      timeframe: 'Dentro de 2-3 días',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      examples: 'Reparación de grifo, mantenimiento general',
    },
    {
      value: 'low',
      label: 'Baja Prioridad',
      description: 'Mejoras o mantenimiento preventivo',
      timeframe: 'Dentro de una semana',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      examples: 'Pintura, mejoras estéticas, revisión preventiva',
    },
  ]

  const getOptionByValue = (value: string) => {
    return urgencyOptions.find((option) => option.value === value)
  }

  const renderSelectItem = (option: (typeof urgencyOptions)[0]) => {
    const IconComponent = option.icon
    return (
      <SelectItem key={option.value} value={option.value} className="focus:bg-muted/50">
        <div className="flex items-center space-x-3 py-1">
          <div className={`${option.color} flex-shrink-0`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-medium ${option.color} text-sm`}>{option.label}</div>
            <div className="text-xs text-muted-foreground truncate">
              {option.description} • {option.timeframe}
            </div>
          </div>
        </div>
      </SelectItem>
    )
  }

  return (
    <TooltipProvider>
      <Width width={width}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={name}>
              {label}
              {required && (
                <span className="required text-red-500">
                  * <span className="sr-only">(required)</span>
                </span>
              )}
            </Label>

            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">¿Cómo elegir el nivel de urgencia?</p>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>Emergencia:</strong> Riesgo inmediato de seguridad
                    </p>
                    <p>
                      <strong>Alta:</strong> Afecta funciones esenciales del hogar
                    </p>
                    <p>
                      <strong>Media:</strong> Problema molesto pero no crítico
                    </p>
                    <p>
                      <strong>Baja:</strong> Mejoras o mantenimiento opcional
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {control ? (
            <Controller
              name={name}
              control={control}
              defaultValue={defaultValue || ''}
              rules={{
                required: required
                  ? 'Por favor selecciona el nivel de urgencia. Esto nos ayuda a priorizar tu solicitud correctamente'
                  : false,
              }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedValue(value)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona el nivel de urgencia">
                      {field.value && (
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const selectedOption = getOptionByValue(field.value)
                            if (!selectedOption) return null
                            const IconComponent = selectedOption.icon
                            return (
                              <>
                                <div className={selectedOption.color}>
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <span className={`font-medium ${selectedOption.color}`}>
                                  {selectedOption.label}
                                </span>
                                <span className="text-muted-foreground text-sm hidden sm:inline">
                                  • {selectedOption.timeframe}
                                </span>
                              </>
                            )
                          })()}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-md">
                    {urgencyOptions.map(renderSelectItem)}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <div>
              <input
                type="hidden"
                {...register(name, {
                  required: required
                    ? 'Por favor selecciona el nivel de urgencia. Esto nos ayuda a priorizar tu solicitud correctamente'
                    : false,
                })}
              />
              <Select defaultValue={defaultValue} onValueChange={setSelectedValue}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el nivel de urgencia" />
                </SelectTrigger>
                <SelectContent className="max-w-md">
                  {urgencyOptions.map(renderSelectItem)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Información adicional sobre la opción seleccionada */}
          {selectedValue && (
            <div
              className={`p-3 rounded-lg border ${getOptionByValue(selectedValue)?.bgColor} ${getOptionByValue(selectedValue)?.borderColor}`}
            >
              <div className="flex items-start gap-2">
                <Info
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getOptionByValue(selectedValue)?.color}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Tiempo de respuesta: {getOptionByValue(selectedValue)?.timeframe}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ejemplos: {getOptionByValue(selectedValue)?.examples}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {errors[name] && <Error message={errors[name]?.message as string} />}
      </Width>
    </TooltipProvider>
  )
}
