/**
 * API Route: /api/contractors/search
 *
 * Endpoint optimizado para buscar contratistas por servicios y ubicación.
 * Acepta peticiones POST con datos JSON en lugar de parámetros de consulta.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
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
 * POST handler for /api/contractors/search endpoint
 *
 * Acepta un cuerpo JSON con:
 * - services: array de tipos de servicio
 * - location: objeto {lat, lng}
 * - limit: número opcional de resultados
 */
export async function POST(request: NextRequest) {
  try {
    // Get payload instance
    const payload = await getPayload({ config })

    const body = await request.json()
    const { services, location, limit = 5 } = body

    // Validación
    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de servicios válido' },
        { status: 400 },
      )
    }

    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { error: 'Se requieren coordenadas de ubicación válidas' },
        { status: 400 },
      )
    }

    // Consulta usando la API de PayloadCMS
    const contractorsResponse = await payload.find({
      collection: 'contractors',
      where: {
        servicesOffered: { in: services },
        // Si PayloadCMS soporta consultas geoespaciales:
        // 'location.coordinates': {
        //   near: {
        //     lat: location.lat,
        //     lng: location.lng,
        //     maxDistance: 50000 // 50km en metros
        //   }
        // }
      },
      limit: 100, // Obtener más de los necesarios para filtrar por distancia
      depth: 2,
    })

    // Transformar y calcular distancias
    let contractors = contractorsResponse.docs.map((contractor) => {
      const mappedContractor = mapToContractor(contractor)

      // Calcular distancia
      const distance = calculateDistance(
        location.lat,
        location.lng,
        contractor.location.lat,
        contractor.location.lng,
      )

      return {
        ...mappedContractor,
        location: {
          ...mappedContractor.location,
          distance,
        },
      }
    })

    // Ordenar por distancia y limitar resultados
    contractors = contractors
      .sort((a, b) => (a.location.distance || 0) - (b.location.distance || 0))
      .slice(0, limit)

    return NextResponse.json({ contractors })
  } catch (error) {
    console.error('Error buscando contratistas:', error)
    return NextResponse.json({ error: 'Error al buscar contratistas' }, { status: 500 })
  }
}
