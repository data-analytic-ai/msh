/**
 * Request Details API
 *
 * Custom API route for fetching service request details by ID or email.
 * This route complements PayloadCMS functionality without interfering
 * with the native /api/service-requests endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Get Service Request Details
 *
 * Fetches service request details using PayloadCMS client.
 * Supports fetching by ID or by customer email.
 *
 * Query parameters:
 * - id: Service request ID
 * - email: Customer email (returns all requests for that email)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (!id && !email) {
      return NextResponse.json(
        { error: 'Either id or email parameter is required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    if (id) {
      // Fetch single request by ID
      console.log(`🔍 Fetching service request with ID: ${id}`)

      const serviceRequest = await payload.findByID({
        collection: 'service-requests',
        id,
        depth: 2, // Include related data like users and nested objects
      })

      console.log(`✅ Service request found:`, serviceRequest)
      return NextResponse.json(serviceRequest)
    }

    if (email) {
      // Fetch all requests for customer email
      console.log(`🔍 Fetching service requests for email: ${email}`)

      const serviceRequests = await payload.find({
        collection: 'service-requests',
        where: {
          'customerInfo.email': {
            equals: email,
          },
        },
        depth: 2,
        sort: '-createdAt', // Most recent first
      })

      console.log(`✅ Found ${serviceRequests.docs.length} service requests for ${email}`)
      return NextResponse.json(serviceRequests)
    }
  } catch (error: any) {
    console.error(`❌ Error fetching service request:`, error)

    return NextResponse.json({ error: 'Failed to fetch service request details' }, { status: 500 })
  }
}
