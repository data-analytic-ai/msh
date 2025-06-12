import { useEffect, useState } from 'react'

/**
 * useLayoutDimensions - Hook to calculate layout dimensions dynamically
 *
 * Calculates header and footer heights to properly position the contractor sidebar
 * and avoid overlapping with main app layout elements.
 *
 * @returns {Object} Object containing calculated dimensions and CSS values
 */
export const useLayoutDimensions = () => {
  const [dimensions, setDimensions] = useState({
    headerHeight: 80,
    footerHeight: 120,
    sidebarTopOffset: '80px',
    sidebarBottomOffset: '120px',
    availableHeight: 600,
  })

  useEffect(() => {
    const calculateDimensions = () => {
      // Calculate header height
      const header = document.querySelector('header')
      const headerHeight = header ? header.offsetHeight : 80

      // Calculate footer height
      const footer = document.querySelector('footer')
      const footerHeight = footer ? footer.offsetHeight : 120

      // Use safe minimums
      const safeHeaderHeight = Math.max(headerHeight, 60)
      const safeFooterHeight = Math.max(footerHeight, 60)

      // Calculate available height
      const viewportHeight = window.innerHeight
      const availableHeight = Math.max(300, viewportHeight - safeHeaderHeight - safeFooterHeight)

      const newDimensions = {
        headerHeight: safeHeaderHeight,
        footerHeight: safeFooterHeight,
        sidebarTopOffset: `${safeHeaderHeight}px`,
        sidebarBottomOffset: `${safeFooterHeight}px`,
        availableHeight,
      }

      console.log('📐 Sidebar dimensions:', {
        viewport: viewportHeight,
        header: safeHeaderHeight,
        footer: safeFooterHeight,
        available: availableHeight,
        isSmall: availableHeight < 500,
      })

      setDimensions(newDimensions)
    }

    // Calculate on mount
    calculateDimensions()

    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(calculateDimensions, 100) // Small delay to ensure layout has settled
    }

    window.addEventListener('resize', handleResize)

    // Recalculate when DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      setTimeout(calculateDimensions, 100)
    })

    if (typeof window !== 'undefined') {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [])

  return dimensions
}
