'use client'

/**
 * Contractor Register Page
 *
 * Permite a los contratistas registrarse directamente en la aplicación.
 * Implementa un formulario de registro especializado para contratistas
 * que crea un usuario con rol de contratista a través de la API de Payload.
 */
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceRequestStore } from '@/store/serviceRequestStore'
import { Button } from '@/components/ui/button'
import { getMe, invalidateUserCache } from '@/lib/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Wrench, Check } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ContractorRegisterPage() {
  const router = useRouter()
  const { resetContext, setUserEmail, setIsAuthenticated } = useServiceRequestStore()
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [yearsExperience, setYearsExperience] = useState('')
  const [hasLicense, setHasLicense] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      const { user } = await getMe()
      if (user) {
        setUserEmail(user.email)
        setIsAuthenticated(true)

        // Redireccionar según rol
        if (user.role === 'admin' || user.role === 'superadmin') {
          router.push('/admin')
        } else if (user.role === 'contractor') {
          router.push('/contractor/dashboard')
        } else {
          // Si es cliente, mostrar error y redirigir
          setError('Esta página es solo para contratistas')
          setTimeout(() => {
            router.push('/register')
          }, 3000)
        }
      }
    }

    checkAuthentication()
  }, [router, setUserEmail, setIsAuthenticated])

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

    if (services.length === 0) {
      setError('Debes seleccionar al menos un servicio')
      setLoading(false)
      return
    }

    if (!yearsExperience || parseInt(yearsExperience) < 0) {
      setError('Los años de experiencia deben ser un número válido')
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
          role: 'contractor', // Asignar rol de contratista
          contractorFields: {
            services: services,
            yearsExperience: parseInt(yearsExperience),
            hasLicense: hasLicense,
            rating: 0, // Valor inicial
            reviewCount: 0, // Valor inicial
            isVerified: false, // Inicialmente no verificado
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Error al registrar contratista')
      }

      const userData = await response.json()

      // Invalidar caché para forzar una recarga de los datos del usuario
      invalidateUserCache()

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
        // Registro y login exitoso
        setUserEmail(email)
        setIsAuthenticated(true)
        router.push('/contractor/dashboard')
      } else {
        // Registro exitoso pero login falló, redirigir a login
        router.push('/contractor/login')
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrar contratista')
    } finally {
      setLoading(false)
    }
  }

  // Lista de servicios disponibles para ofrecer
  const availableServices = [
    { label: 'Plomería', value: 'plumbing' },
    { label: 'Electricidad', value: 'electrical' },
    { label: 'Vidrios', value: 'glass' },
    { label: 'HVAC', value: 'hvac' },
    { label: 'Control de Plagas', value: 'pests' },
    { label: 'Cerrajería', value: 'locksmith' },
    { label: 'Techado', value: 'roofing' },
    { label: 'Revestimiento', value: 'siding' },
    { label: 'Reparaciones Generales', value: 'general' },
  ]

  // Función para manejar selección/deselección de servicios
  const toggleService = (value: string) => {
    setServices((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    )
  }

  return (
    <div className="container mx-auto py-12 max-w-2xl dark:text-white dark:bg-background">
      <div className="bg-card rounded-lg border p-8 shadow-sm">
        <div className="flex items-center justify-center mb-6">
          <Wrench className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold">Registro de Contratista</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
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
            <Label>Servicios ofrecidos</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableServices.map((service) => (
                <div key={service.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.value}`}
                    checked={services.includes(service.value)}
                    onCheckedChange={() => toggleService(service.value)}
                  />
                  <Label htmlFor={`service-${service.value}`} className="cursor-pointer">
                    {service.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Años de experiencia</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2 h-10">
                <Checkbox
                  id="hasLicense"
                  checked={hasLicense}
                  onCheckedChange={(checked) => setHasLicense(checked === true)}
                />
                <Label htmlFor="hasLicense" className="cursor-pointer">
                  Tengo licencia profesional
                </Label>
              </div>
            </div>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme como contratista'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/contractor/login" className="text-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>

        <p className="text-sm text-muted-foreground text-center mt-2">
          ¿Eres cliente?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate como cliente
          </Link>
        </p>
      </div>
    </div>
  )
}
