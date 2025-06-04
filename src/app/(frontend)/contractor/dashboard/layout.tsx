'use client'

/**
 * ContractorDashboardLayout - Layout for contractor dashboard pages
 *
 * Provides consistent layout with responsive sidebar navigation for all contractor
 * dashboard pages. Handles mobile menu state and desktop sidebar with responsive design.
 *
 * @param {React.ReactNode} children - Page content to render
 * @returns {JSX.Element} Dashboard layout with responsive sidebar
 */
import React, { useState, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { ContractorSidebar } from './components/ContractorSidebar'

interface ContractorDashboardLayoutProps {
  children: React.ReactNode
}

interface MobileMenuContextType {
  openMobileMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext)
  if (!context) {
    throw new Error('useMobileMenu must be used within ContractorDashboardLayout')
  }
  return context
}

export default function ContractorDashboardLayout({ children }: ContractorDashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openMobileMenu = () => setIsMobileMenuOpen(true)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <MobileMenuContext.Provider value={{ openMobileMenu }}>
      <div className="flex min-h-screen bg-background dark:bg-background">
        <ContractorSidebar
          activePath={pathname}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={closeMobileMenu}
        />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  )
}
