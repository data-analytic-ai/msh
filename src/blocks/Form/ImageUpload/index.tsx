import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type {
  FieldErrorsImpl,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Info, HelpCircle } from 'lucide-react'
import { Media } from '@/components/Media'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Error } from '../Error'
import { Width } from '../Width'

/**
 * ImageUpload - Multi-image upload field for service requests
 *
 * A specialized image upload component that allows users to upload multiple
 * images for their service requests. Includes preview functionality and
 * integrates with the Media component system.
 *
 * @param {TextField & FormProps} props - Field configuration and form methods
 * @returns {JSX.Element} - Rendered image upload field
 */
export const ImageUpload: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
    setValue?: UseFormSetValue<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width, setValue }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [customError, setCustomError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Register the field without conflicting props
  const fieldRegistration = register(name, {
    required: required
      ? 'Por favor selecciona al menos una imagen para ayudarnos a entender mejor el problema'
      : false,
    validate: (value) => {
      if (selectedImages.length === 0 && required) {
        return 'Las imágenes nos ayudan a evaluar mejor tu solicitud y brindar un servicio más preciso'
      }
      return true
    },
  })

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    setCustomError('')

    const newFiles = Array.from(files).filter((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setCustomError('Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.)')
        return false
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setCustomError('Cada imagen debe ser menor a 10MB para una carga más rápida')
        return false
      }

      return true
    })

    if (newFiles.length === 0 && files.length > 0) {
      return // Error already set above
    }

    // Limit to 5 images total
    const currentTotal = selectedImages.length + newFiles.length
    if (currentTotal > 5) {
      setCustomError(
        'Máximo 5 imágenes permitidas. Esto nos ayuda a procesar tu solicitud más eficientemente',
      )
      return
    }

    // Create preview URLs
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))

    setSelectedImages((prev) => [...prev, ...newFiles])
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])

    // Update form value
    if (setValue) {
      setValue(name, [...selectedImages, ...newFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeImage = (index: number) => {
    // Revoke the preview URL to prevent memory leaks
    const urlToRevoke = previewUrls[index]
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke)
    }

    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)

    setSelectedImages(newImages)
    setPreviewUrls(newPreviews)
    setCustomError('')

    if (setValue) {
      setValue(name, newImages)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <TooltipProvider>
      <Width width={width}>
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
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                <strong>¿Por qué solicitar imágenes?</strong>
                <br />
                Las fotos nos permiten evaluar mejor el problema, preparar los materiales necesarios
                y ofrecerte un presupuesto más preciso antes de la visita.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className="
              border-2 border-dashed border-border
              rounded-lg p-6
              hover:border-primary/50
              transition-colors duration-200
              cursor-pointer
              bg-muted/20
              focus-within:ring-2 focus-within:ring-primary/20
            "
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={openFileDialog}
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm font-medium">
                Arrastra imágenes aquí o haz clic para seleccionar
              </div>
              <div className="text-xs text-muted-foreground">
                PNG, JPG, GIF hasta 10MB cada una (máx 5 imágenes)
              </div>
            </div>
          </div>

          {/* Hidden File Input - Removed conflicting props */}
          <input
            {...fieldRegistration}
            ref={(e) => {
              fieldRegistration.ref(e)
              fileInputRef.current = e
            }}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              fieldRegistration.onChange(e)
              handleFileSelect(e.target.files)
            }}
          />

          {/* Custom Error Display */}
          {customError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{customError}</p>
              </div>
            </div>
          )}

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Imágenes seleccionadas ({selectedImages.length}/5)
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Puedes eliminar imágenes haciendo clic en la X cuando pases el mouse sobre
                      ellas
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow"
                  >
                    <img
                      src={url}
                      alt={`Vista previa ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="
                        absolute top-2 right-2 h-6 w-6
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-200
                      "
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      aria-label={`Eliminar imagen ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-2 left-2 text-xs text-white font-medium bg-black/60 px-2 py-1 rounded">
                      {selectedImages[index]?.name?.substring(0, 15)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Subiendo imágenes...</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          )}
        </div>

        {errors[name] && <Error message={errors[name]?.message as string} />}
      </Width>
    </TooltipProvider>
  )
}
