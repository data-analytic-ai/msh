/**
 * useNavigation - Centralized navigation logic hook
 *
 * Provides consistent navigation patterns based on user authentication
 * status and role, ensuring proper redirects and access control.
 */

import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useCallback } from 'react'

interface NavigationOptions {
  replace?: boolean
  preserveQuery?: boolean
}

interface UseNavigationReturn {
  navigateToHome: (options?: NavigationOptions) => void
  navigateToDashboard: (options?: NavigationOptions) => void
  navigateToLogin: (returnTo?: string, options?: NavigationOptions) => void
  navigateToProfile: (options?: NavigationOptions) => void
  navigateBasedOnRole: (options?: NavigationOptions) => void
  canAccess: (route: string, requiredRole?: string) => boolean
  getDefaultRoute: () => string
}

/**
 * useNavigation - Custom hook for consistent navigation patterns
 *
 * Provides navigation utilities that automatically consider user
 * authentication status and role for appropriate routing.
 *
 * @returns Navigation utilities and route access checks
 */
export const useNavigation = (): UseNavigationReturn => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  /**
   * Navigate to home page
   */
  const navigateToHome = useCallback(
    (options: NavigationOptions = {}) => {
      const method = options.replace ? 'replace' : 'push'
      router[method]('/')
    },
    [router],
  )

  /**
   * Navigate to appropriate dashboard based on user role
   */
  const navigateToDashboard = useCallback(
    (options: NavigationOptions = {}) => {
      if (!isAuthenticated || !user) {
        navigateToLogin(undefined, options)
        return
      }

      const method = options.replace ? 'replace' : 'push'

      switch (user.role) {
        case 'admin':
        case 'superadmin':
          router[method]('/admin')
          break
        case 'contractor':
          router[method]('/contractor/dashboard')
          break
        case 'client':
          router[method]('/dashboard')
          break
        default:
          router[method]('/')
      }
    },
    [router, isAuthenticated, user],
  )

  /**
   * Navigate to appropriate login page
   */
  const navigateToLogin = useCallback(
    (returnTo?: string, options: NavigationOptions = {}) => {
      const method = options.replace ? 'replace' : 'push'
      let loginPath = '/login'

      // Determine appropriate login page based on context
      if (returnTo?.includes('/contractor')) {
        loginPath = '/contractor/login'
      }

      // Add return path if provided
      if (returnTo) {
        loginPath += `?returnTo=${encodeURIComponent(returnTo)}`
      }

      router[method](loginPath)
    },
    [router],
  )

  /**
   * Navigate to user profile page
   */
  const navigateToProfile = useCallback(
    (options: NavigationOptions = {}) => {
      if (!isAuthenticated || !user) {
        navigateToLogin(undefined, options)
        return
      }

      const method = options.replace ? 'replace' : 'push'

      switch (user.role) {
        case 'contractor':
          router[method]('/contractor/profile')
          break
        case 'admin':
        case 'superadmin':
          router[method]('/admin/account')
          break
        case 'client':
          router[method]('/user/profile')
          break
        default:
          router[method]('/user/profile')
      }
    },
    [router, isAuthenticated, user],
  )

  /**
   * Navigate based on user role (smart routing)
   */
  const navigateBasedOnRole = useCallback(
    (options: NavigationOptions = {}) => {
      if (!isAuthenticated || !user) {
        navigateToHome(options)
        return
      }

      navigateToDashboard(options)
    },
    [isAuthenticated, user, navigateToHome, navigateToDashboard],
  )

  /**
   * Check if user can access a specific route
   */
  const canAccess = useCallback(
    (route: string, requiredRole?: string): boolean => {
      // Public routes are always accessible
      const publicRoutes = ['/', '/login', '/register', '/contractor/login', '/services']
      if (publicRoutes.some((publicRoute) => route === publicRoute)) {
        return true
      }

      // Protected routes require authentication
      if (!isAuthenticated || !user) {
        return false
      }

      // If no specific role required, authenticated users can access
      if (!requiredRole) {
        return true
      }

      // Check role-specific access
      switch (requiredRole) {
        case 'admin':
          return ['admin', 'superadmin'].includes(user.role)
        case 'contractor':
          return user.role === 'contractor' || ['admin', 'superadmin'].includes(user.role)
        case 'client':
          return user.role === 'client' || ['admin', 'superadmin'].includes(user.role)
        default:
          return true
      }
    },
    [isAuthenticated, user],
  )

  /**
   * Get default route for current user
   */
  const getDefaultRoute = useCallback((): string => {
    if (!isAuthenticated || !user) {
      return '/'
    }

    switch (user.role) {
      case 'admin':
      case 'superadmin':
        return '/admin'
      case 'contractor':
        return '/contractor/dashboard'
      case 'client':
        return '/dashboard'
      default:
        return '/'
    }
  }, [isAuthenticated, user])

  return {
    navigateToHome,
    navigateToDashboard,
    navigateToLogin,
    navigateToProfile,
    navigateBasedOnRole,
    canAccess,
    getDefaultRoute,
  }
}

export default useNavigation
