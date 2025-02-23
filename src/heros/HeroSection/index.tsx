"use client";

import React, { useState, useMemo, JSX } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import { State } from "@/blocks/Form/State";

export type FormField = {
  blockType: "textarea" | "email" | "number" | "text" | "select" | "state" | "radio";
  name: string;
  label: string;
  required?: boolean;
  options?: { label: string; value: string; id: string }[];
};

export type FormType = {
  id: string;
  title: string;
  fields: FormField[];
  submitButtonLabel?: string;
  confirmationType?: string;
  confirmationMessage?: string;
};

export type HeroSectionProps = {
  richText?: any;
  media?: any;
  form?: FormType;
};

const HeroSection: React.FC<HeroSectionProps> = ({ richText, media, form }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const methods = useForm();
  const { handleSubmit, control, trigger, formState: { errors, isValid } } = methods;

  // Procesa los campos directamente desde la base de datos
  const fields = useMemo(() => (form?.fields?.map(f => ({ ...f, name: f.name.trim() })) || []), [form?.fields]);

  // Dividimos los campos en pasos (3 por paso)
  const totalSteps = Math.ceil(fields.length / 3) || 1;
  const currentFields = useMemo(() => fields.slice(step * 3, (step + 1) * 3), [fields, step]);

  // Reglas de validación para cada campo (se aplican si el campo es requerido)
  const getValidationRules = (field: FormField) => ({
    // required: field.required ? `${field.label} is required` : false,
    validate: (value: any) => {
      if (field.required && (!value || value.toString().trim() === "")) {
        return `${field.label} is empty`;
      }
      if (field.blockType === "email" && value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return "invalid email address";
      }
      return true;
    },
  });

  const baseStyles = "w-full mt-1 rounded-lg border border-white/20 bg-[#072640]/80 text-white placeholder:text-gray-400 p-3";

  // Objeto/diccionario que mapea cada blockType a su renderizador
  const fieldRenderers: Record<string, (field: FormField) => JSX.Element> = {
    textarea: (field) => (
      <Controller
        name={field.name}
        control={control}
        rules={getValidationRules(field)}
        defaultValue=""
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <Textarea
            onChange={onChange}
            onBlur={onBlur}
            value={value || ""}
            ref={ref}
            className={baseStyles}
            placeholder={`Ingrese ${field.label}`}
          />
        )}
      />
    ),
    email: (field) => (
      <Controller
        name={field.name}
        control={control}
        rules={getValidationRules(field)}
        defaultValue=""
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <Input
            type="email"
            onChange={onChange}
            onBlur={onBlur}
            value={value || ""}
            ref={ref}
            className={baseStyles}
            placeholder="example@email.com"
          />
        )}
      />
    ),
    number: (field) => (
      <Controller
        name={field.name}
        control={control}
        rules={getValidationRules(field)}
        defaultValue=""
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <Input
            type="number"
            onChange={onChange}
            onBlur={onBlur}
            value={value || ""}
            ref={ref}
            className={baseStyles}
            placeholder={`Insert ${field.label}`}
          />
        )}
      />
    ),
    text: (field) => (
      <Controller
        name={field.name}
        control={control}
        rules={getValidationRules(field)}
        defaultValue=""
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <Input
            type="text"
            onChange={onChange}
            onBlur={onBlur}
            value={value || ""}
            ref={ref}
            className={baseStyles}
            placeholder={`Insert ${field.label}`}
          />
        )}
      />
    ),
    select: (field) => (
      <Controller
        name={field.name}
        control={control}
        rules={getValidationRules(field)}
        defaultValue=""
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <select
            onChange={onChange}
            onBlur={onBlur}
            value={value || ""}
            ref={ref}
            className={baseStyles}
          >
            <option value="" disabled>
              Seleccione {field.label}
            </option>
            {field.options?.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
    ),
    state: (field) => (
      <Controller
        name={field.name}
        control={control}
        
        rules={getValidationRules(field)}
        defaultValue="select state"
        render={({ field: { onChange, onBlur, value } }) => (
          <State
            control={control}
            errors={errors}
            blockType={'state'}
            name={field.name}
            required={field.required}
            key={field.name}
            label="State"
          />
        )}
      />
    ),
    radio: (field) => (
      <Controller
        name={field.name}
        control={control}
        rules={getValidationRules(field)}
        defaultValue=""
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <div ref={ref}>
            {field.options?.map(option => (
              <label key={option.id} className="mr-4 text-white">
                <input
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="mr-1"
                />
                {option.label}
              </label>
            ))}
          </div>
        )}
      />
    ),
  };

  // Componente para renderizar un campo completo (label, input y error)
  const FormFieldWrapper = ({ field }: { field: FormField }) => (
    <div key={field.name} className="mb-4">
      <Label htmlFor={field.name} className="text-white">
        {field.label} {field.required && " *"}
      </Label>
      {fieldRenderers[field.blockType]
        ? fieldRenderers[field.blockType]?.(field)
        : fieldRenderers.text ? fieldRenderers.text(field) : null}
      {errors[field.name] && (
        <p className="text-red-500 text-sm mt-1">{(errors[field.name] as any)?.message}</p>
      )}
    </div>
  );
  // Funciones para navegar entre pasos
  const handleNext = async () => {
    const fieldNames = currentFields.map(f => f.name);
    const valid = await trigger(fieldNames);
    if (valid) setStep(prev => Math.min(prev + 1, totalSteps - 1));
  };
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  // Envío final del formulario, estructurando la data para Payload
  const onSubmitHandler = async (data: Record<string, any>) => {
    if (!form?.id) return;
    setIsLoading(true);
    try {
      const submissionData = Object.entries(data).map(([field, value]) => ({ field, value }));
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: form.id, submissionData }),
      });
      if (!res.ok) throw new Error("Submission error");
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  // Barra de progreso (steppers)
  const ProgressBar = () => (
    <div className="mb-4 flex">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 flex-1 ${index <= step ? "bg-[#F09C39]" : "bg-gray-300"} ${index < totalSteps - 1 ? "mr-1" : ""}`}
        />
      ))}
    </div>
  );
  return (
    <section className="relative min-h-[600px] bg-[#072640]">
      {media && (
        <div className="absolute inset-0">
          <Media  imgClassName="w-full h-full object-cover" resource={media} priority />
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
        
        {form && !submitted && (
          <div className="w-full md:w-[450px] bg-[#072640] rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-white">{form.title}</h2>
            <ProgressBar />
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmitHandler)}>
                {currentFields.map(field => (
                  <FormFieldWrapper key={field.name} field={field} />
                ))}
                <div className="flex justify-between mt-4">
                  {step > 0 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      className="border border-white/20 bg-transparent text-white hover:bg-white/5"
                    >
                      Back
                    </Button>
                  )}
                  {step < totalSteps - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#d99139] text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      
                      disabled={isLoading}
                      className="bg-[#F09C39] text-white hover:bg-[#F09C39]/90"
                    >
                      {isLoading ? "Sending..." : form.submitButtonLabel || "Send"}
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        )}

        {/* Mensaje de confirmación si ya se envió el formulario */}
        {submitted && form && (
          <div className="w-full md:w-[450px] bg-white/95 backdrop-blur rounded-lg shadow-xl p-6">
            {form.confirmationType === "message" ? (
              <p className="text-gray-700 mt-4">{form.confirmationMessage}</p>
            ) : (
              <p className="text-gray-700 mt-4">
                Thank you! Your submission has been received.
              </p>
            )}
          </div>
        )}
        {error && (
          <div className="w-full md:w-[450px] bg-red-100 text-red-600 rounded-lg p-4 mt-4">
            {error}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
