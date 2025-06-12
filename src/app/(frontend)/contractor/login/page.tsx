'use client'

/**
 * Contractor Login Page
 *
 * Implementa login exclusivo para contratistas a través de la API de Payload.
 * Verifica que el usuario tenga el rol de contratista y redirige al dashboard.
 */
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Wrench } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

export default function ContractorLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado y redirigir
  useEffect(() => {
    if (isAuthenticated && user && !isLoading && !loading) {
      console.log('🔍 User is already authenticated, redirecting...')

      // Determinar ruta de redirección
      let redirectPath = '/'
      if (user.role === 'contractor') {
        redirectPath = '/contractor/dashboard'
      } else if (user.role === 'admin' || user.role === 'superadmin') {
        redirectPath = '/admin'
      } else {
        // Si es cliente, mostrar error y redirigir a login de clientes
        setError('Esta página es solo para contratistas')
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }, 3000)
        return
      }

      // Usar window.location.href para consistencia con flujo de clientes
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
    }
  }, [isAuthenticated, user, isLoading, loading])

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

      // Check user role only if we have it from response
      if (
        userData.user?.role &&
        userData.user.role !== 'contractor' &&
        userData.user.role !== 'admin' &&
        userData.user.role !== 'superadmin'
      ) {
        throw new Error('Esta página es solo para contratistas')
      }

      console.log(
        '✅ Login successful, user data received:',
        userData.user && 'email' in userData.user ? userData.user.email : 'No user data',
      )

      console.log('🔑 Login successful, handling session and redirect...')

      // Notificar al AuthProvider sobre el login (esto actualizará el estado global)
      await login()

      // Determinar la ruta de redirección
      let redirectPath = '/contractor/dashboard'
      if (userData.user?.role === 'admin' || userData.user?.role === 'superadmin') {
        redirectPath = '/admin'
      }

      console.log('🚀 Redirecting to:', redirectPath)

      // Hacer un refresh completo de la aplicación, igual que en el flujo de clientes
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
    } catch (err: any) {
      console.error('❌ Login error:', err)
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

          <Button type="submit" className="w-full" disabled={loading || isLoading}>
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
