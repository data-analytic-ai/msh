/**
 * UnauthenticatedState - Unauthenticated user state component
 *
 * Displays a message when the user is not authenticated and explains
 * that they need to complete account creation to receive bids.
 *
 * @returns {JSX.Element} - The rendered unauthenticated state component
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export const UnauthenticatedState: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Cuenta requerida para ver propuestas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Para recibir propuestas de contratistas, necesitas completar la creación de tu cuenta.
        </p>
      </CardContent>
    </Card>
  )
}
