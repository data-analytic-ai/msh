'use client'

/**
 * Contractor Explore Page
 *
 * Allows contractors to browse available service requests and place bids.
 * This page displays service requests that match the contractor's service offerings.
 *
 * @returns {JSX.Element} Explore interface for contractors
 */
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe } from '@/lib/auth'
import { RequestFilters } from '@/app/(frontend)/contractor/dashboard/components/RequestFilters'
import { RequestList } from '@/app/(frontend)/contractor/dashboard/components/RequestList'
import { useServiceRequests } from '../hooks/useServiceRequests'
import { submitBid } from '../services/bidService'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Menu } from 'lucide-react'
import { useMobileMenu } from '../layout'

export default function ExploreRequests() {
  const router = useRouter()
  const { openMobileMenu } = useMobileMenu()
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Check authentication on page load
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🔐 Checking contractor authentication...')
        const { user } = await getMe()

        console.log('👤 User data:', user)

        if (!user) {
          console.log('❌ No user found, redirecting to login')
          return router.push('/contractor/login')
        }

        if (user.role !== 'contractor' && user.role !== 'admin' && user.role !== 'superadmin') {
          console.log('❌ User is not a contractor, role:', user.role)
          router.push('/login')
          return
        }

        console.log('✅ User authenticated as contractor:', user.id)
        setUser(user)
      } catch (err) {
        console.error('❌ Error checking authentication:', err)
        router.push('/contractor/login')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  // Use custom hook for requests and filters
  const {
    filteredRequests,
    loading,
    error,
    searchTerm,
    serviceFilters,
    urgencyFilter,
    statusFilter,
    setSearchTerm,
    setServiceFilters,
    setUrgencyFilter,
    setStatusFilter,
    refreshRequests,
  } = useServiceRequests({
    contractorId: user?.id,
  })

  // Handle bid submission
  const handleBidSubmit = async (requestId: string, amount: number, description: string) => {
    if (!user?.id || !requestId) return false

    console.log('💰 Submitting bid for request:', requestId)
    const success = await submitBid(requestId, user.id, amount, description)

    if (success) {
      console.log('✅ Bid submitted successfully')
      // Refresh requests list to reflect the new bid
      refreshRequests()
    } else {
      console.log('❌ Failed to submit bid')
    }

    return success
  }

  // Handle manual refresh
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered')
    refreshRequests()
  }

  // Show authentication loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Show error state if no user after loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Error de autenticación</h2>
          <p className="text-muted-foreground">No se pudo verificar tu sesión de contratista</p>
          <Button onClick={() => router.push('/contractor/login')}>Ir a login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-foreground dark:text-white">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Explorar solicitudes</h1>
          <p className="text-muted-foreground">
            Encuentra solicitudes de servicio y presenta tus ofertas
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mt-2 truncate">
              Contratista: {user.firstName} {user.lastName} (ID: {user.id})
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button - Only visible on mobile */}
          <Button variant="outline" size="icon" onClick={openMobileMenu} className="md:hidden">
            <Menu className="w-4 h-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
            <span className="sm:hidden">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Show error if any */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <h3 className="font-medium text-red-800 dark:text-red-200">
              Error al cargar solicitudes
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-3">
            Reintentar
          </Button>
        </div>
      )}

      {/* Filters */}
      <RequestFilters
        searchTerm={searchTerm}
        serviceFilters={serviceFilters}
        urgencyFilter={urgencyFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onServiceFilterChange={setServiceFilters}
        onUrgencyFilterChange={setUrgencyFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Requests list */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white">
          Solicitudes disponibles ({filteredRequests.length})
        </h2>

        <RequestList
          requests={filteredRequests}
          loading={loading}
          error={error}
          userId={user?.id}
          onBidSubmit={handleBidSubmit}
        />
      </div>
    </div>
  )
}
