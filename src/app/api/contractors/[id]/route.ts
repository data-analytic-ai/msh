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
    name: contractor.name || contractor.businessName,
    description: contractor.description || contractor.businessDetails?.description || '',
    contactEmail: contractor.contactEmail || contractor.contactInfo?.email || '',
    contactPhone: contractor.contactPhone || contractor.contactInfo?.phone || '',
    website: contractor.website || contractor.contactInfo?.website || undefined,
    address: contractor.address || contractor.location?.formattedAddress || '',
    location: {
      lat: contractor.location?.lat || contractor.location?.coordinates?.lat || 0,
      lng: contractor.location?.lng || contractor.location?.coordinates?.lng || 0,
    },
    servicesOffered: contractor.servicesOffered || contractor.services || [],
    yearsExperience: contractor.yearsExperience || contractor.businessDetails?.yearsInBusiness || 0,
    rating: contractor.rating || contractor.googleData?.rating || 0,
    reviewCount: contractor.reviewCount || contractor.googleData?.reviewCount || 0,
    profileImage: getMediaUrl(contractor.profileImage || contractor.media?.logo),
    coverImage: getMediaUrl(contractor.coverImage || contractor.media?.photos?.[0]?.photo),
    specialties:
      contractor.specialties?.map((spec: any) =>
        typeof spec === 'string' ? spec : spec.specialty,
      ) ||
      contractor.businessDetails?.certifications?.map((cert: any) => cert.name) ||
      [],
    workingHours: contractor.workingHours || {
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
    verified: contractor.verified || contractor.isVerified || false,
  }
}

/**
 * GET handler for /api/contractors/[id] endpoint
 *
 * Route parameters:
 * - id: ID of the contractor to retrieve
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 })
    }

    // First try to fetch from our contractors collection
    try {
      const contractor = await payload.findByID({
        collection: 'contractors',
        id,
        depth: 2, // Load nested relationships
      })

      if (contractor) {
        const mappedContractor = mapToContractor(contractor as any)
        return NextResponse.json({ contractor: mappedContractor })
      }
    } catch (payloadError) {
      console.log('Contractor not found in PayloadCMS:', payloadError)
    }

    // If not found in PayloadCMS and it looks like a Google Place ID,
    // create a mock contractor based on the ID
    if (id.startsWith('ChIJ') || id.includes('place')) {
      const mockContractor: Contractor = {
        id: id,
        name: 'Contractor Professional',
        description: 'Professional contractor services with experience in the area.',
        contactEmail: 'contact@contractor.example',
        contactPhone: '+1 (555) 123-4567',
        website: 'https://contractor.example',
        address: 'Professional Service Address',
        location: {
          lat: 0,
          lng: 0,
        },
        servicesOffered: ['general'],
        yearsExperience: 5,
        rating: 4.5,
        reviewCount: 25,
        specialties: ['Emergency Repairs', 'Commercial Installations'],
        workingHours: {
          monday: '9:00 AM - 5:00 PM',
          tuesday: '9:00 AM - 5:00 PM',
          wednesday: '9:00 AM - 5:00 PM',
          thursday: '9:00 AM - 5:00 PM',
          friday: '9:00 AM - 5:00 PM',
        },
        verified: true,
      }

      return NextResponse.json({ contractor: mockContractor })
    }

    return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json({ error: 'Error fetching contractor' }, { status: 500 })
  }
}
