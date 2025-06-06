import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'dark'

export const getImplicitPreference = (): Theme | null => {
  // Return null to indicate no system preference, forcing the use of defaultTheme
  return null
}
