'use client'
import type { Form as FormType, FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { buildInitialFormState } from './buildInitialFormState'
import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

export type Value = unknown

export interface Property {
  [key: string]: Value
}

export interface Data {
  [key: string]: Property | Property[] | Value
}

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
}

export type FormFieldType = FormFieldBlock & {
  uniqueName?: string
  blockType: string
}

// New type for service request mode
export type ServiceRequestFormProps = {
  mode?: 'default' | 'serviceRequest'
  onServiceRequestSubmit?: (data: Data) => Promise<boolean>
  customSubmitLabel?: string
  hideProgressBar?: boolean
  initialValues?: Record<string, any>
  onStepChange?: (currentStep: number, totalSteps: number, isLastStep: boolean) => void
}

/**
 * FormBlock - Dynamic form component with PayloadCMS integration
 *
 * A versatile form component that can work in default mode for standard form submissions
 * or in service request mode for integrating with the service request flow.
 *
 * @param {FormBlockType & ServiceRequestFormProps} props - Form configuration and mode settings
 * @returns {JSX.Element} - Rendered form component
 */
export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType &
    ServiceRequestFormProps
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    mode = 'default',
    onServiceRequestSubmit,
    customSubmitLabel,
    hideProgressBar = false,
    initialValues = {},
    onStepChange,
  } = props

  // Combine buildInitialFormState with provided initialValues
  const defaultFormState = buildInitialFormState(formFromProps.fields)
  const mergedInitialValues = useMemo(
    () => ({ ...defaultFormState, ...initialValues }),
    [defaultFormState, initialValues],
  )

  // Usamos buildInitialFormState para obtener los defaultValues
  const formMethods = useForm({
    defaultValues: mergedInitialValues,
    shouldUnregister: false,
    mode: 'onChange',
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    trigger,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const [step, setStep] = useState(0)
  const router = useRouter()

  // Use ref to track last reset values to prevent infinite loops
  const lastResetValues = useRef<string>('')

  // Use useEffect to monitor changes to initialValues and reset form when they change
  useEffect(() => {
    const currentValuesString = JSON.stringify(initialValues)

    // Only reset if we have meaningful initial values, form is not loading/submitted, and values actually changed
    if (
      Object.keys(initialValues).length > 0 &&
      !isLoading &&
      !hasSubmitted &&
      currentValuesString !== lastResetValues.current
    ) {
      console.log('Resetting form with new initial values:', initialValues)
      formMethods.reset(mergedInitialValues, { keepDefaultValues: false })
      lastResetValues.current = currentValuesString
    }
  }, [initialValues, isLoading, hasSubmitted, formMethods, mergedInitialValues])

  // --- LÓGICA MULTIPASOS ---
  // Obtenemos todos los campos (se asume que vienen de la base de datos)
  const allFields = useMemo(
    () =>
      formFromProps.fields.map((f, index) => {
        // Crear un identificador único para cada campo
        const fieldName = 'name' in f ? f.name : f.blockType
        const fieldId = 'id' in f ? f.id : undefined

        return {
          ...f,
          uniqueName: fieldId || `${fieldName}-${index}`,
        }
      }),
    [formFromProps.fields],
  )

  // Definimos 3 campos por pasos
  const fieldsPerStep = 4
  const totalSteps = Math.ceil(allFields.length / fieldsPerStep)
  const currentFields = useMemo(
    () => allFields.slice(step * fieldsPerStep, (step + 1) * fieldsPerStep),
    [allFields, step],
  )

  // Notify parent about initial step
  useEffect(() => {
    if (onStepChange && totalSteps > 0) {
      onStepChange(step, totalSteps, step === totalSteps - 1)
    }
  }, [onStepChange, step, totalSteps])

  // Función para retroceder
  const handleBack = useCallback(() => {
    const newStep = Math.max(step - 1, 0)
    setStep(newStep)

    // Notify parent about step change
    if (onStepChange) {
      onStepChange(newStep, totalSteps, newStep === totalSteps - 1)
    }
  }, [step, totalSteps, onStepChange])

  // Función para avanzar - memoizada con useCallback
  const handleNext = useCallback(async () => {
    // Filtramos solo los campos que tienen 'name' y son requeridos para validación
    const requiredFields = currentFields.filter((f) => 'name' in f && 'required' in f && f.required)

    const fieldNames = requiredFields.map((f) => ('name' in f ? f.name : undefined)).filter(Boolean)

    // Si hay campos requeridos, validamos antes de avanzar
    if (fieldNames.length > 0) {
      // Validación manual para garantizar que la función trigger funcione
      let hasEmptyRequiredFields = false

      // Verificamos si hay campos vacíos antes de usar trigger
      for (const fieldName of fieldNames) {
        const value = formMethods.getValues(fieldName as any)
        if (!value) {
          hasEmptyRequiredFields = true
          formMethods.setError(fieldName as any, {
            type: 'required',
            message: 'Este campo es obligatorio',
          })
        }
      }

      if (hasEmptyRequiredFields) {
        return // Si hay campos vacíos, no avanzamos
      }

      // Validación adicional con trigger para otras reglas
      const valid = await trigger(fieldNames as any)
      if (!valid) {
        return // Si la validación falla, no avanzamos
      }
    }

    // Avanzamos al siguiente paso
    const newStep = Math.min(step + 1, totalSteps - 1)
    setStep(newStep)

    // Notify parent about step change
    if (onStepChange) {
      onStepChange(newStep, totalSteps, newStep === totalSteps - 1)
    }
  }, [currentFields, trigger, totalSteps, formMethods, step, onStepChange])

  // Manejador de envío del formulario
  const onSubmit = useCallback(
    (data: Data) => {
      // Si no estamos en el último paso, avanzamos al siguiente
      if (step < totalSteps - 1) {
        handleNext()
        return
      }

      // Evitamos múltiples envíos
      if (isLoading || hasSubmitted) return

      // Validación final de todos los campos requeridos
      const allRequiredFields = allFields
        .filter((f) => 'name' in f && 'required' in f && f.required)
        .map((f) => ('name' in f ? f.name : undefined))
        .filter(Boolean)

      let hasEmptyFields = false

      // Verificamos si hay campos obligatorios vacíos
      for (const fieldName of allRequiredFields) {
        const value = formMethods.getValues(fieldName as any)
        if (!value) {
          hasEmptyFields = true
          formMethods.setError(fieldName as any, {
            type: 'required',
            message: 'Este campo es obligatorio',
          })
        }
      }

      if (hasEmptyFields) {
        return // No continuamos con el envío si hay campos vacíos
      }

      // Handle service request mode
      if (mode === 'serviceRequest' && onServiceRequestSubmit) {
        setIsLoading(true)
        onServiceRequestSubmit(data)
          .then((success) => {
            setIsLoading(false)
            if (success) {
              setHasSubmitted(true)
            }
          })
          .catch((error) => {
            console.error('Service request submission error:', error)
            setIsLoading(false)
            setError({ message: 'Failed to submit service request' })
          })
        return
      }

      // Protección adicional contra envíos automáticos - DEFAULT MODE
      const procesarEnvio = () => {
        setError(undefined)
        setIsLoading(true)

        const dataToSend = allFields
          .filter((field) => 'name' in field)
          .map((field) => ({
            field: 'name' in field ? field.name : '',
            value: 'name' in field ? data[field.name] || '' : '',
          }))

        fetch(`${getClientSideURL()}/api/form-submissions`, {
          body: JSON.stringify({
            form: formID,
            submissionData: dataToSend,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })
          .then(async (req) => {
            const res = await req.json()
            setIsLoading(false)

            if (req.status >= 400) {
              setError({
                message: res.errors?.[0]?.message || 'Internal Server Error',
                status: res.status,
              })
              return
            }

            setHasSubmitted(true)

            if (confirmationType === 'redirect' && redirect && redirect.url) {
              router.push(redirect.url)
            }
          })
          .catch((err) => {
            console.warn(err)
            setIsLoading(false)
            setError({ message: 'Something went wrong.' })
          })
      }

      // Usamos requestAnimationFrame para asegurar que se ejecute en el momento adecuado
      window.requestAnimationFrame(() => {
        procesarEnvio()
      })
    },
    [
      allFields,
      formID,
      confirmationType,
      redirect,
      router,
      isLoading,
      hasSubmitted,
      step,
      totalSteps,
      handleNext,
      formMethods,
      mode,
      onServiceRequestSubmit,
    ],
  )

  // --- RENDERIZADO DE CAMPOS ---
  const renderField = (field: FormFieldType) => {
    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
    if (Field) {
      // Aplicamos clases adicionales para campos opcionales
      const isOptionalField = 'required' in field && !field.required

      // Determine if field should span full width
      const shouldSpanFullWidth = [
        'textarea',
        'message',
        'location',
        'imageUpload',
        'urgencyLevel',
        'serviceRequestConfirmation',
      ].includes(field.blockType)

      return (
        <div
          className={`
            ${isOptionalField ? 'optional-field' : ''} 
            ${shouldSpanFullWidth ? 'col-span-full' : ''}
          `}
          key={field.uniqueName}
          // Añadimos data-attributes para depuración
          data-field-type={field.blockType}
          data-is-optional={isOptionalField}
          data-full-width={shouldSpanFullWidth}
        >
          <Field
            form={formFromProps}
            {...field}
            {...formMethods}
            control={control}
            errors={errors}
            register={register}
            setValue={formMethods.setValue}
          />
        </div>
      )
    }
    return null
  }

  // Check if we should show the service request confirmation field
  const shouldShowConfirmation = () => {
    // Show confirmation only after description field and in the final steps
    const hasDescription = currentFields.some((f) => 'name' in f && f.name === 'description')
    const hasConfirmationField = currentFields.some((f) => f.blockType === 'checkbox')

    // Show if this step has the description field or if we're past it
    return hasDescription || hasConfirmationField || step >= 1
  }

  const renderCurrentFields = () => (
    <div
      className="
      grid gap-3 sm:gap-4 lg:gap-6
      grid-cols-1 
      xs:grid-cols-1 
      sm:grid-cols-1 
      md:grid-cols-2 
      lg:grid-cols-2 
      xl:grid-cols-2
      2xl:grid-cols-2
      mb-4 last:mb-0
      auto-rows-min
    "
    >
      {currentFields.map((field, index) => renderField(field as FormFieldType))}
    </div>
  )

  // --- BARRA DE PROGRESO ---
  const ProgressBar = () => (
    <div className="mb-6 sm:mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {step + 1} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(((step + 1) / totalSteps) * 100)}%
        </span>
      </div>
      <div className="flex gap-1 sm:gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`
              h-2 sm:h-3 
              flex-1 
              rounded-full
              transition-all duration-300 ease-in-out
              ${index <= step ? 'bg-primary shadow-sm' : 'bg-muted border border-border'}
            `}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div
      className="
      w-full
      mx-auto
      px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12
      max-w-full xs:max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl
    "
    >
      {enableIntro && introContent && !hasSubmitted && (
        <RichText
          className="mb-4 xs:mb-6 sm:mb-8 lg:mb-12"
          data={introContent}
          enableGutter={false}
        />
      )}
      <div
        className="
        p-3 xs:p-4 sm:p-6 lg:p-8 
        border 
        bg-background 
        dark:bg-card/90 
        backdrop-blur-sm 
        rounded-lg 
        shadow-lg 
        border-border
        w-full
      "
      >
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <>
              {!hideProgressBar && totalSteps > 1 && <ProgressBar />}
              <form
                id={formID}
                onSubmit={(e) => {
                  // Prevención adicional para el envío involuntario
                  if (step < totalSteps - 1) {
                    e.preventDefault()
                    handleNext()
                    return false
                  }

                  return handleSubmit(onSubmit)(e)
                }}
                noValidate
                className={`relative ${step === totalSteps - 1 ? 'form-last-step' : ''}`}
              >
                {/* Marcador visual para depuración */}
                {step === totalSteps - 1 && (
                  <div className="bg-yellow-100 dark:bg-yellow-900 py-1 px-2 mb-4 text-sm text-yellow-900 dark:text-yellow-100 rounded">
                    Last step
                  </div>
                )}

                {/* Wrapper con altura mínima para evitar saltos de layout */}
                <div className="min-h-[200px] w-full">{renderCurrentFields()}</div>

                <div
                  className="
                  flex flex-col sm:flex-row 
                  justify-between 
                  items-center 
                  gap-4 
                  mt-6 sm:mt-8
                "
                >
                  {step > 0 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="secondary"
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Back
                    </Button>
                  )}
                  {step < totalSteps - 1 ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault() // Prevenir cualquier comportamiento por defecto
                        handleNext()
                      }}
                      variant="secondary"
                      className="w-full sm:w-auto order-1 sm:order-2 bg-primary hover:bg-primary/60"
                    >
                      Next
                    </Button>
                  ) : (
                    <div className="relative z-10 w-full sm:w-auto order-1 sm:order-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        variant="secondary"
                        className="relative z-10 w-full sm:w-auto"
                      >
                        {isLoading ? 'Sending...' : customSubmitLabel || submitButtonLabel}
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
