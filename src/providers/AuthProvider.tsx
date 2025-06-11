/**
 * AuthProvider
 *
 * Global authentication provider that manages user authentication state
 * and provides login/logout functionality across the application.
 */
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getMe, invalidateUserCache, forceLogoutCache, syncSSRUser } from '@/lib/auth'
import { User } from '@/payload-types'
import { useRouter } from 'next/navigation'

// Define authentication context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  initializeFromSSR: (ssrUser: User | null) => void
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  initializeFromSSR: () => {},
})

// Event para sincronizar el estado de autenticación entre pestañas
const AUTH_SYNC_EVENT = 'auth-sync-event'

/**
 * AuthProvider - Global authentication provider
 *
 * Manages user authentication state and provides login/logout functionality.
 * Uses cookies for authentication and stores minimal user data in memory.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  // Initialize from SSR data if available
  const initializeFromSSR = (ssrUser: User | null) => {
    console.log('🔄 Initializing from SSR:', ssrUser ? `User: ${ssrUser.email}` : 'No user')
    setUser(ssrUser)
    syncSSRUser(ssrUser)
    setIsLoading(false)
    setIsHydrated(true)
  }

  // Load user on mount ONLY after hydration
  useEffect(() => {
    if (isHydrated) {
      console.log('✅ Already hydrated from SSR, skipping client fetch')
      return
    }

    const loadUser = async () => {
      try {
        setIsLoading(true)

        // Check if there's any evidence of existing authentication
        const hasAuthToken = document.cookie.includes('payload-token')
        const hasStoredAuth =
          localStorage.getItem('msh_userEmail') ||
          localStorage.getItem('auth-login') === 'true' ||
          localStorage.getItem('msh_authenticated') === 'true'

        console.log('🔍 Checking for existing auth evidence:', { hasAuthToken, hasStoredAuth })

        // Always try to fetch user if there's any auth evidence
        if (hasAuthToken || hasStoredAuth) {
          console.log('🔑 Found auth evidence, fetching user...')
          const { user: userData } = await getMe()
          if (userData) {
            setUser(userData)
            // Asegurar que el flag de persistencia esté establecido
            localStorage.setItem('msh_authenticated', 'true')
          } else {
            console.log('⚠️ Auth evidence found but no user returned, clearing flags')
            localStorage.removeItem('msh_authenticated')
            localStorage.removeItem('auth-login')
            setUser(null)
          }
        } else {
          console.log('🚫 No auth evidence found, staying logged out')
          setUser(null)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
        setIsHydrated(true)
      }
    }

    // Add delay to prevent immediate fetch on hydration
    const timeoutId = setTimeout(loadUser, 100)

    // Configurar listener para eventos de sincronización entre pestañas
    const handleAuthSync = (event: StorageEvent) => {
      if (event.key === 'auth-logout' && event.newValue === 'true') {
        // Otra pestaña ha cerrado sesión, actualizar este contexto
        console.log('🚪 Logout event detected from another tab')
        setUser(null)
        forceLogoutCache()
        localStorage.removeItem('auth-logout')

        // Force reload to ensure complete logout
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else if (event.key === 'auth-login' && event.newValue === 'true') {
        // Otra pestaña ha iniciado sesión, actualizar este contexto
        console.log('🔑 Login event detected from another tab')
        loadUser()
        localStorage.removeItem('auth-login')
      }
    }

    window.addEventListener('storage', handleAuthSync)

    // Limpieza
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('storage', handleAuthSync)
    }
  }, [isHydrated])

  // Login method - PayloadCMS handles cookies automatically, we just need to refresh user state
  const login = async (token?: string) => {
    try {
      console.log('🔑 AuthProvider login method called')

      // PayloadCMS handles cookies automatically, so we just need to refresh user data
      invalidateUserCache()

      // Force refresh user data and wait for it to complete
      await refreshUser()

      console.log('✅ AuthProvider login completed, user state updated')

      // Force a state update to trigger re-renders immediately
      setIsLoading(false)

      // Informar a otras pestañas sobre el login (con flag para persistencia)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-login', 'true')
        localStorage.setItem('msh_authenticated', 'true')
      }

      // Disparar evento de sincronización
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_SYNC_EVENT, { detail: { type: 'login' } }))
      }

      return Promise.resolve()
    } catch (error) {
      console.error('Error during login:', error)
      setIsLoading(false)
      return Promise.reject(error)
    }
  }

  // Logout method - clears token and user state
  const logout = async () => {
    try {
      setIsLoading(true)

      // Clear local user state immediately
      setUser(null)

      // Force cache to logout state immediately
      forceLogoutCache()

      // Call the logout endpoint to clear cookies
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        console.warn('Logout endpoint error, trying nuclear option...')

        // Try nuclear clear session endpoint
        try {
          await fetch('/api/auth/clear-session', {
            method: 'POST',
            credentials: 'include',
          })
          console.log('Nuclear session clear completed')
        } catch (nuclearError) {
          console.warn('Nuclear clear also failed, continuing with client-side cleanup')
        }
      }

      // Additional cache invalidation
      invalidateUserCache()

      // Clear all relevant localStorage items
      try {
        localStorage.removeItem('auth-login')
        localStorage.removeItem('msh_authenticated')
        localStorage.removeItem('msh_userEmail')
        localStorage.setItem('auth-logout', 'true')
      } catch (e) {
        console.warn('LocalStorage not available')
      }

      // Disparar evento de sincronización
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_SYNC_EVENT, { detail: { type: 'logout' } }))
      }

      // Force reload the entire page to clear any remaining state
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      } else {
        router.push('/')
      }

      return Promise.resolve()
    } catch (error) {
      console.error('Error during logout:', error)
      // Even on error, ensure user is logged out locally
      setUser(null)
      forceLogoutCache()
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Method to refresh user data
  const refreshUser = async () => {
    console.log('🔄 Refreshing user data...')
    setIsLoading(true)
    try {
      const { user: freshUser } = await getMe(true)
      console.log(
        '📦 Fresh user data received:',
        freshUser ? `User: ${freshUser.email}, Role: ${freshUser.role}` : 'No user',
      )
      setUser(freshUser)
      console.log('✅ User state updated in AuthProvider')
      return Promise.resolve()
    } catch (error) {
      console.error('❌ Error refreshing user:', error)
      setUser(null)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        initializeFromSSR,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth - Hook to access authentication context
 *
 * @returns {AuthContextType} Authentication context
 */
export const useAuth = () => useContext(AuthContext)
