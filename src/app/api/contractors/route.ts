/**
 * API Route: /api/contractors
 *
 * This API endpoint manages requests for finding contractors based on service type and location.
 * It uses the ContractorDirectory collection to fetch and filter contractors.
 */

import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { Contractor } from '@/types/contractor'

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

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
 * GET handler for /api/contractors endpoint
 *
 * Query parameters:
 * - services: JSON string array of service types to filter by
 * - lat: Latitude coordinate for location-based search
 * - lng: Longitude coordinate for location-based search
 * - limit: Maximum number of results to return (default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const servicesParam = searchParams.get('services')
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const limitParam = searchParams.get('limit')

    // Parse and validate parameters
    const services = servicesParam ? JSON.parse(servicesParam) : []
    const lat = latParam ? parseFloat(latParam) : null
    const lng = lngParam ? parseFloat(lngParam) : null
    const limit = limitParam ? parseInt(limitParam, 10) : 5

    // Validate required parameters
    if (!services.length) {
      return NextResponse.json({ error: 'Services parameter is required' }, { status: 400 })
    }

    if (lat === null || lng === null) {
      return NextResponse.json(
        { error: 'Location coordinates (lat, lng) are required' },
        { status: 400 },
      )
    }

    // Build query for PayloadCMS
    const query = {
      // Find contractors that offer at least one of the requested services
      services: { in: services },
      // Only show available contractors
      isAvailable: { equals: true },
    }

    // Fetch contractors from PayloadCMS
    const contractorsResponse = await payload.find({
      collection: 'contractor-directory',
      where: query,
      limit: 100, // Fetch more than needed to filter by distance later
      depth: 2, // Load nested relationships
    })

    // Transform data and calculate distances
    let contractors = contractorsResponse.docs.map((contractor: any) => {
      const mappedContractor = mapToContractor(contractor)

      // Calculate distance from user's location
      const distance = calculateDistance(
        lat,
        lng,
        contractor.location.coordinates.lat,
        contractor.location.coordinates.lng,
      )

      return {
        ...mappedContractor,
        location: {
          ...mappedContractor.location,
          distance,
        },
      }
    })

    // Sort by distance
    contractors.sort((a, b) => {
      return (a.location.distance || 0) - (b.location.distance || 0)
    })

    // Limit results
    contractors = contractors.slice(0, limit)

    return NextResponse.json({ contractors })
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json({ error: 'Error fetching contractors' }, { status: 500 })
  }
}
