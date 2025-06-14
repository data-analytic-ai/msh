/**
 * RequestHeader
 *
 * Componente que muestra el encabezado de la página de confirmación
 * con el botón de navegación y el título.
 */
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const RequestHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 border-b bg-background dark:text-white">
      <div className="flex h-16 items-center px-4">
        <Link href=" /dashboard" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
    </header>
  )
}
