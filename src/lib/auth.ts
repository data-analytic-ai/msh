import { User } from '@/payload-types'

type MeResponse = {
  user: User | null
}

// Caché para almacenar temporalmente los resultados de getMe
let meCache: {
  user: User | null
  timestamp: number
} | null = null

// Tiempo de expiración de la caché (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000

// Function to get the currently authenticated user using PayloadCMS native API
export const getMe = async (skipCache: boolean = false): Promise<MeResponse> => {
  // Si tenemos una caché válida y no se solicita omitirla, la usamos
  if (!skipCache && meCache && Date.now() - meCache.timestamp < CACHE_EXPIRY) {
    console.log('Using cached user data')
    return { user: meCache.user }
  }

  try {
    // Use PayloadCMS native API endpoint for getting current user
    const response = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Actualizar la caché con usuario nulo
      meCache = { user: null, timestamp: Date.now() }
      return { user: null }
    }

    const data = await response.json()

    // PayloadCMS native API returns user data directly or in a user property
    const user = data.user || data || null

    // Almacenar en caché el resultado
    meCache = { user, timestamp: Date.now() }
    return { user }
  } catch (error) {
    console.error('Error fetching authenticated user:', error)
    // En caso de error, actualizamos la caché pero con una vida más corta
    meCache = { user: null, timestamp: Date.now() - (CACHE_EXPIRY - 30000) }
    return { user: null }
  }
}

// Función para invalidar la caché manualmente (útil después de login/logout)
export const invalidateUserCache = () => {
  meCache = null
  console.log('User cache invalidated')
}
