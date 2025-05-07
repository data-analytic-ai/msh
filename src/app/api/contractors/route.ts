/**
 * Contractors API Route
 *
 * API endpoint for searching contractors based on service type and location.
 * This API queries the PayloadCMS contractors collection and supports filtering
 * by service type and calculating distance from a given location.
 */
import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getDistance } from 'geolib'
import { Contractor, ContractorWithDistance } from '@/types/contractor'

// Helper to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  try {
    return (
      getDistance({ latitude: lat1, longitude: lng1 }, { latitude: lat2, longitude: lng2 }) / 1000
    ) // Convert meters to kilometers
  } catch (error) {
    console.error('Error calculating distance:', error)
    return 99999 // Return a large number on error
  }
}

// GET handler for searching contractors
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const services = searchParams.get('services')?.split(',') || []
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Verify required parameters
    if (!services.length || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: services, lat, lng' },
        { status: 400 },
      )
    }

    // Build query for PayloadCMS
    const query: any = {
      limit: limit,
    }

    // Add service filter if services are specified
    if (services.length) {
      // Intentar filtrar por slug o por valor de servicio
      query.where = {
        or: [
          {
            'servicesOffered.slug': {
              in: services,
            },
          },
          {
            'servicesOffered.value': {
              in: services,
            },
          },
        ],
      }
    }

    // Find contractors in PayloadCMS
    const contractorsResult = await payload.find({
      collection: 'contractors',
      ...query,
    })

    // Calculate distance for each contractor and add to response
    const contractors: ContractorWithDistance[] = contractorsResult.docs.map((doc: any) => {
      const contractor = doc as unknown as Contractor
      const contractorLat = contractor.location?.lat || 0
      const contractorLng = contractor.location?.lng || 0

      // Calculate distance if both coordinates are available
      const distance =
        lat && lng && contractorLat && contractorLng
          ? calculateDistance(lat, lng, contractorLat, contractorLng)
          : null

      return {
        ...contractor,
        distance: distance ? parseFloat(distance.toFixed(1)) : undefined,
        responseTime: '15-30 min', // Default response time
      }
    })

    // Sort by distance
    contractors.sort((a, b) => {
      if (a.distance === undefined) return 1
      if (b.distance === undefined) return -1
      return a.distance - b.distance
    })

    return NextResponse.json({ contractors })
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json({ error: 'Failed to fetch contractors' }, { status: 500 })
  }
}
