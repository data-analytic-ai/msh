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
import { ContractorSidebar } from '@/app/(frontend)/contractor/dashboard/components/ContractorSidebar'
import { RequestFilters } from '@/app/(frontend)/contractor/dashboard/components/RequestFilters'
import { RequestList } from '@/app/(frontend)/contractor/dashboard/components/RequestList'
import { useServiceRequests } from '../hooks/useServiceRequests'
import { submitBid } from '../services/bidService'

export default function ExploreRequests() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  // Al iniciar la página, verificamos autenticación
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { user } = await getMe()

        if (!user) {
          return router.push('/contractor/login')
        }

        if (user.role !== 'contractor' && user.role !== 'admin' && user.role !== 'superadmin') {
          router.push('/login')
          return
        }

        setUser(user)
      } catch (err) {
        console.error('Error al verificar autenticación:', err)
        router.push('/contractor/login')
      }
    }

    checkAuthentication()
  }, [router])

  // Usar el hook personalizado para manejar las solicitudes y filtros
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

  // Manejar envío de ofertas
  const handleBidSubmit = async (requestId: string, amount: number, description: string) => {
    if (!user?.id || !requestId) return false

    const success = await submitBid(requestId, user.id, amount, description)

    if (success) {
      // Actualizar la lista de solicitudes para reflejar la oferta
      refreshRequests()
    }

    return success
  }

  return (
    <div className="flex min-h-screen bg-background dark:bg-background">
      {/* Sidebar */}
      <ContractorSidebar activePath="/contractor/dashboard/explore" />

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 text-foreground dark:text-white">
            <div>
              <h1 className="text-2xl font-bold">Explorar solicitudes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Encuentra solicitudes de servicio y presenta tus ofertas
              </p>
            </div>
          </header>

          {/* Filtros */}
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

          {/* Lista de solicitudes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">
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
      </div>
    </div>
  )
}
