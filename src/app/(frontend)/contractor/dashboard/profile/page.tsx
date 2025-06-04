'use client'

/**
 * ContractorProfile - Complete contractor profile management page
 *
 * Allows contractors to edit their personal information, business details,
 * services offered, payment configuration (Stripe), and notification preferences.
 * Fully integrated with PayloadCMS for data persistence.
 *
 * @returns {JSX.Element} Contractor profile management interface
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Building2,
  Wrench,
  CreditCard,
  Bell,
  Save,
  Upload,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Menu,
} from 'lucide-react'
import { getMe } from '@/lib/auth'
import { useStripeIntegration } from '../hooks/useStripeIntegration'
import { useMobileMenu } from '../layout'

// Types for contractor profile data
interface ContractorProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string

  // Business Information
  businessName?: string
  businessType?: string
  businessLicense?: string
  businessAddress?: string
  businessCity?: string
  businessState?: string
  businessZip?: string
  taxId?: string
  yearsOfExperience?: number

  // Services and Specializations
  services: string[]
  specializations?: string[]
  serviceRadius?: number
  hourlyRate?: number
  minimumJobValue?: number

  // Payment Configuration
  stripeAccountId?: string
  bankAccountVerified?: boolean
  paymentMethodsAccepted?: string[]

  // Profile Settings
  isAvailable?: boolean
  autoAcceptJobs?: boolean
  notificationPreferences?: {
    email: boolean
    sms: boolean
    push: boolean
    newJobs: boolean
    jobUpdates: boolean
    payments: boolean
  }

  // Statistics
  rating?: number
  reviewCount?: number
  completedJobs?: number
  verified?: boolean
}

// Available services list
const AVAILABLE_SERVICES = [
  { value: 'plumbing', label: 'Plomería' },
  { value: 'electrical', label: 'Electricidad' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Techado' },
  { value: 'painting', label: 'Pintura' },
  { value: 'flooring', label: 'Pisos' },
  { value: 'carpentry', label: 'Carpintería' },
  { value: 'landscaping', label: 'Paisajismo' },
  { value: 'cleaning', label: 'Limpieza' },
  { value: 'locksmith', label: 'Cerrajería' },
  { value: 'glass', label: 'Vidrios' },
  { value: 'pests', label: 'Control de Plagas' },
  { value: 'general', label: 'Reparaciones Generales' },
]

export default function ContractorProfile() {
  const router = useRouter()
  const { openMobileMenu } = useMobileMenu()
  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Stripe integration hook
  const {
    isConnecting,
    isLoading: stripeLoading,
    error: stripeError,
    stripeAccount,
    connectStripeAccount,
    getStripeAccountStatus,
    createStripeLoginLink,
  } = useStripeIntegration()

  // Load contractor profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const { user } = await getMe()

        if (!user) {
          router.push('/contractor/login')
          return
        }

        if (user.role !== 'contractor' && user.role !== 'admin' && user.role !== 'superadmin') {
          router.push('/login')
          return
        }

        // Transform user data to profile format
        const profileData = {
          id: user.id,
          firstName: (user as any).firstName || '',
          lastName: (user as any).lastName || '',
          email: user.email || '',
          phone: (user as any).phone || '',
          avatar: (user as any).avatar?.url || '',

          businessName: (user as any).businessName || '',
          businessType: (user as any).businessType || '',
          businessLicense: (user as any).businessLicense || '',
          businessAddress: (user as any).businessAddress || '',
          businessCity: (user as any).businessCity || '',
          businessState: (user as any).businessState || '',
          businessZip: (user as any).businessZip || '',
          taxId: (user as any).taxId || '',
          yearsOfExperience: (user as any).yearsOfExperience || 0,

          services: (user as any).services || [],
          specializations: (user as any).specializations?.map((s: any) => s.specialization) || [],
          serviceRadius: (user as any).serviceRadius || 25,
          hourlyRate: (user as any).hourlyRate || 0,
          minimumJobValue: (user as any).minimumJobValue || 0,

          stripeAccountId: (user as any).stripeAccountId || '',
          bankAccountVerified: (user as any).bankAccountVerified || false,
          paymentMethodsAccepted: (user as any).paymentMethodsAccepted || ['card'],

          isAvailable: (user as any).isAvailable !== false,
          autoAcceptJobs: (user as any).autoAcceptJobs || false,
          notificationPreferences: (user as any).notificationPreferences || {
            email: true,
            sms: false,
            push: true,
            newJobs: true,
            jobUpdates: true,
            payments: true,
          },

          rating: (user as any).rating || 0,
          reviewCount: (user as any).reviewCount || 0,
          completedJobs: (user as any).completedJobs || 0,
          verified: (user as any).verified || false,
        }

        setProfile(profileData)

        // Load Stripe account status if account exists
        if ((user as any).stripeAccountId) {
          await getStripeAccountStatus((user as any).stripeAccountId)
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Error al cargar el perfil')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router, getStripeAccountStatus])

  // Handle Stripe connection
  const handleConnectStripe = async () => {
    if (!profile) return

    try {
      const accountLinkUrl = await connectStripeAccount(profile.id)
      if (accountLinkUrl) {
        // Redirect to Stripe onboarding
        window.location.href = accountLinkUrl
      }
    } catch (err) {
      setError('Error al conectar con Stripe')
    }
  }

  // Handle Stripe dashboard access
  const handleStripeLogin = async () => {
    if (!profile?.stripeAccountId) return

    try {
      const loginUrl = await createStripeLoginLink(profile.stripeAccountId)
      if (loginUrl) {
        window.open(loginUrl, '_blank')
      }
    } catch (err) {
      setError('Error al acceder al dashboard de Stripe')
    }
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      setError(null)

      // Map profile data to user fields
      const userData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,

        // Business Information
        businessName: profile.businessName,
        businessType: profile.businessType,
        businessLicense: profile.businessLicense,
        businessAddress: profile.businessAddress,
        businessCity: profile.businessCity,
        businessState: profile.businessState,
        businessZip: profile.businessZip,
        taxId: profile.taxId,
        yearsOfExperience: profile.yearsOfExperience,

        // Services
        services: profile.services,
        specializations: profile.specializations?.map((s) => ({ specialization: s })) || [],
        serviceRadius: profile.serviceRadius,
        hourlyRate: profile.hourlyRate,
        minimumJobValue: profile.minimumJobValue,

        // Payment
        stripeAccountId: profile.stripeAccountId,
        bankAccountVerified: profile.bankAccountVerified,
        paymentMethodsAccepted: profile.paymentMethodsAccepted,

        // Settings
        isAvailable: profile.isAvailable,
        autoAcceptJobs: profile.autoAcceptJobs,
        notificationPreferences: profile.notificationPreferences,

        // Status fields (these should be read-only but include for completeness)
        rating: profile.rating,
        reviewCount: profile.reviewCount,
        completedJobs: profile.completedJobs,
        verified: profile.verified,
      }

      const response = await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al guardar el perfil')
      }

      setSuccessMessage('Perfil actualizado correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof ContractorProfile, value: any) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  // Handle service toggle
  const handleServiceToggle = (serviceValue: string) => {
    setProfile((prev) => {
      if (!prev) return null
      const services = prev.services.includes(serviceValue)
        ? prev.services.filter((s) => s !== serviceValue)
        : [...prev.services, serviceValue]
      return { ...prev, services }
    })
  }

  // Handle notification preference change
  const handleNotificationChange = (key: string, value: boolean) => {
    setProfile((prev) => {
      if (!prev) return null
      return {
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences!,
          [key]: value,
        },
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error al cargar el perfil</h2>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Administra tu información personal y de negocio</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile Menu Button - Only visible on mobile */}
          <Button variant="outline" size="icon" onClick={openMobileMenu} className="md:hidden">
            <Menu className="w-4 h-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>

          {/* Save Button */}
          <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 sm:flex-none">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">Guardar cambios</span>
            <span className="sm:hidden">Guardar</span>
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-800 dark:text-green-200">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto sm:h-10">
          <TabsTrigger
            value="personal"
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-2"
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Personal</span>
          </TabsTrigger>
          <TabsTrigger
            value="business"
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-2"
          >
            <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Negocio</span>
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-2"
          >
            <Wrench className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Servicios</span>
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-2"
          >
            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Pagos</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-2"
          >
            <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-medium">
                      {(profile.rating || 0) > 0 ? `${profile.rating}/5` : 'Sin calificaciones'}
                    </span>
                    <span className="text-muted-foreground">({profile.reviewCount} reseñas)</span>
                  </div>
                  {profile.verified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {profile.completedJobs} trabajos completados
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Information Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input
                    id="businessName"
                    value={profile.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Tipo de Negocio</Label>
                  <Select
                    value={profile.businessType}
                    onValueChange={(value) => handleInputChange('businessType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole_proprietorship">Propietario único</SelectItem>
                      <SelectItem value="partnership">Sociedad</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">Corporación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="businessLicense">Licencia de Negocio</Label>
                  <Input
                    id="businessLicense"
                    value={profile.businessLicense}
                    onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">ID Fiscal</Label>
                  <Input
                    id="taxId"
                    value={profile.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Años de Experiencia</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    value={profile.yearsOfExperience}
                    onChange={(e) =>
                      handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Dirección del Negocio</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Input
                      placeholder="Dirección"
                      value={profile.businessAddress}
                      onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Ciudad"
                      value={profile.businessCity}
                      onChange={(e) => handleInputChange('businessCity', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Estado"
                      value={profile.businessState}
                      onChange={(e) => handleInputChange('businessState', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Código Postal"
                      value={profile.businessZip}
                      onChange={(e) => handleInputChange('businessZip', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Ofrecidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_SERVICES.map((service) => (
                  <div key={service.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={service.value}
                      checked={profile.services.includes(service.value)}
                      onChange={() => handleServiceToggle(service.value)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={service.value} className="text-sm">
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="serviceRadius">Radio de Servicio (km)</Label>
                  <Input
                    id="serviceRadius"
                    type="number"
                    value={profile.serviceRadius}
                    onChange={(e) =>
                      handleInputChange('serviceRadius', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Tarifa por Hora ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) =>
                      handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="minimumJobValue">Valor Mínimo de Trabajo ($)</Label>
                  <Input
                    id="minimumJobValue"
                    type="number"
                    value={profile.minimumJobValue}
                    onChange={(e) =>
                      handleInputChange('minimumJobValue', parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specializations">Especializaciones</Label>
                <Textarea
                  id="specializations"
                  placeholder="Describe tus especializaciones y habilidades únicas..."
                  value={profile.specializations?.join(', ') || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'specializations',
                      e.target.value.split(', ').filter((s) => s.trim()),
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Pagos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Para recibir pagos, necesitas conectar tu cuenta de Stripe. Esto te permitirá
                  recibir pagos de forma segura y rápida.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stripeAccountId"
                      value={profile.stripeAccountId}
                      onChange={(e) => handleInputChange('stripeAccountId', e.target.value)}
                      placeholder="Conecta tu cuenta de Stripe"
                      readOnly
                    />
                    <Button variant="outline" onClick={handleConnectStripe}>
                      {isConnecting
                        ? 'Conectando...'
                        : profile.stripeAccountId
                          ? 'Reconectar'
                          : 'Conectar'}{' '}
                      Stripe
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cuenta bancaria verificada</Label>
                    <p className="text-sm text-muted-foreground">
                      Tu cuenta bancaria debe estar verificada para recibir pagos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.bankAccountVerified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verificada
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        No verificada
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Métodos de pago aceptados</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'card', label: 'Tarjetas de crédito/débito' },
                      { value: 'bank_transfer', label: 'Transferencia bancaria' },
                      { value: 'paypal', label: 'PayPal' },
                      { value: 'cash', label: 'Efectivo' },
                    ].map((method) => (
                      <div key={method.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={method.value}
                          checked={profile.paymentMethodsAccepted?.includes(method.value)}
                          onChange={(e) => {
                            const methods = profile.paymentMethodsAccepted || []
                            const updated = e.target.checked
                              ? [...methods, method.value]
                              : methods.filter((m) => m !== method.value)
                            handleInputChange('paymentMethodsAccepted', updated)
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={method.value} className="text-sm">
                          {method.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Disponible para trabajos</Label>
                  <p className="text-sm text-muted-foreground">
                    Controla si apareces en las búsquedas de contratistas
                  </p>
                </div>
                <Switch
                  checked={profile.isAvailable}
                  onCheckedChange={(checked: boolean) => handleInputChange('isAvailable', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-aceptar trabajos</Label>
                  <p className="text-sm text-muted-foreground">
                    Acepta automáticamente trabajos que coincidan con tus criterios
                  </p>
                </div>
                <Switch
                  checked={profile.autoAcceptJobs}
                  onCheckedChange={(checked: boolean) =>
                    handleInputChange('autoAcceptJobs', checked)
                  }
                />
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Preferencias de Notificaciones</Label>
                <div className="space-y-3 mt-3">
                  {[
                    { key: 'email', label: 'Notificaciones por email' },
                    { key: 'sms', label: 'Notificaciones por SMS' },
                    { key: 'push', label: 'Notificaciones push' },
                    { key: 'newJobs', label: 'Nuevos trabajos disponibles' },
                    { key: 'jobUpdates', label: 'Actualizaciones de trabajos' },
                    { key: 'payments', label: 'Notificaciones de pagos' },
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between">
                      <Label>{pref.label}</Label>
                      <Switch
                        checked={
                          profile.notificationPreferences?.[
                            pref.key as keyof typeof profile.notificationPreferences
                          ]
                        }
                        onCheckedChange={(checked: boolean) =>
                          handleNotificationChange(pref.key, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
