/**
 * ContractorDetailPage - Detailed view for a specific contractor
 *
 * Displays comprehensive information about a selected contractor and allows
 * the user to request their services. Uses hybrid approach with both React Context
 * and route parameters for resilience.
 *
 * @returns {JSX.Element} - Contractor detail page component
 */

import React, { use, Suspense } from 'react'
import { notFound } from 'next/navigation'
import ContractorDetailContent from '@/app/(frontend)/request-service/find-contractor/[contractor]/ContractorDetailContent'
import { ServiceRequestStateProvider } from '@/providers/ServiceRequestStateProvider'

// Types for our params
type ContractorPageProps = {
  params: Promise<{
    contractor: string
  }>
}

export const dynamicParams = true

// Generate metadata for the page
export async function generateMetadata({ params: paramsPromise }: ContractorPageProps) {
  const { contractor } = await paramsPromise

  // Extract ID from the slug format "id-contractor-name"
  const id = contractor.split('-')[0]

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/contractors/${id}`)

    if (!response.ok) {
      return {
        title: 'Contratista no encontrado',
        description: 'No pudimos encontrar el contratista solicitado',
      }
    }

    const data = await response.json()
    return {
      title: `${data.contractor.name} - Detalles del contratista`,
      description: data.contractor.description.substring(0, 160),
    }
  } catch (error) {
    return {
      title: 'Contratista',
      description: 'Detalles del contratista',
    }
  }
}

// Generar rutas estáticas para contratistas disponibles en la compilación
export async function generateStaticParams() {
  try {
    // Intentar obtener contratistas para generar rutas estáticas
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/contractors`

    // Si estamos en entorno de compilación y hay problemas de conexión, devolver array vacío
    // para que la compilación pueda continuar
    const response = await fetch(url, {
      method: 'GET',
      next: { revalidate: 3600 }, // Revalidar cada hora
    }).catch((error) => {
      console.error(`Error conectando a ${url}:`, error)
      // Devolver una respuesta "falsa" para evitar que falle la compilación
      return new Response(JSON.stringify({ contractors: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    if (!response.ok && response.status !== 200) {
      console.warn('No se pudieron obtener contratistas para rutas estáticas')
      return []
    }

    const data = await response.json()
    const contractors = data.contractors || []

    return contractors.map((contractor: any) => ({
      contractor: `${contractor.id}-${contractor.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')}`,
    }))
  } catch (error) {
    console.error('Error generating static paths for contractors:', error)
    // Retornar array vacío para permitir que la compilación continúe
    return []
  }
}

// This is a server component that serves as the container
export default function ContractorDetailPage({ params: paramsPromise }: ContractorPageProps) {
  return (
    <Suspense fallback={<ContractorDetailLoading />}>
      <ContractorDetail paramsPromise={paramsPromise} />
    </Suspense>
  )
}

// Loading state component
function ContractorDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Cargando información del contratista...</p>
      </div>
    </div>
  )
}

// This component resolves the params promise
function ContractorDetail({ paramsPromise }: { paramsPromise: Promise<{ contractor: string }> }) {
  // Resolve the params promise using React.use
  const { contractor: slugParam } = use(paramsPromise)

  // Extract ID from the slug format "id-contractor-name"
  const contractorId = slugParam.split('-')[0]

  if (!contractorId) {
    return notFound()
  }

  return (
    <ServiceRequestStateProvider>
      <ContractorDetailContent contractorId={contractorId} slug={slugParam} />
    </ServiceRequestStateProvider>
  )
}
