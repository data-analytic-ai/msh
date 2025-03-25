import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { ServiceRequestProvider } from '@/contexts/ServiceRequestContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <ServiceRequestProvider>{children}</ServiceRequestProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
