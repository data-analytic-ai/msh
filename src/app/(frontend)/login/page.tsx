'use client'

/**
 * Login Page
 *
 * Implementa login directo a través de la API de Payload
 * y maneja las redirecciones según el rol del usuario.
 */
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequest } from '@/context/ServiceRequestContext'
import { Button } from '@/components/ui/button'
import { getMe, invalidateUserCache } from '@/lib/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { resetContext, setUserEmail, setIsAuthenticated } = useServiceRequest()
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

        // Si es admin o contratista, redirigir a admin panel
        if (user.role === 'admin' || user.role === 'superadmin') {
          router.push('/admin')
        } else {
          // Si es cliente, redirigir a la página principal
          router.push('/')
        }
      }
    }

    checkAuthentication()
  }, [resetContext, router, setUserEmail, setIsAuthenticated])

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
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Error al iniciar sesión')
      }

      const userData = await response.json()

      // Invalidar caché para forzar una recarga de los datos del usuario
      invalidateUserCache()

      // Autenticación exitosa
      setUserEmail(email)
      setIsAuthenticated(true)

      // Redirigir según el rol
      if (userData.user.role === 'admin' || userData.user.role === 'superadmin') {
        router.push('/admin') // Roles administrativos van al panel
      } else {
        router.push('/') // Clientes van a la página principal
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  // Función para redirigir administradores al panel admin
  const redirectToAdminLogin = () => {
    router.push('/admin')
  }

  return (
    <div className="container mx-auto py-12 max-w-md">
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

          <Button type="submit" className="w-full" disabled={loading}>
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
