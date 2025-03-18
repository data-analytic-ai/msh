import { User } from '@/payload-types'

type MeResponse = {
  user: User | null
}

// Function to get the currently authenticated user
export const getMe = async (): Promise<MeResponse> => {
  try {
    // Get the user from the /api/users/me endpoint
    const response = await fetch('/api/users/me', {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return { user: null }
    }

    const userJson = await response.json()
    return { user: userJson.user || null }
  } catch (error) {
    console.error('Error fetching authenticated user:', error)
    return { user: null }
  }
}
