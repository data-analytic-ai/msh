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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Phone, Mail, Globe, Star, Clock, Check } from 'lucide-react'
import Link from 'next/link'
import { ServiceRequestProvider, useServiceRequest } from '@/context/ServiceRequestContext'
import { Contractor } from '@/types/contractor'
import { Separator } from '@/components/ui/separator'
import ContractorDetailContent from '@/app/(frontend)/request-service/find-contractor/[contractor]/ContractorDetailContent'

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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/contractors`,
      {
        method: 'GET',
        next: { revalidate: 3600 }, // Revalidar cada hora
      },
    )

    if (!response.ok) {
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
    <ServiceRequestProvider>
      <ContractorDetailContent contractorId={contractorId} slug={slugParam} />
    </ServiceRequestProvider>
  )
}
