/**
 * Storage Utilities
 *
 * Helpers for safely storing and retrieving data from localStorage
 * with proper error handling and type checking.
 */

/**
 * Safely stores a JSON value in localStorage with a user-specific key
 *
 * @param key - Base key name to store under (will be appended with user ID)
 * @param value - Value to store
 */
export const safelyStoreJSON = (key: string, value: any): void => {
  if (typeof window === 'undefined') return

  try {
    // Get user ID from localStorage or use anonymous
    let userId = localStorage.getItem('msh_userEmail')
    if (!userId) {
      userId = localStorage.getItem('msh_anonymous_session')
      if (userId) {
        userId = `anonymous_${userId}`
      } else {
        userId = 'anonymous'
      }
    } else {
      // Handle JSON string case
      try {
        userId = JSON.parse(userId)
      } catch {
        // keep as is if not valid JSON
      }
    }

    // Create user-specific key
    const userKey = `${key}_${userId}`

    // Stringify and store
    localStorage.setItem(userKey, JSON.stringify(value))
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error)
  }
}
