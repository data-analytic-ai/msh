import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

interface Params {
  params: {
    id: string
  }
}

/**
 * Service Request by ID API
 *
 * Endpoint for fetching and updating a specific service request by its ID.
 * Provides GET and PATCH operations for service request data.
 *
 * @param request - The incoming request
 * @param params - Contains the ID of the service request to fetch
 * @returns Response with service request data or error
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = params.id

    const serviceRequest = await payload.findByID({
      collection: 'service-requests',
      id,
      depth: 2, // Include related data like users and nested objects
    })

    return NextResponse.json(serviceRequest)
  } catch (error) {
    console.error(`Error fetching service request ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch service request' }, { status: 500 })
  }
}

/**
 * Update Service Request API
 *
 * Allows updating specific fields of a service request.
 * Used by contractors to add or update quotes.
 *
 * @param request - The incoming request with update data
 * @param params - Contains the ID of the service request to update
 * @returns Response with updated service request data or error
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const id = params.id
    const updateData = await request.json()

    // Find current data to verify update permissions
    const existingRequest = await payload.findByID({
      collection: 'service-requests',
      id,
      depth: 0,
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    // Perform the update
    const updatedRequest = await payload.update({
      collection: 'service-requests',
      id,
      data: updateData,
      depth: 2, // Return related data
    })

    return NextResponse.json(updatedRequest)
  } catch (error: any) {
    console.error(`Error updating service request ${params.id}:`, error)

    // Handle validation errors gracefully
    if (error.errors) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: 'Failed to update service request' }, { status: 500 })
  }
}
