import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
