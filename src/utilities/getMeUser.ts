import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User } from '../payload-types'
import { getServerSideURL } from './getURL'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  user: User | null
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}

  try {
    // Get cookies from server-side headers
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    // If no token, return null user without redirecting immediately
    if (!token) {
      console.log('🚫 No payload-token found in SSR')
      if (nullUserRedirect) {
        redirect(nullUserRedirect)
      }
      return { user: null }
    }

    // Build proper headers for server-side request
    const cookieHeader = cookieStore.toString()

    const meUserReq = await fetch(`${getServerSideURL()}/api/users/me`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Prevent caching for auth requests
    })

    console.log('📡 SSR /api/users/me response status:', meUserReq.status)

    if (!meUserReq.ok) {
      console.log('❌ SSR users/me request failed')
      if (nullUserRedirect) {
        redirect(nullUserRedirect)
      }
      return { user: null }
    }

    const responseData = await meUserReq.json()
    const user = responseData.user || responseData || null

    console.log('📦 SSR users/me response:', user ? `User: ${user.email}` : 'No user')

    if (validUserRedirect && user) {
      redirect(validUserRedirect)
    }

    if (nullUserRedirect && !user) {
      redirect(nullUserRedirect)
    }

    return { user }
  } catch (error) {
    console.error('🚨 Error in getMeUser SSR:', error)

    if (nullUserRedirect) {
      redirect(nullUserRedirect)
    }

    return { user: null }
  }
}
