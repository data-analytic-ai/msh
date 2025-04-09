import React from 'react'
import { cn } from '@/utilities/ui'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

/**
 * Badge component
 *
 * A simple badge component that can be styled with className
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
    },
  },
}
