/**
 * API Route: /api/contractors/[id]
 *
 * This endpoint returns detailed information about a specific contractor.
 */

import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { Contractor } from '@/types/contractor'
import { Contractor as PayloadContractor, Media } from '@/payload-types'

// Function to convert PayloadContractor to Contractor type for API response
function mapToContractor(contractor: any): Contractor {
  // Función auxiliar para extraer URL de un campo Media de Payload
  const getMediaUrl = (media: string | Media | null | undefined): string | undefined => {
    if (!media) return undefined
    if (typeof media === 'string') return media
    return media.url || undefined
  }

  return {
    id: contractor.id,
    name: contractor.businessName,
    description: contractor.businessDetails?.description || '',
    contactEmail: contractor.contactInfo?.email || '',
    contactPhone: contractor.contactInfo?.phone || '',
    website: contractor.contactInfo?.website || undefined,
    address: contractor.location.formattedAddress,
    location: {
      lat: contractor.location.coordinates.lat,
      lng: contractor.location.coordinates.lng,
    },
    servicesOffered: contractor.services || [],
    yearsExperience: contractor.businessDetails?.yearsInBusiness || 0,
    rating: contractor.googleData?.rating || 0,
    reviewCount: contractor.googleData?.reviewCount || 0,
    profileImage: getMediaUrl(contractor.media?.logo),
    coverImage: getMediaUrl(contractor.media?.photos?.[0]?.photo),
    specialties: contractor.businessDetails?.certifications?.map((cert: any) => cert.name) || [],
    workingHours: {
      monday: contractor.googleData?.openingHours?.find((day: any) => day.day === 'monday')?.open,
      tuesday: contractor.googleData?.openingHours?.find((day: any) => day.day === 'tuesday')?.open,
      wednesday: contractor.googleData?.openingHours?.find((day: any) => day.day === 'wednesday')
        ?.open,
      thursday: contractor.googleData?.openingHours?.find((day: any) => day.day === 'thursday')
        ?.open,
      friday: contractor.googleData?.openingHours?.find((day: any) => day.day === 'friday')?.open,
      saturday: contractor.googleData?.openingHours?.find((day: any) => day.day === 'saturday')
        ?.open,
      sunday: contractor.googleData?.openingHours?.find((day: any) => day.day === 'sunday')?.open,
    },
    verified: contractor.isVerified || false,
  }
}

/**
 * GET handler for /api/contractors/[id] endpoint
 *
 * Route parameters:
 * - id: ID of the contractor to retrieve
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 })
    }

    // Fetch contractor from PayloadCMS
    const contractor = await payload.findByID({
      collection: 'contractor-directory',
      id,
      depth: 2, // Load nested relationships
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    // Transform data
    const mappedContractor = mapToContractor(contractor as any)

    return NextResponse.json({ contractor: mappedContractor })
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json({ error: 'Error fetching contractor' }, { status: 500 })
  }
}
