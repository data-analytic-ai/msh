import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { ServiceRequestStateProvider } from './ServiceRequestStateProvider'
import { AuthProvider } from './AuthProvider'
import { NotificationProvider } from '@/contexts/NotificationContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HeaderThemeProvider>
          <NotificationProvider>
            <ServiceRequestStateProvider>{children}</ServiceRequestStateProvider>
          </NotificationProvider>
        </HeaderThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
