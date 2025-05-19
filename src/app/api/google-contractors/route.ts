/**
 * Google Contractors API Route
 *
 * API endpoint for retrieving and storing contractor data from Google Places API.
 * This serves as a bridge solution while we build our contractor database.
 */
import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getDistance } from 'geolib'
import { Contractor, ContractorWithDistance } from '@/types/contractor'
import contractorsFromGoogleData from '@/data/contractors.json'

// Flag to control if we should attempt to store data
// Set to false initially until we confirm database is ready
let shouldAttemptDbStorage = false

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

// Convert Google Places result to our Contractor format
const convertGooglePlaceToContractor = (place: any, serviceIds: string[]): Contractor => {
  return {
    id: place.place_id,
    name: place.name,
    description: place.vicinity || '',
    address: place.vicinity || '',
    location: {
      lat: place.geometry?.location?.lat || 0,
      lng: place.geometry?.location?.lng || 0,
    },
    servicesOffered: serviceIds,
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    profileImage: place.photos?.[0]?.html_attributions
      ? {
          id: 'google-image',
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
        }
      : undefined,
    verified: place.business_status === 'OPERATIONAL',
    businessStatus: place.business_status || 'OPERATIONAL',
    openNow: place.opening_hours?.open_now || false,
    viewport: {
      south: place.geometry?.viewport?.south || 0,
      west: place.geometry?.viewport?.west || 0,
      north: place.geometry?.viewport?.north || 0,
      east: place.geometry?.viewport?.east || 0,
    },
    googleTypes: place.types ? place.types.map((type: string) => ({ type })) : [],
    responseTime: '15-30 min',
    contactPhone: place.formatted_phone_number || place.international_phone_number || '',
    website: place.website || '',
    invitationStatus: 'not_invited',
    dataSource: 'google_maps',
    dataSourceId: place.place_id,
  }
}

// Store a Google Places contractor in our database
const storeContractorInDatabase = async (contractor: Contractor) => {
  // Skip database operations if flag is off
  if (!shouldAttemptDbStorage) {
    console.log('Skipping database storage (database not yet ready)')
    return
  }

  try {
    // Check if the contractor already exists in our database
    const existingDoc = await payload.find({
      collection: 'contractors',
      where: {
        dataSourceId: { equals: contractor.id },
        dataSource: { equals: 'google_maps' },
      },
    })

    // If the contractor doesn't exist, create a new one
    if (existingDoc.docs.length === 0) {
      // Prepara los datos para PayloadCMS removiendo campos opcional que son undefined
      const data: any = {
        ...contractor,
        dataSource: 'google_maps',
        dataSourceId: contractor.id,
        lastScraped: new Date().toISOString(),
      }

      await payload.create({
        collection: 'contractors',
        data,
      })
      console.log(`Stored new contractor: ${contractor.name}`)
    } else {
      console.log(`Contractor already exists: ${contractor.name}`)
    }
  } catch (error) {
    // Si el error es que la colección no existe, simplemente lo registramos sin reintentarlo
    if (error instanceof Error && error.message && error.message.includes("can't be found")) {
      console.log('Collection contractors not ready yet, skipping database operations')
      shouldAttemptDbStorage = false
    } else {
      console.error('Error storing contractor:', error)
    }
    // Continue even if storage fails - we'll return the Google data directly
  }
}

// Temporary storage solution until our database is fully operational
const mockContractorsDatabase: Record<string, Contractor[]> = {}

// GET handler for searching Google Places API contractors
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const services = searchParams.get('services')?.split(',') || []
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const useGoogle = searchParams.get('useGoogle') === 'true'
    const serviceKey = services.sort().join(',')

    // Verify required parameters
    if (!services.length || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: services, lat, lng' },
        { status: 400 },
      )
    }

    // Try to return cached data if available and not forcing Google API
    if (!useGoogle && mockContractorsDatabase[serviceKey]) {
      console.log('Using cached contractors data')
      const contractors = mockContractorsDatabase[serviceKey].map((contractor) => {
        const distance =
          lat && lng && contractor.location?.lat && contractor.location?.lng
            ? calculateDistance(lat, lng, contractor.location.lat, contractor.location.lng)
            : null

        return {
          ...contractor,
          distance: distance ? parseFloat(distance.toFixed(1)) : undefined,
          responseTime: '15-30 min',
        }
      })

      // Sort by distance
      contractors.sort((a: ContractorWithDistance, b: ContractorWithDistance) => {
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return a.distance - b.distance
      })

      return NextResponse.json({ contractors })
    }

    // This is where you would normally call the Google Places API
    // For now, we'll use the data from contractors.json as a simulation
    // In production, replace this with actual Google Places API call

    // Using imported contractors data instead of require()

    // Convert Google Places format to our format
    const contractors = contractorsFromGoogleData.map((place: any) => {
      const contractor = convertGooglePlaceToContractor(place, services)

      // Calculate distance
      const distance =
        lat && lng && contractor.location?.lat && contractor.location?.lng
          ? calculateDistance(lat, lng, contractor.location.lat, contractor.location.lng)
          : null

      // Store in our database in the background
      storeContractorInDatabase(contractor).catch(console.error)

      return {
        ...contractor,
        distance: distance ? parseFloat(distance.toFixed(1)) : undefined,
        responseTime: '15-30 min',
      }
    })

    // Sort by distance
    contractors.sort((a: ContractorWithDistance, b: ContractorWithDistance) => {
      if (a.distance === undefined) return 1
      if (b.distance === undefined) return -1
      return a.distance - b.distance
    })

    // Cache the results
    mockContractorsDatabase[serviceKey] = contractors.map(
      ({ distance, responseTime, ...rest }: ContractorWithDistance) => rest,
    )

    return NextResponse.json({ contractors })
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractors from Google Places' },
      { status: 500 },
    )
  }
}
