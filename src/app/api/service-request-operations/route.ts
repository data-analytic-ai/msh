/**
 * Service Request Operations API
 *
 * Custom endpoint for specific service request operations that complement
 * PayloadCMS built-in functionality without conflicting with /api/service-requests
 *
 * This endpoint handles:
 * - Creating service requests with custom business logic
 * - Fetching filtered service requests with custom criteria
 * - Updating service request status with validation
 *
 * Uses PayloadCMS native API internally for data operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Create Service Request
 *
 * Handles service request creation with custom business logic
 * and validation before delegating to PayloadCMS
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const data = await request.json()

    console.log('🔧 Creating service request with data:', data)

    // Validate required fields
    if (!data.serviceType || !data.description) {
      return NextResponse.json(
        { error: 'Service type and description are required' },
        { status: 400 },
      )
    }

    // Use PayloadCMS create method
    const serviceRequest = await payload.create({
      collection: 'service-requests',
      data: {
        ...data,
        status: 'pending', // Default status
        // Add any custom business logic here
      },
    })

    return NextResponse.json(serviceRequest)
  } catch (error: any) {
    console.error('❌ Error creating service request:', error)
    return NextResponse.json({ error: 'Failed to create service request' }, { status: 500 })
  }
}

/**
 * Get Service Requests with Custom Filtering
 *
 * Handles custom filtering and search criteria
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const email = searchParams.get('email')

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = { equals: status }
    }

    if (serviceType) {
      where.serviceType = { in: [serviceType] }
    }

    if (email) {
      where['customerInfo.email'] = { equals: email }
    }

    const serviceRequests = await payload.find({
      collection: 'service-requests',
      where,
      page,
      limit,
      sort: '-createdAt',
      depth: 2,
    })

    return NextResponse.json(serviceRequests)
  } catch (error: any) {
    console.error('❌ Error fetching service requests:', error)
    return NextResponse.json({ error: 'Failed to fetch service requests' }, { status: 500 })
  }
}

/**
 * Update Service Request
 *
 * Handles service request updates with validation
 */
export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const data = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Service request ID is required' }, { status: 400 })
    }

    const updatedServiceRequest = await payload.update({
      collection: 'service-requests',
      id,
      data,
    })

    return NextResponse.json(updatedServiceRequest)
  } catch (error: any) {
    console.error('❌ Error updating service request:', error)
    return NextResponse.json({ error: 'Failed to update service request' }, { status: 500 })
  }
}
