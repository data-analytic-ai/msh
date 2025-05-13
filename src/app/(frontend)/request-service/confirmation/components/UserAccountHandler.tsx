/**
 * UserAccountHandler
 *
 * Componente para manejar la creación de cuenta o inicio de sesión
 * en la página de confirmación de solicitud de servicio.
 */
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, KeyRound, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'

interface UserAccountHandlerProps {
  userEmail: string | null
  requestId: string | null
}

export const UserAccountHandler: React.FC<UserAccountHandlerProps> = ({ userEmail }) => {
  const { login, isAuthenticated } = useAuth()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)
  const [userExists, setUserExists] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState(userEmail || '')

  // Verificar si el usuario ya existe al cargar el componente
  useEffect(() => {
    const checkUserExists = async () => {
      // Si el usuario ya está autenticado o no hay email, no necesitamos verificar
      if (isAuthenticated || !userEmail) {
        setIsCheckingUser(false)
        return
      }

      try {
        const response = await fetch(`/api/user-exists?email=${encodeURIComponent(userEmail)}`)

        if (!response.ok) {
          throw new Error('Error verificando usuario')
        }

        const data = await response.json()
        setUserExists(data.exists)

        // Mostrar formulario de login directamente si el usuario existe
        if (data.exists) {
          setShowLoginForm(true)
          setEmail(userEmail)
        }
      } catch (error) {
        console.error('Error verificando usuario:', error)
      } finally {
        setIsCheckingUser(false)
      }
    }

    checkUserExists()

    // Actualizar el email en el estado local cuando cambia el prop
    if (userEmail) {
      setEmail(userEmail)
    }
  }, [userEmail, isAuthenticated])

  // Mostrar formulario de login interno
  const handleShowLoginForm = () => {
    setShowLoginForm(true)
    setLoginError(null)
  }

  // Realizar login directamente desde el componente
  const handleDirectLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!email) return

    setIsLoggingIn(true)
    setLoginError(null)

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

      // Actualizar estado de autenticación usando el provider
      await login(userData.token)

      // No necesitamos sessionStorage aquí porque ya estamos en la página correcta
      console.log('Inicio de sesión exitoso')
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Crear cuenta si el usuario no existe
  const handleCreateAccount = async () => {
    if (!termsAccepted || !userEmail) return

    setIsCreatingAccount(true)
    setLoginError(null)

    try {
      // Llamar al API para crear una cuenta basada en el email
      const response = await fetch(`/api/user-requests?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error creating account:', errorText)
        throw new Error('Error al crear cuenta: ' + errorText)
      }

      const data = await response.json()

      // Verificar si se recibió información de usuario y token
      if (data.userToken && data.isNewUser && data.tempPassword) {
        // Guardar token y actualizar estado de autenticación global
        await login(data.userToken)

        // Mostrar contraseña temporal
        setTempPassword(data.tempPassword)

        // Mostrar también el formulario de login después de crear la cuenta
        setShowLoginForm(true)
        setEmail(userEmail)

        console.log('Cuenta creada exitosamente:', data)
      } else {
        console.log('Resultado inesperado:', data)
        setUserExists(true)
        setShowLoginForm(true)
      }
    } catch (error) {
      console.error('Error al crear cuenta:', error)
      setLoginError(
        `Error al crear cuenta: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    } finally {
      setIsCreatingAccount(false)
    }
  }

  // Si el usuario ya está autenticado, no mostramos nada
  if (isAuthenticated || !userEmail) {
    return null
  }

  // Si estamos comprobando, mostrar estado de carga
  if (isCheckingUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="ml-2">Verificando usuario...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar formulario de login
  const renderLoginForm = () => (
    <form onSubmit={handleDirectLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={!!userEmail} // Deshabilitar si se proporciona email desde props
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
          autoFocus={tempPassword !== null} // Autofocus cuando se muestra después de crear cuenta
        />
      </div>

      {loginError && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle size={16} />
          <span>{loginError}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoggingIn}>
        {isLoggingIn ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            Iniciando sesión...
          </span>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  )

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {userExists || showLoginForm ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground">
            {userExists || showLoginForm
              ? 'Inicia sesión para continuar con tu solicitud de servicio.'
              : 'Crea una cuenta para seguir el estado de tus solicitudes, recibir actualizaciones y conectar con contratistas.'}
          </p>

          {loginError && !showLoginForm && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">{loginError}</div>
          )}

          {tempPassword && !showLoginForm ? (
            <div className="bg-primary/10 p-4 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span className="font-medium">Tu contraseña temporal</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 text-xs"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>

              {showPassword ? (
                <div className="flex items-center gap-2">
                  <Input readOnly value={tempPassword} className="bg-background font-mono" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword || '')
                      alert('Contraseña copiada al portapapeles')
                    }}
                    className="whitespace-nowrap"
                  >
                    Copiar
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Haz clic en &quot;Mostrar&quot; para ver tu contraseña
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Puedes cambiar esta contraseña después de iniciar sesión por primera vez.
              </p>

              <Button onClick={handleShowLoginForm} className="w-full mt-2">
                Iniciar sesión ahora
              </Button>
            </div>
          ) : showLoginForm ? (
            renderLoginForm()
          ) : userExists ? (
            <div className="space-y-3">
              <Button onClick={handleShowLoginForm} className="w-full" disabled={isCreatingAccount}>
                {isCreatingAccount ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Procesando...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  Acepto los{' '}
                  <Link href="/terms" className="text-primary underline">
                    Términos de Servicio
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacy" className="text-primary underline">
                    Política de Privacidad
                  </Link>
                </Label>
              </div>

              <Button
                disabled={!termsAccepted || isCreatingAccount}
                onClick={handleCreateAccount}
                className="w-full"
              >
                {isCreatingAccount ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
