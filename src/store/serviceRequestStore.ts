/**
 * Service Request Store
 *
 * Global state management for service requests using Zustand.
 * Centralizes service selection, location data, form state and authentication.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { getMe, invalidateUserCache } from '@/lib/auth'

export type LocationType = {
  lat: number
  lng: number
}

export type ServiceType = {
  id: string
  name: string
  icon?: string
  category?: string
}

export type StepType =
  | 'service'
  | 'location'
  | 'details'
  | 'confirmation'
  | 'dashboard'
  | 'find-contractor'
  | 'payment'
  | 'tracking'

export type RequestStatusType = 'idle' | 'submitting' | 'success' | 'error'

// Helper function to get unique user session ID
const getUserSessionId = () => {
  if (typeof window === 'undefined') return ''

  const userId = localStorage.getItem('msh_userEmail')

  if (userId) {
    try {
      return JSON.parse(userId)
    } catch {
      return userId
    }
  }

  // For anonymous users, create a session ID
  let anonymousId = localStorage.getItem('msh_anonymous_session')
  if (!anonymousId) {
    anonymousId = uuidv4()
    localStorage.setItem('msh_anonymous_session', anonymousId)
  }

  return `anonymous_${anonymousId}`
}

// Define our store type
interface ServiceRequestStore {
  // Basic request data
  requestId: string | null
  selectedServices: ServiceType[]
  location: LocationType | null
  formattedAddress: string
  formData: Record<string, any>
  requestStatus: RequestStatusType
  selectedContractor: any
  currentStep: StepType

  // User authentication
  userEmail: string | null
  userToken: string | null
  userName: string | null
  isAuthenticated: boolean

  // Actions
  setRequestId: (id: string | null) => void
  setSelectedServices: (services: ServiceType[]) => void
  setLocation: (location: LocationType | null) => void
  setFormattedAddress: (address: string) => void
  updateFormData: (data: Record<string, any>) => void
  setRequestStatus: (status: RequestStatusType) => void
  setSelectedContractor: (contractor: any) => void
  setCurrentStep: (step: StepType) => void
  setUserEmail: (email: string | null) => void
  setUserToken: (token: string | null) => void
  setUserName: (name: string | null) => void
  setIsAuthenticated: (value: boolean) => void

  // Complex actions
  resetContext: () => void
  resetServiceAndLocation: () => void
  login: (email: string, token: string, name?: string) => void
  logout: () => void
  submitServiceRequest: (formData: Record<string, any>) => Promise<boolean>
  goToStep: (step: StepType) => void

  // Utils
  hasEssentialData: () => boolean
}

export const useServiceRequestStore = create<ServiceRequestStore>()(
  persist(
    (set, get) => ({
      // State
      requestId: null,
      selectedServices: [],
      location: null,
      formattedAddress: '',
      formData: {},
      requestStatus: 'idle',
      selectedContractor: null,
      currentStep: 'service',
      userEmail: null,
      userToken: null,
      userName: null,
      isAuthenticated: false,

      // Basic setters
      setRequestId: (id) => set({ requestId: id }),
      setSelectedServices: (services) => {
        console.log('🔄 Store: setSelectedServices called with:', services)
        set({ selectedServices: services })
      },
      setLocation: (location) => set({ location }),
      setFormattedAddress: (address) => set({ formattedAddress: address }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      setRequestStatus: (status) => set({ requestStatus: status }),
      setSelectedContractor: (contractor) => set({ selectedContractor: contractor }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setUserEmail: (email) => set({ userEmail: email }),
      setUserToken: (token) => set({ userToken: token }),
      setUserName: (name) => set({ userName: name }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),

      // Complex actions
      resetContext: () => {
        // Reset state to initial values
        set({
          requestId: null,
          selectedServices: [],
          location: null,
          formattedAddress: '',
          formData: {},
          requestStatus: 'idle',
          selectedContractor: null,
          currentStep: 'service',
        })

        // Clear localStorage data specifically for this user
        if (typeof window !== 'undefined') {
          const userId = getUserSessionId()

          // Remove all stored data for this user
          localStorage.removeItem(`msh_requestId_${userId}`)
          localStorage.removeItem(`msh_selectedServices_${userId}`)
          localStorage.removeItem(`msh_location_${userId}`)
          localStorage.removeItem(`msh_formattedAddress_${userId}`)
          localStorage.removeItem(`msh_formData_${userId}`)
        }
      },

      resetServiceAndLocation: () => {
        set({
          selectedServices: [],
          location: null,
          formattedAddress: '',
        })

        // Clear only service and location data
        if (typeof window !== 'undefined') {
          const userId = getUserSessionId()
          localStorage.removeItem(`msh_selectedServices_${userId}`)
          localStorage.removeItem(`msh_location_${userId}`)
          localStorage.removeItem(`msh_formattedAddress_${userId}`)
        }
      },

      login: (email, token, name) => {
        // Guardar datos actuales antes de modificar el estado
        const currentState = get()
        const { requestId, selectedServices, location, formattedAddress, formData } = currentState

        // Verificar si hay datos temporales en localStorage (guardados justo antes de login)
        let tempData = null
        if (typeof window !== 'undefined') {
          const tempDataStr = localStorage.getItem('msh_temp_request_data')
          if (tempDataStr) {
            try {
              tempData = JSON.parse(tempDataStr)
            } catch (e) {
              console.error('Error parsing temp request data:', e)
            }
          }
        }

        // No llamar a resetContext() para evitar perder los datos actuales
        // get().resetContext()

        // Invalidar user cache para actualizar datos de autenticación
        invalidateUserCache()

        // Establecer datos de sesión
        set({
          userEmail: email,
          userToken: token,
          userName: name || null, // Guardar el nombre si está disponible
          isAuthenticated: true,
        })

        // Si no se proporcionó el nombre, intentar obtenerlo de la API
        if (!name) {
          // Intentar obtener el nombre del usuario de forma asíncrona
          getMe(true)
            .then(({ user }) => {
              if (user && user.name) {
                set({ userName: user.name })
                // También guardar en localStorage
                localStorage.setItem('msh_userName', JSON.stringify(user.name))
              }
            })
            .catch((error) => {
              console.error('Error fetching user name:', error)
            })
        } else {
          // Si tenemos el nombre, guardarlo en localStorage
          localStorage.setItem('msh_userName', JSON.stringify(name))
        }

        // Restaurar los datos de solicitud que se deben mantener
        if (tempData) {
          console.log('Restaurando datos de solicitud después de login:', tempData)
          set({
            requestId: tempData.requestId || requestId,
            selectedServices: tempData.selectedServices || selectedServices,
            location: tempData.location || location,
            formattedAddress: tempData.formattedAddress || formattedAddress,
            formData: tempData.formData || formData,
          })

          // Limpiar datos temporales
          if (typeof window !== 'undefined') {
            localStorage.removeItem('msh_temp_request_data')
          }
        } else if (requestId) {
          // Si no hay datos temporales pero teníamos un requestId, mantenerlo
          console.log('Manteniendo requestId existente después de login:', requestId)
          set({ requestId })
        }

        // Guardar email en localStorage
        localStorage.setItem('msh_userEmail', JSON.stringify(email))

        // Eliminar sesión anónima si existe
        localStorage.removeItem('msh_anonymous_session')
      },

      logout: () => {
        // Reset context data
        get().resetContext()

        // Clear authentication
        set({
          userEmail: null,
          userToken: null,
          userName: null,
          isAuthenticated: false,
        })

        // Remove from localStorage
        localStorage.removeItem('msh_userEmail')
        localStorage.removeItem('msh_userName')
      },

      submitServiceRequest: async (formData) => {
        const { userEmail, selectedServices, location, formattedAddress, requestId } = get()

        if (!selectedServices.length || !location || !formattedAddress) {
          console.error('Missing required data for submitting service request')
          return false
        }

        try {
          set({ requestStatus: 'submitting' })

          // Transformar los servicios para que sean strings simples
          const serviceTypes = selectedServices.map((service) => {
            if (typeof service === 'object' && service.id) {
              return service.id
            }
            return service
          })

          // Crear un objeto con el formato exacto que espera PayloadCMS
          const requestData = {
            ...(requestId ? { id: requestId } : {}),
            requestTitle:
              `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Service Request',
            serviceType: serviceTypes,
            description: formData.description || '',
            urgencyLevel: formData.urgency || 'emergency',
            // Estructura correcta según el schema de PayloadCMS - usar firstName y lastName por separado
            customerInfo: {
              firstName: formData.firstName || '',
              lastName: formData.lastName || '',
              phone: formData.phone || '',
              email: userEmail || formData.email || '',
              preferredContact: 'email',
            },
            location: {
              formattedAddress,
              coordinates: {
                lat: location.lat,
                lng: location.lng,
              },
            },
            status: 'pending',
          }

          console.log('Submitting service request with data:', JSON.stringify(requestData, null, 2))

          // Submit via direct API
          let response

          try {
            // Use direct PayloadCMS API endpoint
            const endpoint = '/api/service-request-operations'

            response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
            })
          } catch (fetchError) {
            console.error('Fetch error:', fetchError)
            throw new Error('Network error while submitting service request')
          }

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to submit service request:', errorText)

            try {
              // Intentar analizar como JSON
              const errorJson = JSON.parse(errorText)
              console.error('Error details:', errorJson)

              if (errorJson.errors) {
                const errorMessage = Object.entries(errorJson.errors)
                  .map(([field, error]) => `${field}: ${JSON.stringify(error)}`)
                  .join(', ')
                throw new Error(`Validation error: ${errorMessage}`)
              }
            } catch (jsonError) {
              // Si no es JSON, usar el texto directamente
            }

            set({ requestStatus: 'error' })
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          console.log('Service request created successfully:', result)

          // Update requestId if it was created
          // Manejar la estructura de respuesta para extraer el ID
          let createdId = null

          // Intenta obtener el ID de diferentes estructuras de respuesta posibles
          if (result.id) {
            // Caso 1: El ID está directamente en el resultado
            createdId = result.id
          } else if (result.doc && result.doc.id) {
            // Caso 2: El ID está dentro del campo 'doc'
            createdId = result.doc.id
          } else if (result._id) {
            // Caso 3: El ID podría estar en _id
            createdId = result._id
          } else {
            // Buscar en cualquier campo que pueda contener 'id'
            for (const key in result) {
              if (typeof result[key] === 'string' && (key === 'id' || key.endsWith('Id'))) {
                createdId = result[key]
                break
              } else if (result[key] && typeof result[key] === 'object' && result[key].id) {
                createdId = result[key].id
                break
              }
            }
          }

          if (createdId) {
            console.log('Setting requestId in store to:', createdId)
            set({
              requestId: createdId,
              requestStatus: 'success',
            })

            // Guardar también en localStorage para mayor seguridad
            if (typeof window !== 'undefined') {
              const userId = getUserSessionId()
              localStorage.setItem(`msh_requestId_${userId}`, createdId)
            }
          } else {
            console.error('No ID returned from API response!', result)
            set({ requestStatus: 'success' })
          }

          return true
        } catch (error) {
          console.error('Error submitting service request:', error)
          set({ requestStatus: 'error' })
          return false
        }
      },

      goToStep: (step) => {
        set({ currentStep: step })
      },

      // Utils
      hasEssentialData: () => {
        const { selectedServices, location, requestId, currentStep } = get()

        // Para la página de detalles, solo necesitamos servicios y ubicación
        if (currentStep === 'details') {
          return !!(selectedServices.length && location)
        }

        // Para las demás páginas que requieren contexto completo,
        // necesitamos también el requestId
        return !!(selectedServices.length && location && requestId)
      },
    }),
    {
      name: 'service-request-storage', // localStorage key
      partialize: (state) => {
        // Exclude certain fields from persistence if needed
        const { submitServiceRequest, ...rest } = state
        return rest
      },
    },
  ),
)
