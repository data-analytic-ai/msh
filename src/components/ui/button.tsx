import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

/**
 * Button component with various size and style variants
 *
 * Supports different visual styles through variants and sizes.
 * Implements responsive sizing with xs size option for small screens.
 *
 * @param {boolean} asChild - Whether to render as a child element
 * @param {string} className - Additional classes to apply
 * @param {Size} size - Button size variant
 * @param {Variant} variant - Button style variant
 * @param {React.Ref<HTMLButtonElement>} ref - Button reference
 * @returns {JSX.Element} - The rendered button component
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        xs: 'h-7 px-2 py-1 text-xs rounded',
        sm: 'h-8 rounded px-3 py-1',
        default: 'h-9 sm:h-10 px-3 sm:px-4 py-2',
        lg: 'h-10 sm:h-11 rounded px-6 sm:px-8 text-base',
        icon: 'h-8 w-8 sm:h-10 sm:w-10',
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-primary/10 hover:text-primary',
        link: 'text-primary items-start justify-start underline-offset-4 hover:underline',
        outline:
          'border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  className,
  size,
  variant,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />
}

export { Button, buttonVariants }
