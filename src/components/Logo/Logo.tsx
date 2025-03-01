import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  // Combina las clases predeterminadas con las clases personalizadas
  const imgClasses = clsx(
    'w-auto',
    'h-auto',
    'max-h-[70px]', 
    'sm:max-h-[75px]',
    'md:max-h-[80px]',
    'lg:max-h-[90px]',
    className
  )

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Roofing & Siding Hub Logo"
      width={400}
      height={107}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={imgClasses}
      src="https://roofingsidinghub.com/wp-content/uploads/2023/04/cropped-roofingsidinghub.com-2.png"
    />
  )
}
