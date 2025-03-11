'use client'
import type { Form as FormType, FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState, useMemo } from 'react'
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

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  // Usamos buildInitialFormState para obtener los defaultValues
  const formMethods = useForm({
    defaultValues: buildInitialFormState(formFromProps.fields),
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
  const fieldsPerStep = 3
  const totalSteps = Math.ceil(allFields.length / fieldsPerStep)
  const currentFields = useMemo(
    () => allFields.slice(step * fieldsPerStep, (step + 1) * fieldsPerStep),
    [allFields, step],
  )

  // Función para retroceder
  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0))
  }, [])

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
    setStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }, [currentFields, trigger, totalSteps, formMethods])

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

      // Protección adicional contra envíos automáticos
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
    ],
  )

  // --- RENDERIZADO DE CAMPOS ---
  const renderField = (field: FormFieldType) => {
    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
    if (Field) {
      // Aplicamos clases adicionales para campos opcionales
      const isOptionalField = 'required' in field && !field.required

      return (
        <div
          className={`mb-6 last:mb-0 ${isOptionalField ? 'optional-field' : ''}`}
          key={field.uniqueName}
          // Añadimos data-attributes para depuración
          data-field-type={field.blockType}
          data-is-optional={isOptionalField}
        >
          <Field
            form={formFromProps}
            {...field}
            {...formMethods}
            control={control}
            errors={errors}
            register={register}
          />
        </div>
      )
    }
    return null
  }

  const renderCurrentFields = () => (
    <div className="mb-4 last:mb-0">
      {currentFields.map((field, index) => renderField(field as FormFieldType))}
    </div>
  )

  // --- BARRA DE PROGRESO ---
  const ProgressBar = () => (
    <div className="mb-8 flex">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 flex-1 ${index <= step ? 'bg-primary' : 'bg-gray-300'} ${index < totalSteps - 1 ? 'mr-1' : ''}`}
        />
      ))}
    </div>
  )

  return (
    <div className="container lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="p-4 lg:p-6 border bg-background dark:bg-card/90 backdrop-blur-sm rounded-lg shadow-lg border-border rounded-[0.8rem] ">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <>
              <ProgressBar />
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
                  <div className="bg-yellow-100 dark:bg-yellow-900 py-1 px-2 mb-4 text-sm text-yellow-900 dark:text-yellow-100">
                    Last step
                  </div>
                )}

                {/* Wrapper con altura mínima para evitar saltos de layout */}
                <div className="min-h-[200px]">{renderCurrentFields()}</div>

                <div className="flex justify-between mt-8">
                  {step > 0 && (
                    <Button type="button" onClick={handleBack} variant="secondary">
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
                    >
                      Next
                    </Button>
                  ) : (
                    <div className="relative z-10">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        variant="secondary"
                        className="relative z-10"
                      >
                        {isLoading ? 'Sending...' : submitButtonLabel}
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
