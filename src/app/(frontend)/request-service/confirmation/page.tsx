/**
 * ConfirmationPage
 *
 * Página de confirmación que muestra al usuario que su solicitud de servicio
 * ha sido recibida correctamente y le proporciona información de seguimiento.
 *
 * Esta página actúa como coordinadora de los componentes más pequeños
 * que manejan funcionalidades específicas.
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { useAuth } from '@/providers/AuthProvider'
import { safelyStoreJSON } from '@/lib/storageUtils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Componentes extraídos
import { RequestHeader } from './components/RequestHeader'
import { RequestSummary } from './components/RequestSummary'
import { UserAccountHandler } from './components/UserAccountHandler'
import { NextStepsInfo } from './components/NextStepsInfo'
import { FindContractorsButton } from './components/FindContractorsButton'
import MapComponent from '@/components/ui/MapComponent'

export default function ConfirmationPage() {
  const {
    selectedServices,
    location,
    formattedAddress,
    formData,
    requestId,
    userEmail,
    setCurrentStep,
    hasEssentialData,
    setRequestId,
    goToStep,
    isAuthenticated,
  } = useServiceRequest()

  // Usar el contexto de autenticación global
  const { isAuthenticated: authContextAuthenticated } = useAuth()

  const router = useRouter()
  const [redirectError, setRedirectError] = useState<string | null>(null)

  // Verificar inconsistencias entre autenticación
  useEffect(() => {
    // Si hay inconsistencia entre los estados de autenticación, mostrar mensaje y ajustar
    if (isAuthenticated !== authContextAuthenticated) {
      console.log('Inconsistencia en estados de autenticación:', {
        storeAuth: isAuthenticated,
        contextAuth: authContextAuthenticated,
      })

      // Mostrar un mensaje de error temporal
      setRedirectError('Hubo un problema con tu sesión. Confirma tu cuenta para continuar.')

      // Limpiar el mensaje después de 5 segundos
      const timer = setTimeout(() => {
        setRedirectError(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, authContextAuthenticated])

  // Marcar el paso actual en el contexto
  useEffect(() => {
    setCurrentStep('confirmation')

    // Intentar recuperar el requestId del localStorage si no está disponible
    if (!requestId) {
      if (typeof window !== 'undefined') {
        // Buscar primero usando el ID de usuario si está autenticado
        const userId = localStorage.getItem('msh_userEmail')
        let storedRequestId = null

        if (userId) {
          try {
            const parsedUserId = JSON.parse(userId)
            storedRequestId = localStorage.getItem(`msh_requestId_${parsedUserId}`)
          } catch {
            storedRequestId = localStorage.getItem(`msh_requestId_${userId}`)
          }
        }

        // Si no se encontró, buscar en sesión anónima
        if (!storedRequestId) {
          const anonymousId = localStorage.getItem('msh_anonymous_session')
          if (anonymousId) {
            storedRequestId = localStorage.getItem(`msh_requestId_anonymous_${anonymousId}`)
          }
        }

        // Como último recurso, buscar en el almacenamiento general
        if (!storedRequestId) {
          storedRequestId = localStorage.getItem('msh_requestId')
        }

        if (storedRequestId) {
          console.log('Recuperando requestId del localStorage:', storedRequestId)
          // Actualizar el estado con el ID recuperado
          setRequestId(storedRequestId)
        }
      }
    }

    console.log('Estado en confirmación:', {
      selectedServices,
      location,
      formattedAddress,
      formData,
      requestId,
      userEmail,
    })
  }, [
    setCurrentStep,
    selectedServices,
    location,
    formattedAddress,
    formData,
    requestId,
    userEmail,
    setRequestId,
  ])

  // Función para guardar cambios en los campos editables
  const handleSaveField = async (fieldName: string, value: string): Promise<boolean> => {
    if (!requestId) {
      console.error('No requestId available for update')
      return false
    }

    try {
      // Construir la estructura de datos para la actualización
      const updateData: any = {}

      // Determinar la estructura correcta según el campo
      if (fieldName === 'description') {
        updateData.description = value
      } else if (fieldName === 'fullName') {
        updateData.customerInfo = {
          ...(formData?.customerInfo || {}),
          fullName: value,
        }
      } else if (fieldName === 'phone') {
        updateData.customerInfo = {
          ...(formData?.customerInfo || {}),
          phone: value,
        }
      } else if (fieldName === 'email') {
        updateData.customerInfo = {
          ...(formData?.customerInfo || {}),
          email: value,
        }
      }

      console.log('Actualizando campo:', fieldName, 'con valor:', value)

      // Enviar la actualización a la API
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        console.error('Error updating field:', await response.text())
        return false
      }

      // Actualizar también el estado local
      if (formData) {
        const updatedFormData = { ...formData }
        if (fieldName === 'description') {
          updatedFormData.description = value
        } else if (fieldName === 'fullName') {
          updatedFormData.fullName = value
        } else if (fieldName === 'phone') {
          updatedFormData.phone = value
        } else if (fieldName === 'email') {
          updatedFormData.email = value
        }

        // Actualizar el formData en el store (esto debería implementarse)
        // updateFormData(updatedFormData);
      }

      return true
    } catch (error) {
      console.error('Error saving field:', error)
      return false
    }
  }

  // Function to go back to edit details
  const handleEditDetails = () => {
    console.log('Editando detalles con datos existentes:', {
      formData,
      selectedServices,
      requestId,
    })

    // Asegurarnos de que guardamos los datos actuales antes de navegar
    if (selectedServices && location && requestId) {
      // Guardar en localStorage para asegurar persistencia
      safelyStoreJSON('msh_selectedServices', selectedServices)
      safelyStoreJSON('msh_location', location)
      safelyStoreJSON('msh_requestId', requestId)
      safelyStoreJSON('msh_formData', formData)
    }

    // Ir a la página de detalles manteniendo el estado
    goToStep('details')
  }

  // If we don't have the required information, show a loading state
  if (!selectedServices || !location) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="ml-4 text-lg font-semibold">Request Information</h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="space-y-6 text-center">
            <p className="text-lg">No active service request found.</p>
            <Button onClick={() => router.push('/')}>Start a New Request</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RequestHeader />

      <main className="flex-1 p-4">
        <div className="space-y-6">
          {redirectError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {redirectError}
            </div>
          )}

          {/* Mapa en modo solo lectura */}
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <MapComponent
              selectedService={selectedServices}
              location={location}
              setLocation={() => {}}
              onContinue={() => {}}
              formattedAddress={formattedAddress}
              readOnly={true}
            />
          </div>

          <RequestSummary
            requestId={requestId}
            selectedServices={selectedServices}
            formattedAddress={formattedAddress}
            formData={formData}
            handleEditDetails={handleEditDetails}
            handleSaveField={handleSaveField}
          />

          {/* Componente para gestionar la cuenta de usuario */}
          <UserAccountHandler userEmail={userEmail} requestId={requestId} />

          <NextStepsInfo />

          <FindContractorsButton
            selectedServices={selectedServices}
            location={location}
            requestId={requestId}
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            goToStep={goToStep}
          />
        </div>
      </main>
    </div>
  )
}
