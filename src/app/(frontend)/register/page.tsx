'use client'

/**
 * Register Page
 *
 * Permite a los usuarios registrarse directamente en la aplicación.
 * Implementa un formulario de registro que crea un usuario a través de la API de Payload.
 */
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

export default function RegisterPage() {
  const router = useRouter()
  const { login, isAuthenticated, user, isLoading } = useAuth()
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      // Redireccionar según rol
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, user, router, isLoading])

  // Función para manejar el registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          lastName: lastName,
          email: email,
          phoneNumber: phoneNumber,
          password: password,
          confirmPassword: confirmPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Error al registrar usuario')
      }

      const userData = await response.json()

      // Iniciar sesión automáticamente
      const loginResponse = await fetch('/api/users/login', {
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

      if (loginResponse.ok) {
        // Obtener el token del login
        const loginData = await loginResponse.json()

        // Actualizar estado de autenticación usando el provider
        await login(loginData.token)

        // Redirigir a la página principal
        router.push('/')
      } else {
        // Registro exitoso pero login falló, redirigir a login
        router.push('/login')
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  // Función para redirigir al admin para registro (solo admin/contractors)
  const redirectToAdminRegister = () => {
    router.push('/admin/create-first-user')
  }

  return (
    <div className="container mx-auto py-12 max-w-md">
      <div className="bg-card rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Crear una cuenta</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <Label htmlFor="phoneNumber">Teléfono</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="123-456-7890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            ¿Eres contratista o quieres registrarte como administrador?
          </p>
          <Button onClick={redirectToAdminRegister} variant="outline" className="w-full">
            Ir al registro del panel de administración
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
