import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { ServiceRequestStateProvider } from './ServiceRequestStateProvider'
import { AuthProvider } from './AuthProvider'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HeaderThemeProvider>
          <ServiceRequestStateProvider>{children}</ServiceRequestStateProvider>
        </HeaderThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
