/**
 * API Route: /api/contractors/[id]
 *
 * This endpoint returns detailed information about a specific contractor.
 * It searches in Google Places data first, then provides mock data as fallback.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Contractor } from '@/types/contractor'
import contractorsFromGoogleData from '@/data/contractors.json'

// Convert Google Places result to our Contractor format (same as in google-contractors API)
const convertGooglePlaceToContractor = (place: any): Contractor => {
  const hasPhoto = place.photos?.[0]?.photo_reference
  const hasApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return {
    id: place.place_id,
    name: place.name,
    description: place.vicinity || 'Professional contractor services with experience in the area.',
    contactEmail: 'contact@contractor.example',
    contactPhone:
      place.formatted_phone_number || place.international_phone_number || '+1 (555) 123-4567',
    website: place.website || 'https://contractor.example',
    address: place.vicinity || 'Professional Service Address',
    location: {
      lat: place.geometry?.location?.lat || 0,
      lng: place.geometry?.location?.lng || 0,
    },
    servicesOffered: ['general'],
    yearsExperience: 5,
    rating: place.rating || 4.5,
    reviewCount: place.user_ratings_total || 25,
    profileImage:
      hasPhoto && hasApiKey
        ? {
            id: 'google-image',
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          }
        : undefined,
    specialties: ['Emergency Repairs', 'Commercial Installations'],
    workingHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 2:00 PM',
      sunday: 'Closed',
    },
    verified: place.business_status === 'OPERATIONAL',
    businessStatus: place.business_status || 'OPERATIONAL',
    openNow: place.opening_hours?.open_now || false,
    dataSource: 'google_maps',
    dataSourceId: place.place_id,
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

    // First try to find it in Google Places data
    try {
      const googleContractor = contractorsFromGoogleData.find((place: any) => place.place_id === id)

      if (googleContractor) {
        const mappedContractor = convertGooglePlaceToContractor(googleContractor)
        return NextResponse.json({ contractor: mappedContractor })
      }
    } catch (error) {
      console.log('Error searching in Google Places data:', error)
    }

    // If it looks like a Google Place ID or mock ID, create a mock contractor
    if (id.startsWith('ChIJ') || id.includes('place') || id.startsWith('mock')) {
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
          saturday: '10:00 AM - 2:00 PM',
          sunday: 'Closed',
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
