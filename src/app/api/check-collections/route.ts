/**
 * Check Collections API Route
 *
 * Utility endpoint to verify which collections are available in PayloadCMS.
 * This helps diagnose initialization issues with collections.
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    // Get payload instance using the modern approach
    const payload = await getPayload({ config })

    // Get the list of all PayloadCMS collections
    const collections = payload.collections ? Object.keys(payload.collections) : []

    // Check if the contractors collection is available
    const hasContractors = collections.includes('contractors')

    // Get information about the contractors collection if it exists
    let contractorsInfo = null
    if (hasContractors && payload.collections.contractors) {
      const contractorsCollection = payload.collections.contractors

      // Get document count using payload.count method
      const countResult = await payload.count({
        collection: 'contractors',
      })

      contractorsInfo = {
        slug: contractorsCollection.config.slug,
        fields: contractorsCollection.config.fields
          .filter((field) => typeof field === 'object' && 'name' in field)
          .map((field: any) => field.name),
        count: countResult.totalDocs,
      }
    }

    return NextResponse.json({
      status: 'success',
      collections,
      hasContractors,
      contractorsInfo,
      databaseStatus: payload.db ? 'connected' : 'not connected',
      payloadInitialized: !!payload.db,
    })
  } catch (error) {
    console.error('Error checking collections:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        payloadInitialized: false,
      },
      { status: 500 },
    )
  }
}
