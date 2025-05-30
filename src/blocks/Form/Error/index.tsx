import * as React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorProps {
  message?: string
  className?: string
}

/**
 * Error - Enhanced error message component
 *
 * Displays validation error messages with improved styling and accessibility.
 * Shows specific error messages when provided, otherwise falls back to generic message.
 *
 * @param {ErrorProps} props - Error message and styling options
 * @returns {JSX.Element} - Rendered error message
 */
export const Error: React.FC<ErrorProps> = ({
  message = 'Este campo es requerido',
  className = '',
}) => {
  return (
    <div className={`mt-2 flex items-start gap-2 text-red-600 text-sm ${className}`} role="alert">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
