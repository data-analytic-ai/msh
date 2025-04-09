'use client'

/**
 * ServiceRequestContext
 *
 * Context for managing service request state throughout the application.
 * Handles form state, location data, and service selection.
 * Persists state in localStorage with user isolation to prevent data leak between users.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import { getMe, invalidateUserCache } from '@/lib/auth'

export type LocationType = {
  lat: number
  lng: number
}

export type ServiceType =
  | 'plumbing'
  | 'electrical'
  | 'glass'
  | 'hvac'
  | 'pests'
  | 'locksmith'
  | 'roofing'
  | 'siding'
  | 'general'

export interface ServiceRequestContextType {
  // Service type - cambiamos a array para selección múltiple
  selectedServices: ServiceType[]
  setSelectedServices: (services: ServiceType[]) => void

  // Location data
  location: LocationType | null
  setLocation: (location: LocationType | null) => void
  formattedAddress: string
  setFormattedAddress: (address: string) => void

  // Form data
  formData: Record<string, any>
  updateFormData: (data: Record<string, any>) => void

  // Request status
  requestStatus: 'idle' | 'submitting' | 'success' | 'error'
  setRequestStatus: (status: 'idle' | 'submitting' | 'success' | 'error') => void

  // Selected contractor (if applicable)
  selectedContractor: any
  setSelectedContractor: (contractor: any) => void

  // Reset context data
  resetContext: () => void
  resetServiceAndLocation: () => void
  requestId: string | null
  setRequestId: (id: string | null) => void

  // User information
  userEmail: string | null
  setUserEmail: (email: string | null) => void

  // User authentication
  userToken: string | null
  setUserToken: (token: string | null) => void
  login: (email: string, token: string) => void
  logout: () => void

  // Data synchronization
  syncWithDatabase: () => Promise<boolean>
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void

  // Service request submission
  submitServiceRequest: (formData: Record<string, any>) => Promise<boolean>
}

// Default context values
const ServiceRequestContext = createContext<ServiceRequestContextType>({
  requestId: null,
  setRequestId: () => {},
  selectedServices: [],
  setSelectedServices: () => {},
  location: null,
  setLocation: () => {},
  formattedAddress: '',
  setFormattedAddress: () => {},
  formData: {},
  updateFormData: () => {},
  requestStatus: 'idle',
  setRequestStatus: () => {},
  selectedContractor: null,
  setSelectedContractor: () => {},
  resetContext: () => {},
  resetServiceAndLocation: () => {},
  userEmail: null,
  setUserEmail: () => {},
  userToken: null,
  setUserToken: () => {},
  login: () => {},
  logout: () => {},
  syncWithDatabase: async () => false,
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  submitServiceRequest: async () => false,
})

// Función para obtener el identificador de sesión único para el usuario actual
const getUserSessionId = () => {
  if (typeof window === 'undefined') return 'server'

  // Si el usuario está autenticado, usar su email como identificador
  const userEmail = localStorage.getItem('msh_userEmail')
  if (userEmail) {
    try {
      return JSON.parse(userEmail)
    } catch {
      return userEmail
    }
  }

  // Si no hay usuario autenticado, usar un ID de sesión anónima
  let sessionId = localStorage.getItem('msh_anonymous_session')
  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem('msh_anonymous_session', sessionId)
  }

  return sessionId
}

// Helper function to safely parse JSON from localStorage with user isolation
const safelyParseJSON = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue

  try {
    const userId = getUserSessionId()
    const userKey = `${key}_${userId}`
    const storedValue = localStorage.getItem(userKey)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Helper function to safely store JSON in localStorage with user isolation
const safelyStoreJSON = (key: string, value: any) => {
  if (typeof window === 'undefined') return

  try {
    const userId = getUserSessionId()
    const userKey = `${key}_${userId}`
    localStorage.setItem(userKey, JSON.stringify(value))
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error)
  }
}

export const ServiceRequestProvider = ({ children }: { children: ReactNode }) => {
  // Check localStorage for existing data on initial load
  const [requestId, setRequestId] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([])
  const [location, setLocation] = useState<LocationType | null>(null)
  const [formattedAddress, setFormattedAddress] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  )
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Verificar la autenticación con Payload CMS al cargar
  useEffect(() => {
    const checkAuthWithPayload = async () => {
      try {
        const { user } = await getMe()

        if (user) {
          // Usuario autenticado en Payload
          setIsAuthenticated(true)
          setUserEmail(user.email)

          // Guardar el email en localStorage para la persistencia de sesión
          localStorage.setItem('msh_userEmail', JSON.stringify(user.email))

          // Si el usuario cambia, limpiamos la sesión anónima anterior
          localStorage.removeItem('msh_anonymous_session')
        } else {
          // No autenticado en Payload
          setIsAuthenticated(false)
          setUserEmail(null)
          localStorage.removeItem('msh_userEmail')

          // Crear una nueva sesión anónima si no existe
          if (!localStorage.getItem('msh_anonymous_session')) {
            localStorage.setItem('msh_anonymous_session', uuidv4())
          }
        }

        // Ahora podemos cargar los datos de localStorage específicos para este usuario
        loadDataFromLocalStorage()
        setIsInitialized(true)
      } catch (error) {
        console.error('Error checking authentication with Payload:', error)
        // En caso de error, asumimos que no está autenticado
        setIsAuthenticated(false)
        setUserEmail(null)

        // Crear una nueva sesión anónima si no existe
        if (!localStorage.getItem('msh_anonymous_session')) {
          localStorage.setItem('msh_anonymous_session', uuidv4())
        }

        // Cargar datos de localStorage para sesión anónima
        loadDataFromLocalStorage()
        setIsInitialized(true)
      }
    }

    checkAuthWithPayload()
  }, [])

  // Función para cargar datos desde localStorage
  const loadDataFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      setRequestId(safelyParseJSON('msh_requestId', null))
      setSelectedServices(safelyParseJSON('msh_selectedServices', []))
      setLocation(safelyParseJSON('msh_location', null))
      setFormattedAddress(safelyParseJSON('msh_formattedAddress', ''))
      setFormData(safelyParseJSON('msh_formData', {}))
      setRequestStatus(safelyParseJSON('msh_requestStatus', 'idle'))
      setSelectedContractor(safelyParseJSON('msh_selectedContractor', null))
      setUserToken(safelyParseJSON('msh_userToken', null))
    }
  }

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      safelyStoreJSON('msh_requestId', requestId)
      safelyStoreJSON('msh_selectedServices', selectedServices)
      safelyStoreJSON('msh_location', location)
      safelyStoreJSON('msh_formattedAddress', formattedAddress)
      safelyStoreJSON('msh_formData', formData)
      safelyStoreJSON('msh_requestStatus', requestStatus)
      safelyStoreJSON('msh_selectedContractor', selectedContractor)
      safelyStoreJSON('msh_userToken', userToken)
    }
  }, [
    requestId,
    selectedServices,
    location,
    formattedAddress,
    formData,
    requestStatus,
    selectedContractor,
    userToken,
    isInitialized,
  ])

  // Update form data
  const updateFormData = useCallback((data: Record<string, any>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }))
  }, [])

  // Sync data with database using user email
  const syncWithDatabaseInternal = useCallback(
    async (email: string | null) => {
      if (!email) return false

      try {
        // Fetch the most recent service request for this email
        const response = await fetch(`/api/user-requests?email=${email}`)

        if (!response.ok) {
          console.error('Failed to sync with database:', await response.text())
          return false
        }

        const data = await response.json()

        // If we have data, update the context
        if (data && data.requests && data.requests.length > 0) {
          const latestRequest = data.requests[0] // Most recent request

          setRequestId(latestRequest.requestId)
          setSelectedServices(latestRequest.serviceType)

          if (latestRequest.location && latestRequest.location.coordinates) {
            setLocation({
              lat: latestRequest.location.coordinates.lat,
              lng: latestRequest.location.coordinates.lng,
            })
            setFormattedAddress(latestRequest.location.formattedAddress)
          }

          updateFormData({
            description: latestRequest.description,
            urgency: latestRequest.urgencyLevel,
            fullName: latestRequest.customerInfo?.fullName,
            email: latestRequest.customerInfo?.email,
            phone: latestRequest.customerInfo?.phone,
          })

          setRequestStatus('success')
          return true
        }

        return false
      } catch (error) {
        console.error('Error syncing with database:', error)
        return false
      }
    },
    [updateFormData],
  )

  // Sincronizar con la base de datos cuando cambie el email
  useEffect(() => {
    if (userEmail && isInitialized) {
      let isMounted = true // Para evitar actualizaciones en componentes desmontados

      // No sincronizamos automáticamente, dejamos que los componentes lo hagan explícitamente
      // cuando sea necesario usando la función syncWithDatabase
      // Esto evita que se carguen automáticamente los datos al iniciar la app

      // Solo registramos que el usuario está autenticado pero no cargamos sus datos
      console.log('Usuario autenticado:', userEmail)

      return () => {
        isMounted = false
      }
    }
  }, [userEmail, isInitialized])

  // Reset all context data and localStorage
  const resetContext = useCallback(() => {
    setSelectedServices([])
    setLocation(null)
    setFormattedAddress('')
    setFormData({})
    setRequestStatus('idle')
    setSelectedContractor(null)
    setRequestId(null)

    // Limpiar localStorage específico para el usuario actual
    if (typeof window !== 'undefined') {
      const userId = getUserSessionId()

      localStorage.removeItem(`msh_requestId_${userId}`)
      localStorage.removeItem(`msh_selectedServices_${userId}`)
      localStorage.removeItem(`msh_location_${userId}`)
      localStorage.removeItem(`msh_formattedAddress_${userId}`)
      localStorage.removeItem(`msh_formData_${userId}`)
      localStorage.removeItem(`msh_requestStatus_${userId}`)
      localStorage.removeItem(`msh_selectedContractor_${userId}`)
      localStorage.removeItem(`msh_userToken_${userId}`)
    }
  }, [])

  // Reset only service and location data (for Home page)
  const resetServiceAndLocation = useCallback(() => {
    setSelectedServices([])
    setLocation(null)
    setFormattedAddress('')

    // Limpiar solo localStorage relacionado con servicios y ubicación
    if (typeof window !== 'undefined') {
      const userId = getUserSessionId()
      localStorage.removeItem(`msh_selectedServices_${userId}`)
      localStorage.removeItem(`msh_location_${userId}`)
      localStorage.removeItem(`msh_formattedAddress_${userId}`)
    }
  }, [])

  const syncWithDatabase = useCallback(async () => {
    return syncWithDatabaseInternal(userEmail)
  }, [userEmail])

  // Login function to set user email and token
  const login = useCallback(
    (email: string, token: string) => {
      // Primero limpiar cualquier dato de la sesión anterior
      resetContext()

      // Invalidar caché del usuario
      invalidateUserCache()

      // Luego establecer los datos de la nueva sesión
      setUserEmail(email)
      setUserToken(token)
      setIsAuthenticated(true)

      // Guardar email en localStorage para identificar al usuario
      localStorage.setItem('msh_userEmail', JSON.stringify(email))

      // Limpiar sesión anónima
      localStorage.removeItem('msh_anonymous_session')
    },
    [resetContext],
  )

  // Logout function to clear user data
  const logout = useCallback(() => {
    // Primero hacer logout de Payload
    fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        // Limpiar datos de la sesión
        resetContext()

        // Invalidar caché del usuario
        invalidateUserCache()

        // Limpiar datos de autenticación
        setUserEmail(null)
        setUserToken(null)
        setIsAuthenticated(false)

        // Limpiar localStorage
        localStorage.removeItem('msh_userEmail')

        // Crear nueva sesión anónima
        const newSessionId = uuidv4()
        localStorage.setItem('msh_anonymous_session', newSessionId)
      })
      .catch((error) => {
        console.error('Error during logout:', error)
      })
  }, [resetContext])

  // Function to submit form and process service request
  const submitServiceRequest = useCallback(
    async (formData: Record<string, any>): Promise<boolean> => {
      try {
        setRequestStatus('submitting')

        // Create payload for the API
        const requestPayload = {
          selectedServices,
          location,
          formattedAddress,
          formData,
        }

        // Submit the request to our API
        const response = await fetch('/api/service-request/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        })

        const data = await response.json()

        if (!response.ok) {
          console.error('Error submitting service request:', data.error)
          setRequestStatus('error')
          return false
        }

        // Update the request ID
        setRequestId(data.requestId)

        // Update request status
        setRequestStatus('success')

        // Marcar que se completó una solicitud para que los otros componentes
        // sepan que deben actualizar su información
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('fromCompletedRequest', 'true')
        }

        return true
      } catch (error) {
        console.error('Error submitting service request:', error)
        setRequestStatus('error')
        return false
      }
    },
    [selectedServices, location, formattedAddress],
  )

  return (
    <ServiceRequestContext.Provider
      value={{
        requestId,
        setRequestId,
        selectedServices,
        setSelectedServices,
        location,
        setLocation,
        formattedAddress,
        setFormattedAddress,
        formData,
        updateFormData,
        requestStatus,
        setRequestStatus,
        selectedContractor,
        setSelectedContractor,
        resetContext,
        resetServiceAndLocation,
        userEmail,
        setUserEmail,
        userToken,
        setUserToken,
        login,
        logout,
        syncWithDatabase,
        isAuthenticated,
        setIsAuthenticated,
        submitServiceRequest,
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  )
}

export const useServiceRequest = () => useContext(ServiceRequestContext)
