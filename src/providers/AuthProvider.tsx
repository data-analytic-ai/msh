/**
 * AuthProvider
 *
 * Global authentication provider that manages user authentication state
 * and provides login/logout functionality across the application.
 */
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getMe, invalidateUserCache, forceLogoutCache } from '@/lib/auth'
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
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
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
  const router = useRouter()

  // Load user on mount ONLY if there's evidence of existing authentication
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)

        // Check if there's any evidence of existing authentication
        const hasAuthToken = document.cookie.includes('payload-token')
        const hasStoredAuth =
          localStorage.getItem('msh_userEmail') || localStorage.getItem('auth-login') === 'true'

        console.log('🔍 Checking for existing auth evidence:', { hasAuthToken, hasStoredAuth })

        // Only fetch user if there's evidence of existing authentication
        if (hasAuthToken || hasStoredAuth) {
          console.log('🔑 Found auth evidence, fetching user...')
          const { user: userData } = await getMe()
          setUser(userData)
        } else {
          console.log('🚫 No auth evidence found, staying logged out')
          setUser(null)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

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
      window.removeEventListener('storage', handleAuthSync)
    }
  }, [])

  // Login method - PayloadCMS handles cookies automatically, we just need to refresh user state
  const login = async (token?: string) => {
    try {
      // PayloadCMS handles cookies automatically, so we just need to refresh user data
      invalidateUserCache()
      await refreshUser()

      // Informar a otras pestañas sobre el login
      localStorage.setItem('auth-login', 'true')

      // Disparar evento de sincronización
      window.dispatchEvent(new CustomEvent(AUTH_SYNC_EVENT, { detail: { type: 'login' } }))

      return Promise.resolve()
    } catch (error) {
      console.error('Error during login:', error)
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
        localStorage.setItem('auth-logout', 'true')
      } catch (e) {
        console.warn('LocalStorage not available')
      }

      // Disparar evento de sincronización
      window.dispatchEvent(new CustomEvent(AUTH_SYNC_EVENT, { detail: { type: 'logout' } }))

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
    setIsLoading(true)
    try {
      const { user: freshUser } = await getMe(true)
      setUser(freshUser)
      return Promise.resolve()
    } catch (error) {
      console.error('Error refreshing user:', error)
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
