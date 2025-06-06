'use client'

/**
 * Contractor Login Page
 *
 * Implementa login exclusivo para contratistas a través de la API de Payload.
 * Verifica que el usuario tenga el rol de contratista y redirige al dashboard.
 */
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequestStore } from '@/store/serviceRequestStore'
import { Button } from '@/components/ui/button'
import { getMe, invalidateUserCache } from '@/lib/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Wrench } from 'lucide-react'

export default function ContractorLoginPage() {
  const router = useRouter()
  const { resetContext, setUserEmail, setIsAuthenticated } = useServiceRequestStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Limpia el estado al cargar la página y verifica autenticación existente
  useEffect(() => {
    resetContext()

    const checkAuthentication = async () => {
      const { user } = await getMe()
      if (user) {
        setUserEmail(user.email)
        setIsAuthenticated(true)

        // Si es contratista, redirigir a su dashboard
        if (user.role === 'contractor') {
          router.push('/contractor/dashboard')
        } else if (user.role === 'admin' || user.role === 'superadmin') {
          // Administradores también pueden acceder al panel de contratistas
          router.push('/admin')
        } else {
          // Si es cliente, mostrar error y redirigir a login de clientes
          setError('Esta página es solo para contratistas')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      }
    }

    checkAuthentication()
  }, [resetContext, router, setUserEmail, setIsAuthenticated])

  // Función para manejar el login de contratistas
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        // Try to parse error response only if there's content
        let errorMessage = 'Error al iniciar sesión'
        try {
          const errorData = await response.json()
          errorMessage = errorData.errors?.[0]?.message || errorData.message || errorMessage
        } catch (jsonError) {
          // If JSON parsing fails, use default message
          console.warn('Failed to parse error response as JSON:', jsonError)
        }
        throw new Error(errorMessage)
      }

      // Try to parse JSON response, but handle empty responses
      let userData = { user: { role: null } }
      try {
        const responseText = await response.text()
        if (responseText && responseText.trim() !== '') {
          userData = JSON.parse(responseText)
        } else {
          // Empty response is OK for PayloadCMS cookie-based auth
          console.log('Empty response from login, will verify user role after login')
        }
      } catch (jsonError) {
        console.warn(
          'Failed to parse login response as JSON, will verify user role after login:',
          jsonError,
        )
      }

      // Check user role only if we have it from response, otherwise check after login
      if (
        userData.user?.role &&
        userData.user.role !== 'contractor' &&
        userData.user.role !== 'admin' &&
        userData.user.role !== 'superadmin'
      ) {
        throw new Error('Esta página es solo para contratistas')
      }

      // Invalidar caché para forzar una recarga de los datos del usuario
      invalidateUserCache()

      // Autenticación exitosa
      setUserEmail(email)
      setIsAuthenticated(true)

      // If we don't have user data from response, we need to fetch it after login
      if (!userData.user?.role) {
        // Let the effect handle redirect based on user data from getMe()
        // The useEffect will check authentication and redirect appropriately
        return
      }

      // Redirigir según el rol (only if we have role data)
      if (userData.user.role === 'contractor') {
        router.push('/contractor/dashboard') // Contratistas van a su dashboard
      } else if (userData.user.role === 'admin' || userData.user.role === 'superadmin') {
        router.push('/admin') // Administradores van al panel de admin
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 max-w-md dark:text-white">
      <div className="bg-card rounded-lg border p-8 shadow-sm">
        <div className="flex items-center justify-center mb-6">
          <Wrench className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold">Portal de Contratistas</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión como contratista'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta de contratista?{' '}
            <Link href="/contractor/register" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <p className="text-sm text-muted-foreground mt-4">
            ¿Eres cliente?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Ir al login de clientes
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
