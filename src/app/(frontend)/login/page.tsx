'use client'

/**
 * Login Page
 *
 * Implementa login directo a través de la API de Payload
 * y maneja las redirecciones según el rol del usuario.
 */
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

// Componente principal
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}

// Esqueleto de carga
function LoginFormSkeleton() {
  return (
    <div className="container mx-auto py-12 max-w-md">
      <div className="bg-card rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-foreground dark:text-white">Iniciar sesión</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-1/3 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-1/3 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Componente de formulario que usa hooks client-side
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')

  const { login, isAuthenticated, user, isLoading } = useAuth()
  const [email, setEmail] = useState(emailParam || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado y redirigir
  useEffect(() => {
    if (isAuthenticated && user && !isLoading && !loading) {
      console.log('🔍 User is already authenticated, redirecting...')

      // Determinar ruta de redirección
      let redirectPath = '/'
      if (user.role === 'admin' || user.role === 'superadmin') {
        redirectPath = '/admin'
      }

      // Usar window.location.href para consistencia con logout
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
    }
  }, [isAuthenticated, user, isLoading, loading])

  // Si recibimos un nuevo valor del parámetro email, actualizamos el estado
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [emailParam])

  // Función para manejar el login directo
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

      // PayloadCMS login endpoint returns user data and token
      const userData = await response.json()
      console.log(
        '✅ Login successful, user data received:',
        userData.user ? userData.user.email : 'No user data',
      )

      // PayloadCMS handles authentication with cookies automatically
      console.log('🔑 Login successful, handling session and redirect...')

      // Verificar si hay una solicitud pendiente en sessionStorage
      let pendingRequest = null
      try {
        const pendingRequestStr = sessionStorage.getItem('msh_pending_request')
        if (pendingRequestStr) {
          pendingRequest = JSON.parse(pendingRequestStr)
          console.log('Encontrada solicitud pendiente después de login:', pendingRequest)
          // Limpiar después de procesarlo
          sessionStorage.removeItem('msh_pending_request')
        }
      } catch (e) {
        console.error('Error procesando solicitud pendiente:', e)
      }

      // Notificar al AuthProvider sobre el login
      await login()

      // Determinar la ruta de redirección
      let redirectPath = '/'
      if (pendingRequest && pendingRequest.returnPath) {
        redirectPath = pendingRequest.returnPath
      } else if (
        userData.user &&
        (userData.user.role === 'admin' || userData.user.role === 'superadmin')
      ) {
        redirectPath = '/admin'
      }

      console.log('🚀 Redirecting to:', redirectPath)

      // Hacer un refresh completo de la aplicación, similar al logout
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  // Función para redirigir administradores al panel admin
  const redirectToAdminLogin = () => {
    router.push('/admin')
  }

  return (
    <div className="container mx-auto py-12 max-w-md bg-background text-foreground dark:text-white">
      <div className="bg-card rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>

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
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-muted-foreground mb-4 text-sm">¿Eres administrador o contratista?</p>
          <Button onClick={redirectToAdminLogin} variant="outline" className="w-full">
            Ir al panel de administración
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
