/**
 * Password Utilities
 *
 * Functions for generating secure passwords and handling password-related operations.
 */

/**
 * Generate a secure random password
 *
 * Creates a password with a mix of lowercase letters, uppercase letters,
 * numbers, and special characters to ensure security.
 *
 * @param {number} length - The desired password length (default: 10)
 * @returns {string} A random password
 */
export function generateRandomPassword(length: number = 10): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+[]{}|;:,.<>?'

  // Include at least one of each character type
  let password = ''
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += special.charAt(Math.floor(Math.random() * special.length))

  // Fill the rest with random characters from all pools
  const allChars = lowercase + uppercase + numbers + special
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle the password to avoid having the first 4 characters in a predictable pattern
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('')
}

/**
 * Validate password strength
 *
 * Checks if a password meets minimum security requirements.
 *
 * @param {string} password - The password to validate
 * @returns {boolean} True if the password is strong enough
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters long
  if (password.length < 8) return false

  // Contains at least one lowercase letter
  if (!/[a-z]/.test(password)) return false

  // Contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false

  // Contains at least one number
  if (!/[0-9]/.test(password)) return false

  // Contains at least one special character
  if (!/[^A-Za-z0-9]/.test(password)) return false

  return true
}
