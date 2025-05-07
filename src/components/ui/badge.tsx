import React from 'react'
import { cn } from '@/utilities/ui'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
}

/**
 * Badge component
 *
 * A simple badge component that displays short information with different
 * visual styles based on the variant. Uses theme variables for consistent styling.
 *
 * @param {string} className - Additional classes to apply to the badge
 * @param {'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'} variant - Visual style variant
 * @returns {JSX.Element} - The rendered badge component
 */
export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-destructive text-destructive-foreground': variant === 'destructive',
          'text-foreground border border-input': variant === 'outline',
          'bg-success-light text-success-light-foreground': variant === 'success',
          'bg-warning-light text-warning-light-foreground': variant === 'warning',
          'bg-info-light text-info-light-foreground': variant === 'info',
        },
        className,
      )}
      {...props}
    />
  )
}

// For future compatibility with class-variance-authority
export const badgeVariants = {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'text-foreground border border-input',
      success: 'bg-success-light text-success-light-foreground',
      warning: 'bg-warning-light text-warning-light-foreground',
      info: 'bg-info-light text-info-light-foreground',
    },
  },
}
