import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'

// Extended type to include custom field types
type ExtendedFormFieldBlock =
  | FormFieldBlock
  | {
      blockType:
        | 'phoneNumber'
        | 'imageUpload'
        | 'location'
        | 'number'
        | 'colorPicker'
        | 'urgencyLevel'
      name: string
      label?: string
      width?: number
      required?: boolean
      defaultValue?: any
    }

export const buildInitialFormState = (fields: ExtendedFormFieldBlock[]) => {
  return fields?.reduce((initialSchema, field) => {
    if (field.blockType === 'checkbox') {
      return {
        ...initialSchema,
        [field.name]: field.defaultValue,
      }
    }
    if (field.blockType === 'textarea') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'email') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'text') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'select') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'state') {
      return {
        ...initialSchema,
        [field.defaultValue || field.name]: '',
      }
    }
    if (field.blockType === 'country') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'message') {
      return initialSchema
    }
    // Corregimos el manejo del campo colorPicker
    // @ts-ignore - Ignoramos el error de tipo ya que sabemos que este campo existe
    if (field.blockType === 'colorPicker') {
      // @ts-ignore
      return {
        ...initialSchema,
        // @ts-ignore
        [field.name]: '',
      }
    }
    if (field.blockType === 'phoneNumber') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'imageUpload') {
      return {
        ...initialSchema,
        [field.name]: [],
      }
    }
    if (field.blockType === 'location') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'number') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }

    return initialSchema
  }, {})
}
