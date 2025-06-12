/**
 * NavigationGuard - Centralized navigation and access control
 *
 * This component provides consistent navigation flow and access control
 * across the application, ensuring users are properly authenticated
 * and have appropriate permissions for protected routes.
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { Loader2, AlertCircle, Home, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface NavigationGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'contractor' | 'client' | 'any'
  redirectTo?: string
  allowAnonymous?: boolean
}

/**
 * NavigationGuard - Protects routes based on authentication and role
 *
 * @param children - Components to render if access is granted
 * @param requiredRole - Required user role for access
 * @param redirectTo - Custom redirect URL for unauthorized access
 * @param allowAnonymous - Whether anonymous users can access this route
 * @returns JSX element with appropriate access control
 */
export const NavigationGuard: React.FC<NavigationGuardProps> = ({
  children,
  requiredRole = 'any',
  redirectTo,
  allowAnonymous = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [accessDenied, setAccessDenied] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoading) return

    setIsChecking(true)

    // Allow anonymous access if explicitly permitted
    if (allowAnonymous) {
      setAccessDenied(false)
      setIsChecking(false)
      return
    }

    // Check authentication requirement
    if (!isAuthenticated) {
      console.log('🚫 NavigationGuard: User not authenticated, redirecting to login')
      const loginPath = pathname.includes('/contractor') ? '/contractor/login' : '/login'
      const redirectUrl = `${loginPath}?returnTo=${encodeURIComponent(pathname)}`

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push(redirectUrl)
      }
      return
    }

    // Check role requirement with admin exceptions
    if (requiredRole !== 'any' && user?.role !== requiredRole) {
      // Admins and superadmins can access most roles (except contractor-specific areas)
      const canAdminAccess =
        ['admin', 'superadmin'].includes(user?.role || '') && requiredRole !== 'contractor'

      if (!canAdminAccess) {
        console.log(
          `🚫 NavigationGuard: User role '${user?.role}' doesn't match required '${requiredRole}'`,
        )
        setAccessDenied(true)
        setIsChecking(false)
        return
      } else {
        console.log(
          `✅ NavigationGuard: Admin '${user?.role}' granted access to '${requiredRole}' area`,
        )
      }
    }

    // All checks passed
    setAccessDenied(false)
    setIsChecking(false)
  }, [isAuthenticated, user, isLoading, requiredRole, pathname, router, redirectTo, allowAnonymous])

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                {getAccessDeniedMessage(user?.role, requiredRole)}
              </p>
            </div>

            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>

              {getAlternativeRouteButton(user?.role, router)}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}

/**
 * Get appropriate access denied message based on user role and requirements
 */
function getAccessDeniedMessage(userRole?: string, requiredRole?: string): string {
  if (!userRole) return 'No tienes permisos para acceder a esta página.'

  switch (requiredRole) {
    case 'admin':
      return 'Esta página es solo para administradores.'
    case 'contractor':
      return 'Esta página es solo para contratistas.'
    case 'client':
      return 'Esta página es solo para clientes.'
    default:
      return `Tu rol de '${userRole}' no tiene permisos para acceder a esta página.`
  }
}

/**
 * Get alternative route button based on user role
 */
function getAlternativeRouteButton(userRole?: string, router?: any): React.ReactNode {
  if (!userRole || !router) return null

  switch (userRole) {
    case 'contractor':
      return (
        <Button
          variant="outline"
          onClick={() => router.push('/contractor/dashboard')}
          className="w-full"
        >
          Dashboard de Contratista
        </Button>
      )
    case 'admin':
    case 'superadmin':
      return (
        <Button variant="outline" onClick={() => router.push('/admin')} className="w-full">
          Panel de Administración
        </Button>
      )
    case 'client':
      return (
        <Button
          variant="outline"
          onClick={() => router.push('/request-service/dashboard')}
          className="w-full"
        >
          Dashboard de Cliente
        </Button>
      )
    default:
      return (
        <Button variant="outline" onClick={() => router.push('/login')} className="w-full">
          <LogIn className="h-4 w-4 mr-2" />
          Iniciar Sesión
        </Button>
      )
  }
}

export default NavigationGuard
