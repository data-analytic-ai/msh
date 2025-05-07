/**
 * AuthProvider
 *
 * Global authentication provider that manages user authentication state
 * and provides login/logout functionality across the application.
 */
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getMe, invalidateUserCache } from '@/lib/auth'
import { User } from '@/payload-types'
import { useRouter } from 'next/navigation'

// Define authentication context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
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

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)
        const { user: userData } = await getMe()
        setUser(userData)
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
        setUser(null)
        localStorage.removeItem('auth-logout')
      } else if (event.key === 'auth-login' && event.newValue === 'true') {
        // Otra pestaña ha iniciado sesión, actualizar este contexto
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

  // Login method - sets token in cookie (handled by Payload) and updates user state
  const login = async (token: string) => {
    try {
      // After login, the token is already stored in cookies by Payload
      // We just need to refresh the user data
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

      // Call the logout endpoint to clear cookies
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Error logging out')
      }

      // Clear local user state
      setUser(null)
      invalidateUserCache()

      // Informar a otras pestañas
      localStorage.setItem('auth-logout', 'true')

      // Disparar evento de sincronización
      window.dispatchEvent(new CustomEvent(AUTH_SYNC_EVENT, { detail: { type: 'logout' } }))

      // Redirigir a la página principal
      router.push('/')
      router.refresh()

      return Promise.resolve()
    } catch (error) {
      console.error('Error during logout:', error)
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
