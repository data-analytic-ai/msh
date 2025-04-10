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
function mapToContractor(contractor: PayloadContractor): Contractor {
  // Función auxiliar para extraer URL de un campo Media de Payload
  const getMediaUrl = (media: string | Media | null | undefined): string | undefined => {
    if (!media) return undefined
    if (typeof media === 'string') return media
    return media.url || undefined
  }

  return {
    id: contractor.id,
    name: contractor.name,
    description: contractor.description,
    contactEmail: contractor.contactEmail,
    contactPhone: contractor.contactPhone,
    website: contractor.website || undefined,
    address: contractor.address,
    location: {
      lat: contractor.location.lat,
      lng: contractor.location.lng,
    },
    servicesOffered: contractor.servicesOffered.map((service) =>
      typeof service === 'string' ? service : service.type,
    ),
    yearsExperience: contractor.yearsExperience,
    rating: contractor.rating,
    reviewCount: contractor.reviewCount,
    profileImage: getMediaUrl(contractor.profileImage),
    coverImage: getMediaUrl(contractor.coverImage),
    specialties: contractor.specialties?.map((s) => s.specialty) || [],
    workingHours: {
      monday: contractor.workingHours?.monday || undefined,
      tuesday: contractor.workingHours?.tuesday || undefined,
      wednesday: contractor.workingHours?.wednesday || undefined,
      thursday: contractor.workingHours?.thursday || undefined,
      friday: contractor.workingHours?.friday || undefined,
      saturday: contractor.workingHours?.saturday || undefined,
      sunday: contractor.workingHours?.sunday || undefined,
    },
    verified: contractor.verified || false,
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
      collection: 'contractors',
      id,
      depth: 2, // Load nested relationships
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    // Transform data
    const mappedContractor = mapToContractor(contractor)

    return NextResponse.json({ contractor: mappedContractor })
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json({ error: 'Error fetching contractor' }, { status: 500 })
  }
}
