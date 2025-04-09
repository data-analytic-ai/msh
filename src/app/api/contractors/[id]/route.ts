/**
 * API Route: /api/contractors/[id]
 *
 * This endpoint returns detailed information about a specific contractor.
 */

import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { Contractor } from '@/types/contractor'

// Function to convert ContractorDirectory to Contractor type
function mapToContractor(contractor: any): Contractor {
  return {
    id: contractor.id,
    name: contractor.businessName,
    description: contractor.businessDetails?.description || '',
    contactEmail: contractor.contactInfo?.email || '',
    contactPhone: contractor.contactInfo?.phone || '',
    website: contractor.contactInfo?.website,
    address: contractor.location.formattedAddress,
    location: {
      lat: contractor.location.coordinates.lat,
      lng: contractor.location.coordinates.lng,
    },
    servicesOffered: contractor.services,
    yearsExperience: contractor.businessDetails?.yearsInBusiness || 0,
    rating: contractor.googleData?.rating || 0,
    reviewCount: contractor.googleData?.reviewCount || 0,
    profileImage: contractor.media?.logo?.url,
    coverImage: contractor.media?.photos?.[0]?.photo?.url,
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
