  'use client';

  import React, { useState } from 'react';
  import { useForm, FormProvider } from 'react-hook-form';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Textarea } from '@/components/ui/textarea';
  import { Label } from '@/components/ui/label';
  import { Media } from '@/components/Media';
  import RichText from '@/components/RichText';

  // Tipos para los campos y el formulario
  export type FormField = {
    blockType: 'textarea' | 'email' | 'number' | 'text' | 'select' | 'state';
    name: string;
    label: string;
    required?: boolean;
    options?: { label: string; value: string; id: string }[];
  };

  type FormType = {
    id: string;
    title: string;
    fields: FormField[];
    submitButtonLabel?: string;
    confirmationType?: string;
    confirmationMessage?: { root?: { children?: { children?: { text?: string }[] }[] } };
  };

  type HeroSectionProps = {
    richText?: any;
    media?: any;
    form?: FormType;
  };

  export const HeroSection: React.FC<HeroSectionProps> = ({ richText, media, form }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm();

    // **Filtramos los campos vacíos y limpiamos los nombres**
    const cleanedFields = form?.fields
      ?.filter((field) => field.blockType) // Filtra los campos vacíos
      ?.map((field) => ({
        ...field,
        name: field.name.trim(), // Elimina espacios innecesarios
      }));

    // **Lógica para enviar el formulario**
    const onSubmit = async (formData: Record<string, any>) => {
      if (!form?.id) {
        setError('No form ID provided');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const submissionData = Object.entries(formData).map(([field, value]) => ({
          field,
          value,
        }));

        const res = await fetch('/api/form-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form: form.id,
            submissionData,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody?.errors?.[0]?.message || 'Submission error');
        }

        setHasSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    // **Renderizado de cada campo con soporte para 'select' y 'state'**
    const renderField = (field: FormField) => {
      switch (field.blockType) {
        case 'textarea':
          return (
            <Textarea
              {...methods.register(field.name, { required: field.required })}
              placeholder={`Enter ${field.label}`}
              className="h-24"
            />
          );
        case 'email':
          return (
            <Input
              type="email"
              {...methods.register(field.name, { required: field.required })}
              placeholder="Enter your email"
            />
          );
        case 'number':
          return (
            <Input
              type="number"
              {...methods.register(field.name, { required: field.required })}
              placeholder={`Enter ${field.label}`}
            />
          );
        case 'select':
          return (
            <select
              {...methods.register(field.name, { required: field.required })}
              className="border p-2 rounded w-full"
              defaultValue="" // 🔹 Solución aquí
            >
              <option value="" disabled>
                Select {field.label}
              </option>
              {field.options?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        case 'state': 
          return field.options && field.options.length > 0 ? (
            <select
              {...methods.register(field.name, { required: field.required })}
              className="border p-2 rounded w-full"
              defaultValue="" // 🔹 Solución aquí
            >
              <option value="" disabled>
                Select a state
              </option>
              {field.options.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type="text"
              {...methods.register(field.name, { required: field.required })}
              placeholder="Enter your address"
            />
          );
        default:
          return (
            <Input
              type="text"
              {...methods.register(field.name, { required: field.required })}
              placeholder={`Enter ${field.label}`}
            />
          );
      }
    };
    

    return (
      <section className="relative min-h-[600px]">
        {/* Fondo dinámico con Payload Media */}
        {media && (
          <div className="absolute inset-0">
            <Media fill imgClassName="w-full h-full object-cover" resource={media} priority />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 to-transparent" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            {richText && (
              <RichText className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data={richText} enableGutter={false} />
            )}
          </div>

          {/* Formulario dinámico */}
          {form && !hasSubmitted && (
            <div className="w-full md:w-[450px] bg-white/95 backdrop-blur rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">{form.title}</h2>
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                  {cleanedFields?.map((field) => (
                    <div className="mb-4" key={field.name}>
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && ' *'}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}

                  {/* Mostrar error si existe */}
                  {error && <p className="text-red-500 my-2">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : form.submitButtonLabel || 'Submit'}
                  </Button>
                </form>
              </FormProvider>
            </div>
          )}

          {/* Mensaje de confirmación si ya se envió el formulario */}
          {form && hasSubmitted && form.confirmationType === 'message' && (
            <div className="w-full md:w-[450px] bg-white/95 backdrop-blur rounded-lg shadow-xl p-6">
              <p className="text-xl">
                {form.confirmationMessage?.root?.children?.[0]?.children?.[0]?.text ||
                  '¡Gracias por tu envío!'}
              </p>
            </div>
          )}
        </div>
      </section>
    );
  };
