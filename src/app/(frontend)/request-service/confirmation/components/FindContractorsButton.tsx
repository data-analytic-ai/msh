/**
 * FindContractorsButton
 *
 * Componente que maneja la navegación a la página de búsqueda de contratistas
 * y verifica los permisos del usuario para avanzar.
 */
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { safelyStoreJSON } from '@/lib/storageUtils'
import { ServiceType, LocationType } from '@/hooks/useServiceRequest'

interface FindContractorsButtonProps {
  selectedServices: ServiceType[]
  location: LocationType
  requestId: string | null
  isAuthenticated: boolean
  userEmail: string | null
  goToStep: (step: string) => void
}

export const FindContractorsButton: React.FC<FindContractorsButtonProps> = ({
  selectedServices,
  location,
  requestId,
  isAuthenticated,
  userEmail,
  goToStep,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFindContractors = async () => {
    // Limpiar mensaje de error anterior
    setErrorMessage(null)

    // Verificar si falta información esencial
    if (!selectedServices || selectedServices.length === 0 || !location || !requestId) {
      setErrorMessage('No se puede continuar sin información completa del servicio.')
      return
    }

    // Verificar autenticación
    if (!isAuthenticated && !userEmail) {
      setErrorMessage('Por favor, crea una cuenta o inicia sesión para continuar.')
      return
    }

    setIsLoading(true)

    try {
      // Guardar datos en localStorage para persistencia entre páginas
      safelyStoreJSON('msh_selectedServices', selectedServices)
      safelyStoreJSON('msh_location', location)
      safelyStoreJSON('msh_requestId', requestId)

      // Si hay un correo pero no está autenticado, guardar esa información también
      if (userEmail && !isAuthenticated) {
        safelyStoreJSON('msh_userEmail', userEmail)
      }

      // Navegar a la página de búsqueda de contratistas
      goToStep('find-contractor')
    } catch (error) {
      console.error('Error navigating to find contractors:', error)
      setErrorMessage('Ocurrió un error al buscar contratistas. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Determinar si el botón debe estar deshabilitado
  const isButtonDisabled = isLoading || (!isAuthenticated && !userEmail)

  return (
    <>
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-3 text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        onClick={handleFindContractors}
        className="w-full bg-primary"
        disabled={isButtonDisabled}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            Finding contractors...
          </span>
        ) : (
          'View available contractors'
        )}
      </Button>

      {!isAuthenticated && !userEmail && (
        <p className="text-sm text-center text-muted-foreground mt-2">
          You need to create an account before viewing available contractors
        </p>
      )}
    </>
  )
}
