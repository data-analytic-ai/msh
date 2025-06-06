import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren contexto completo
const ROUTES_REQUIRING_CONTEXT = [
  '/request-service/confirmation',
  '/request-service/find-contractor',
  '/request-service/payment',
  '/request-service/tracking',
]

// Function to extract user session ID from cookies
function getUserSessionFromCookies(request: NextRequest): string | null {
  const userEmail = request.cookies.get('msh_userEmail')?.value
  if (userEmail) {
    try {
      return JSON.parse(userEmail)
    } catch {
      return userEmail
    }
  }

  return request.cookies.get('msh_anonymous_session')?.value || null
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add standard security headers
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Check for service request flow routes
  const { pathname } = request.nextUrl
  if (ROUTES_REQUIRING_CONTEXT.some((route) => pathname.includes(route))) {
    // Set a special cookie for client-side to identify middleware check
    response.cookies.set('msh_middleware_check', 'true', {
      maxAge: 60, // Short-lived cookie
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/images/:path*', '/request-service/:path*'],
}
