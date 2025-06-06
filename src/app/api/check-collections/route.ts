/**
 * Check Collections API Route
 *
 * Utility endpoint to verify which collections are available in PayloadCMS.
 * This helps diagnose initialization issues with collections.
 */
import { NextResponse } from 'next/server'
import payload from 'payload'

export async function GET() {
  try {
    // Get the list of all PayloadCMS collections
    const collections = payload.collections ? Object.keys(payload.collections) : []

    // Check if the contractors collection is available
    const hasContractors = collections.includes('contractors')

    // Get information about the contractors collection if it exists
    let contractorsInfo = null
    if (hasContractors && payload.collections.contractors) {
      contractorsInfo = {
        slug: payload.collections.contractors.config.slug,
        fields: payload.collections.contractors.config.fields.map((field) =>
          typeof field === 'object' ? field.name : field,
        ),
        count: await payload.collections.contractors.Model.countDocuments(),
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
        payloadInitialized: !!payload.db,
      },
      { status: 500 },
    )
  }
}
