/**
 * EditableField - Campo editable para la página de confirmación
 *
 * Permite editar un campo y guardar el cambio directamente en la DB
 */
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Edit, Save, X } from 'lucide-react'

export interface EditableFieldProps {
  label: string
  value: string
  fieldName: string
  requestId: string
  onSave: (fieldName: string, value: string) => Promise<boolean>
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  fieldName,
  requestId,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setEditValue(value)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value)
  }

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const success = await onSave(fieldName, editValue)
      if (success) {
        setIsEditing(false)
      } else {
        alert('No se pudo guardar el cambio')
      }
    } catch (error) {
      console.error('Error saving change:', error)
      alert('Error al guardar el cambio')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-start gap-3 pb-3 border-b">
      <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1">
        <h5 className="font-medium flex items-center gap-2">
          {label}
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="text-primary hover:text-primary/80 p-1 rounded-full"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
        </h5>

        {isEditing ? (
          <div className="space-y-2 mt-1">
            {fieldName === 'description' ? (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm min-h-[80px]"
              />
            ) : (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm"
              />
            )}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 text-xs"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Save className="h-3 w-3" />
                    Save
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{value}</p>
        )}
      </div>
    </div>
  )
}
