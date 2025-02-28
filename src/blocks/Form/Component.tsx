'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
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
    
  })
  const {
    control,
    formState: { errors, isValid },
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
  const allFields = useMemo(() => formFromProps.fields.map((f, index) => ({
    ...f,
    uniqueName: f.id || `${f.name}-${index}`
  })), [formFromProps.fields])
  
  
  // Definimos 3 campos por pasos
  const fieldsPerStep = 3;
  const totalSteps = Math.ceil(allFields.length / fieldsPerStep);
  const currentFields = useMemo(() => allFields.slice(step * fieldsPerStep, (step + 1) * fieldsPerStep), [allFields, step])

  // Función para navegar: valida los campos del paso actual antes de avanzar
  const handleNext = async () => {
    const fieldNames   = currentFields.map(f => f.name)
    const valid = await trigger(fieldNames as any)
    if (valid) setStep(prev => Math.min(prev + 1, totalSteps - 1))
  }
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0))

  // --- VALIDACIÓN GENERAL ---
  // En este ejemplo la validación se realiza dentro de cada Field, usando el mapeo de "fields" importado.
  // Por ello, en este componente multipasos, reutilizamos el mapeo original:
  const renderField = (field: any, index: number) => {
    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
    if (Field) {
      return (
        <div className="mb-6 last:mb-0" key={field.uniqueName}>
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
      {currentFields.map((field, index) => renderField(field, index))}
    </div>
  )

  // --- ENVÍO DEL FORMULARIO ---
  const onSubmit = useCallback(
    (data: Data) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)
        const dataToSend = allFields.map(field => ({
          field: field.name, // o field.originalName, según convenga
          value: data[field.name] || '',
        }))

        // Delay en el indicador de carga
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)
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
        } catch (err) {
          console.warn(err)
          clearTimeout(loadingTimerID)
          setIsLoading(false)
          setError({ message: 'Something went wrong.' })
        }
      }
      void submitForm()
    },
    [router, formID, redirect, confirmationType]
  )

  // --- BARRA DE PROGRESO ---
  const ProgressBar = () => (
    <div className="mb-8 flex">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 flex-1 ${index <= step ? "bg-primary" : "bg-gray-300"} ${index < totalSteps - 1 ? "mr-1" : ""}`}
        />
      ))}
    </div>
  )

  return (
    <div className="container lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="p-4 lg:p-6 border border-border rounded-[0.8rem]">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <>
              <ProgressBar />
              <form id={formID} onSubmit={handleSubmit(onSubmit) } >
                {renderCurrentFields()}
                <div className="flex justify-between mt-4">
                  {step > 0 && (
                    <Button type="button" onClick={handleBack} variant="secondary">
                      Back
                    </Button>
                  )}
                  {step < totalSteps - 1 ? (
                    <Button type="button" onClick={handleNext} variant="secondary">
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading || !isValid} variant="secondary">
                      {isLoading ? "Sending..." : submitButtonLabel}
                    </Button>
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
