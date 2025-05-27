import clsx from 'clsx'
import React from 'react'

/**
 * Logo - Main application logo component
 *
 * Displays the "UrgentFix" logo with consistent branding colors.
 * Uses custom color variables defined in globals.css for brand consistency.
 * "Urgent" appears in white (or dark text in light mode) and "Fix" in orange.
 *
 * @param {string} className - Additional classes to apply to the logo container
 * @param {'lazy' | 'eager'} loading - Image loading strategy
 * @param {'auto' | 'high' | 'low'} priority - Image loading priority
 * @returns {JSX.Element} - The rendered logo component
 */
export const Logo = (props: Props) => {
  const { className } = props

  // Combina las clases predeterminadas con las clases personalizadas
  const logoClasses = clsx(
    'font-bold',
    'text-xl',
    'sm:text-xl',
    'md:text-xl',
    'transition-colors',
    'duration-200',
    className,
  )

  return (
    <div className={logoClasses}>
      <span className="text-foreground dark:text-white">Emergency</span>
      <br />
      <span className="text-primary">Repair</span>
      <span className="text-primary">24</span>
    </div>
  )
}

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}
