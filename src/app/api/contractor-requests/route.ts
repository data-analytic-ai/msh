import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Contractor Requests API
 *
 * Endpoint for fetching service requests available for contractors.
 * Supports filtering by contractor services and status.
 *
 * @param request - The incoming request with optional filter parameters
 * @returns Response with filtered service requests data or error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractorId')

    // Check for contractor authentication
    if (!request.headers.get('cookie')?.includes('payload-token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get payload instance
    const payload = await getPayload({ config })

    // Base query - create an empty where object
    const where: any = {}

    // If specific status filters are provided, use them
    const status = searchParams.get('status')
    if (status) {
      try {
        const statusArray = JSON.parse(status)
        if (Array.isArray(statusArray) && statusArray.length > 0) {
          where.status = {
            in: statusArray,
          }
        }
      } catch (e) {
        console.error('Error parsing status filter:', e)
      }
    }

    // If service filters are provided, use them
    const services = searchParams.get('services')
    if (services) {
      try {
        const servicesArray = JSON.parse(services)
        if (Array.isArray(servicesArray) && servicesArray.length > 0) {
          where.serviceType = {
            in: servicesArray,
          }
        }
      } catch (e) {
        console.error('Error parsing services filter:', e)
      }
    }

    // If urgency filters are provided, use them
    const urgency = searchParams.get('urgency')
    if (urgency) {
      try {
        const urgencyArray = JSON.parse(urgency)
        if (Array.isArray(urgencyArray) && urgencyArray.length > 0) {
          where.urgencyLevel = {
            in: urgencyArray,
          }
        }
      } catch (e) {
        console.error('Error parsing urgency filter:', e)
      }
    }

    // If specific contractor ID is provided, customize query
    if (contractorId) {
      try {
        // Get contractor services to filter relevant jobs
        const contractor = await payload.findByID({
          collection: 'users',
          id: contractorId,
          depth: 0,
        })

        // Usar type assertion y operador opcional para acceso seguro
        const services = (contractor as any)?.services
        if (Array.isArray(services) && services.length > 0) {
          // Only show requests matching contractor services if they have services defined
          where.serviceType = {
            in: services,
          }
        }
      } catch (contractorError) {
        console.error('Error fetching contractor details:', contractorError)
        // Continue with the request even if contractor lookup fails
      }
    }

    console.log('Querying service requests with where:', JSON.stringify(where))

    // Fetch service requests with applied filters
    const serviceRequests = await payload.find({
      collection: 'service-requests',
      where,
      sort: '-createdAt', // Newest first
      depth: 2, // Include related data
    })

    return NextResponse.json({
      docs: serviceRequests.docs || [],
      totalDocs: serviceRequests.totalDocs,
      page: serviceRequests.page,
      totalPages: serviceRequests.totalPages,
      hasNextPage: serviceRequests.hasNextPage,
      hasPrevPage: serviceRequests.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching contractor service requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service requests', docs: [] },
      { status: 500 },
    )
  }
}
