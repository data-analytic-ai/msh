/**
 * Debug Collections API Route
 *
 * Endpoint for debugging PayloadCMS collections initialization.
 * Helps diagnose issues with collection availability.
 */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    // Get payload instance properly
    const payload = await getPayload({ config })

    // Check if payload is initialized
    const isInitialized = !!payload.db

    // Get available collections
    const collections = payload.collections ? Object.keys(payload.collections) : []

    // Get specific collection info
    let serviceRequestsInfo = null
    if (payload.collections && payload.collections['service-requests']) {
      serviceRequestsInfo = {
        slug: payload.collections['service-requests'].config.slug,
        exists: true,
      }
    }

    // Try to count documents in service-requests collection
    let documentCount = null
    try {
      const result = await payload.find({
        collection: 'service-requests',
        limit: 0, // Just get count
      })
      documentCount = result.totalDocs
    } catch (countError: any) {
      console.error('Error counting documents:', countError.message)
    }

    return NextResponse.json({
      status: 'success',
      payloadInitialized: isInitialized,
      collections,
      serviceRequestsInfo,
      documentCount,
      hasPayloadCollections: !!payload.collections,
      configLoaded: !!config,
    })
  } catch (error: any) {
    console.error('Debug collections error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
