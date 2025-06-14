import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Enhanced Middleware - Controls access and navigation flow
 *
 * Manages route access based on authentication status and user roles,
 * while maintaining service request flow integrity.
 */

// Protected routes requiring authentication
const PROTECTED_ROUTES = [
  '/confirmation',
  '/dashboard',
  '/find-contractor',
  '/payment',
  '/tracking',
  '/contractor/dashboard',
  '/contractor/profile',
  '/user/profile',
]

// Admin-only routes
const ADMIN_ROUTES = ['/admin']

// Contractor-only routes
const CONTRACTOR_ROUTES = ['/contractor/dashboard', '/contractor/profile']

// Client-only routes
const CLIENT_ROUTES = ['/dashboard']

// Routes that require service request context
const CONTEXT_REQUIRED_ROUTES = [
  '/details',
  '/confirmation',
  '/find-contractor',
  '/payment',
  '/tracking',
]

/**
 * Extract user session information from cookies
 * @param request - NextRequest object
 * @returns User session data or null
 */
function getUserSessionFromCookies(request: NextRequest): {
  email: string | null
  role: string | null
  isAuthenticated: boolean
} {
  const payloadToken = request.cookies.get('payload-token')?.value
  const userEmail = request.cookies.get('msh_userEmail')?.value
  const isAuthenticated = request.cookies.get('msh_authenticated')?.value === 'true'

  // Basic session info (we can't fully decode JWT in middleware without crypto)
  return {
    email: userEmail ? (userEmail.startsWith('"') ? JSON.parse(userEmail) : userEmail) : null,
    role: null, // Role checking will be done client-side for complex logic
    isAuthenticated: !!payloadToken || isAuthenticated,
  }
}

/**
 * Check if route matches any pattern in array
 * @param pathname - Current pathname
 * @param routes - Array of route patterns to check
 * @returns Whether route matches
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Add standard security headers
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Get user session info
  const session = getUserSessionFromCookies(request)

  // Check if this is a protected route
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!session.isAuthenticated) {
      // Redirect to appropriate login page
      if (matchesRoute(pathname, CONTRACTOR_ROUTES)) {
        const loginUrl = new URL('/contractor/login', request.url)
        loginUrl.searchParams.set('returnTo', pathname)
        return NextResponse.redirect(loginUrl)
      } else {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('returnTo', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // Set middleware check cookie for service request flow routes
  if (matchesRoute(pathname, CONTEXT_REQUIRED_ROUTES)) {
    response.cookies.set('msh_middleware_check', 'true', {
      maxAge: 60, // Short-lived cookie
      path: '/',
    })
  }

  // Add helpful headers for client-side navigation
  response.headers.set('X-Pathname', pathname)
  response.headers.set('X-Auth-Status', session.isAuthenticated ? 'authenticated' : 'anonymous')

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes that don't need protection
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/api/:path*',
    '/:path*',
    '/contractor/:path*',
    '/admin/:path*',
    '/user/:path*',
  ],
}
