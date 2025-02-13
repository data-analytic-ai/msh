"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useForm, FormProvider, useWatch } from "react-hook-form"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Media } from "@/components/Media"
import RichText from "@/components/RichText"
import { ArrowRight } from "lucide-react"

export type FormField = {
  blockType: "textarea" | "email" | "number" | "text" | "select" | "state" | "radio"
  name: string
  label: string
  required?: boolean
  options?: { label: string; value: string; id: string }[]
}

type FormType = {
  id: string
  title: string
  fields: FormField[]
  submitButtonLabel?: string
  confirmationType?: string
  confirmationMessage?: { root?: { children?: { children?: { text?: string }[] }[] } }
}

type HeroSectionProps = {
  richText?: any
  media?: any
  form?: FormType
}

export const HeroSection: React.FC<HeroSectionProps> = ({ richText, media, form }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [formState, setFormState] = useState<"initial" | "submitted" | "accepted">("initial")
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const methods = useForm({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: useLocalStorage("formData", {}),
  })

  const {
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    control,
    setValue,
    getValues,
    watch,
  } = methods

  useEffect(() => {
    const subscription = methods.watch(() => {
      localStorage.setItem("formData", JSON.stringify(getValues()))
    })
    return () => subscription.unsubscribe()
  }, [methods, getValues])

  const cleanedFields = useMemo(
    () =>
      form?.fields
        ?.filter((field) => field.blockType)
        ?.map((field) => ({
          ...field,
          name: field.name.trim(),
        })) || [],
    [form?.fields],
  )

  const steps = useMemo(() => (cleanedFields.length > 0 ? Math.ceil(cleanedFields.length / 3) : 1), [cleanedFields])
  const currentFields = useMemo(() => cleanedFields.slice(step * 3, step * 3 + 3), [cleanedFields, step])

  const isStepValid = useCallback(
    async (stepFields: FormField[]) => {
      const fieldNames = stepFields.map((f) => f.name)
      const result = await trigger(fieldNames)
      return result
    },
    [trigger],
  )

  const onSubmit = async (formData: Record<string, any>) => {
    if (!form?.id) {
      setError("No form ID provided")
      return
    }

    if (!isValid) {
      setError("Por favor, complete todos los campos requeridos")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const submissionData = Object.entries(formData).map(([field, value]) => ({
        field,
        value,
      }))

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: form.id,
          submissionData,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json()
        throw new Error(errBody?.errors?.[0]?.message || "Submission error")
      }

      setFormState("submitted")
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = () => {
    setFormState("accepted")
    setTimeout(() => {
      setFormState("initial")
      setStep(0)
      methods.reset()
    }, 3000)
  }

  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setTouchedFields((prev) => new Set([...prev, fieldName]))
      trigger(fieldName)
    },
    [trigger],
  )

  const handleNext = useCallback(async () => {
    const newTouchedFields = new Set(touchedFields)
    currentFields.forEach((field) => {
      newTouchedFields.add(field.name)
    })
    setTouchedFields(newTouchedFields)

    const stepValid = await isStepValid(currentFields)
    if (stepValid) {
      setStep((prev) => Math.min(prev + 1, steps - 1))
    }
  }, [currentFields, isStepValid, touchedFields, steps])

  const renderField = useCallback(
    (field: FormField) => {
      const error = errors[field.name]
      const isTouched = touchedFields.has(field.name)
      const baseInputStyles =
        "w-full mt-1 rounded-lg border border-white/20 bg-[#072640]/80 text-white placeholder:text-gray-400 p-3"

      const validationRules = {
        required: field.required
          ? {
              value: true,
              message: `${field.label} es requerido`,
            }
          : false,
        validate: (value: any) => {
          if (!isTouched) return true
          if (field.required && (!value || value.toString().trim() === "")) {
            return `${field.label} no puede estar vacío`
          }
          if (field.blockType === "email" && value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            return "Email inválido"
          }
          return true
        },
      }

      const ControlledInput = ({ inputType, ...props }: { inputType: string; [key: string]: any }) => {
        const value = useWatch({
          control,
          name: field.name,
          defaultValue: "",
        })

        return (
          <Input
            type={inputType}
            {...props}
            value={value}
            onChange={(e) => {
              setValue(field.name, e.target.value, { shouldValidate: touchedFields.has(field.name) })
            }}
            onBlur={() => handleFieldBlur(field.name)}
          />
        )
      }

      const ControlledTextarea = (props: any) => {
        const value = useWatch({
          control,
          name: field.name,
          defaultValue: "",
        })

        return (
          <Textarea
            {...props}
            value={value}
            onChange={(e) => {
              setValue(field.name, e.target.value, { shouldValidate: touchedFields.has(field.name) })
            }}
            onBlur={() => handleFieldBlur(field.name)}
          />
        )
      }

      const ControlledSelect = (props: any) => {
        const value = useWatch({
          control,
          name: field.name,
          defaultValue: "",
        })

        return (
          <select
            {...props}
            value={value}
            onChange={(e) => {
              setValue(field.name, e.target.value, { shouldValidate: touchedFields.has(field.name) })
            }}
            onBlur={() => handleFieldBlur(field.name)}
          />
        )
      }

      let fieldComponent

      switch (field.blockType) {
        case "textarea":
          fieldComponent = (
            <ControlledTextarea
              {...methods.register(field.name, validationRules)}
              className={`${baseInputStyles} ${
                error && isTouched ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-[#F09C39]"
              }`}
              placeholder={`Ingrese ${field.label}`}
            />
          )
          break
        case "email":
          fieldComponent = (
            <ControlledInput
              inputType="email"
              {...methods.register(field.name, validationRules)}
              className={`${baseInputStyles} ${
                error && isTouched ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-[#F09C39]"
              }`}
              placeholder="ejemplo@correo.com"
            />
          )
          break
        case "number":
          fieldComponent = (
            <ControlledInput
              inputType="number"
              {...methods.register(field.name, validationRules)}
              className={`${baseInputStyles} ${
                error && isTouched ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-[#F09C39]"
              }`}
              placeholder={`Ingrese ${field.label}`}
            />
          )
          break
        case "select":
          fieldComponent = (
            <ControlledSelect
              {...methods.register(field.name, validationRules)}
              className={`${baseInputStyles} ${
                error && isTouched ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-[#F09C39]"
              }`}
            >
              <option value="" disabled>
                Seleccione {field.label}
              </option>
              {field.options?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </ControlledSelect>
          )
          break
        case "state":
          fieldComponent = field.options ? (
            <ControlledSelect
              {...methods.register(field.name, validationRules)}
              className={`${baseInputStyles} ${
                error && isTouched ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-[#F09C39]"
              }`}
            >
              <option value="" disabled>
                Seleccione estado
              </option>
              {field.options.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </ControlledSelect>
          ) : (
            <ControlledInput
              inputType="text"
              {...methods.register(field.name, validationRules)}
              className={`${baseInputStyles} ${
                error && isTouched ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-[#F09C39]"
              }`}
              placeholder="Ingrese dirección"
            />
          )
          break
        default:
          fieldComponent = (
            <ControlledInput
              inputType="text"
              {...methods.register(field.name, validationRules)}
              className={`${baseInputStyles} ${
                error && isTouched ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-[#F09C39]"
              }`}
              placeholder={`Ingrese ${field.label}`}
            />
          )
      }

      return (
        <div className="space-y-1">
          {fieldComponent}
          {error && isTouched && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
      )
    },
    [errors, setValue, control, methods, touchedFields, handleFieldBlur],
  )

  const handleBack = useCallback(() => {
    setStep((prevStep) => Math.max(prevStep - 1, 0))
  }, [])

  useEffect(() => {
    const validateStep = async () => {
      await isStepValid(currentFields)
    }
    validateStep()
  }, [currentFields, isStepValid])

  const FieldComponent = React.memo(({ field }: { field: FormField }) => {
    return (
      <div className="mb-4" key={field.name}>
        <Label htmlFor={field.name} className="text-white">
          {field.label} {field.required && " *"}
        </Label>
        {renderField(field)}
      </div>
    )
  })

  const ProgressBar = React.memo(() => (
    <div className="mb-4 flex justify-between">
      {Array.from({ length: steps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-full ${index <= step ? "bg-[#F09C39]" : "bg-gray-300"} ${index < steps - 1 ? "mr-1" : ""}`}
        />
      ))}
    </div>
  ))

  const isNextButtonDisabled = useMemo(() => {
    return currentFields.some((field) => {
      if (!field.required) return false
      const value = watch(field.name)
      const hasError = errors[field.name]
      return !value || value.toString().trim() === "" || hasError
    })
  }, [currentFields, watch, errors])

  return (
    <section className="relative min-h-[600px] bg-[#072640]">
      {media && (
        <div className="absolute inset-0">
          <Media fill imgClassName="w-full h-full object-cover" resource={media} priority />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 to-transparent" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          {richText && (
            <RichText
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              data={richText}
              enableGutter={false}
            />
          )}
        </div>

        {formState === "initial" && form && (
          <div className="w-full md:w-[450px] bg-[#072640] rounded-lg shadow-xl p-6">
            <ProgressBar />
            <h2 className="text-2xl font-semibold mb-6 text-white">
              {step === 0 && "Información Personal"}
              {step === 1 && "Ubicación del Proyecto"}
              {step === 2 && "Detalles del Servicio"}
              {step === 3 && "¡Último Paso!"}
            </h2>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {currentFields?.map((field) => (
                  <FieldComponent key={field.name} field={field} />
                ))}

                {Object.keys(errors).length > 0 && touchedFields.size > 0 && (
                  <p className="text-red-500 text-sm mt-2">Por favor, corrija los errores antes de continuar.</p>
                )}

                {error && <p className="text-[#F09C39] my-2">{error}</p>}

                <div className="flex justify-between mt-4">
                  {step > 0 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      className="border border-white/20 bg-transparent text-white hover:bg-white/5"
                    >
                      Anterior
                    </Button>
                  )}
                  {step < steps - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isNextButtonDisabled}
                      className={`bg-[#d99139] text-white px-6 py-2 rounded-lg flex items-center gap-2 ${
                        isNextButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#F09C39]/90"
                      }`}
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full bg-[#F09C39] text-white hover:bg-[#F09C39]/90"
                      disabled={isLoading || !isValid}
                    >
                      {isLoading ? "Enviando..." : form?.submitButtonLabel || "Enviar"}
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        )}
        {formState === "submitted" && form && (
          <div className="w-full md:w-[450px] bg-white/5 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <div className="space-y-6 text-white">
              <div className="rounded-lg border border-white/20 bg-[#072640] p-6">
                <h3 className="text-xl font-semibold mb-4">¡Gracias por tu interés!</h3>
                <p className="text-gray-300 mb-6">
                  Un experto se comunicará contigo en menos de 24 horas para brindarte una cotización personalizada.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-[#F09C39]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Cotización sin compromiso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-[#F09C39]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Atención personalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-[#F09C39]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Garantía en todos los trabajos</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accept-communications"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  {...methods.register("acceptCommunications")}
                />
                <label htmlFor="accept-communications" className="text-sm text-gray-300">
                  Acepto recibir comunicaciones sobre mi cotización
                </label>
              </div>
              <Button onClick={handleAccept} className="w-full bg-[#F09C39] text-white hover:bg-[#F09C39]/90">
                Acepto
              </Button>
            </div>
          </div>
        )}
        {formState === "accepted" && form && (
          <div className="w-full md:w-[450px] bg-white/5 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <p className="text-white text-center">Gracias por aceptar. El formulario se reiniciará en breve.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection

