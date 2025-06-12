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
  toggleDesktopSidebar: () => void
  isDesktopSidebarOpen: boolean
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
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)

  const openMobileMenu = () => setIsMobileMenuOpen(true)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleDesktopSidebar = () => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)

  return (
    <MobileMenuContext.Provider
      value={{ openMobileMenu, toggleDesktopSidebar, isDesktopSidebarOpen }}
    >
      {/* Container that respects the overall app layout */}
      <div className="flex min-h-full bg-background dark:bg-background relative">
        <ContractorSidebar
          activePath={pathname}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={closeMobileMenu}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          onDesktopSidebarToggle={toggleDesktopSidebar}
        />
        {/* Main content with dynamic left margin based on sidebar state */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-h-full ${isDesktopSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}
        >
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  )
}
