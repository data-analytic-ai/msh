/**
 * Health Check API
 *
 * Simple endpoint to verify API connectivity and system status.
 * Used for debugging and monitoring purposes.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is working correctly',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
