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
    console.log('🔄 Using cached user data:', meCache.user ? 'User found' : 'No user')
    return { user: meCache.user }
  }

  // Check if we should even attempt to fetch (avoid unnecessary calls)
  if (typeof window !== 'undefined') {
    const hasAuthToken = document.cookie.includes('payload-token')
    if (!hasAuthToken && !skipCache) {
      console.log('🚫 No auth token found, not fetching user')
      meCache = { user: null, timestamp: Date.now() }
      return { user: null }
    }
  }

  console.log('🌐 Fetching user from /api/users/me')

  try {
    // Use PayloadCMS native API endpoint for getting current user
    const response = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 /api/users/me response status:', response.status)

    if (!response.ok) {
      console.log('❌ /api/users/me request failed')
      // Actualizar la caché con usuario nulo
      meCache = { user: null, timestamp: Date.now() }
      return { user: null }
    }

    const data = await response.json()
    console.log('📦 /api/users/me response data:', data)

    // PayloadCMS native API returns user data directly or in a user property
    const user = data.user || data || null

    // If we get a response but no user, it might be an empty session
    if (!user) {
      console.log('⚠️ Got response but no user data - empty session')
      meCache = { user: null, timestamp: Date.now() }
      return { user: null }
    }

    // Almacenar en caché el resultado
    meCache = { user, timestamp: Date.now() }
    console.log('💾 Cached user data:', `User: ${user.email}`)
    return { user }
  } catch (error) {
    console.error('🚨 Error fetching authenticated user:', error)
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

// Función para forzar logout del caché
export const forceLogoutCache = () => {
  meCache = null
  console.log('User cache forced to logout state')
}
