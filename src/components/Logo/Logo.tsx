import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  // Combina las clases predeterminadas con las clases personalizadas
  const logoClasses = clsx(
    'font-bold',
    'text-2xl',
    'sm:text-3xl',
    'md:text-4xl',
    'text-primary',
    'hover:text-primary/90',
    'transition-colors',
    'duration-200',
    className,
  )

  return (
    <div className={logoClasses}>
      <span className="text-primary dark:text-white">Urgent</span>
      <span className="text-accent">Fix</span>
    </div>
  )
}
