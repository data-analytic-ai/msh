/**
 * EmptyBidsState - Empty state component for bids
 *
 * Displays a helpful message when no bids have been received yet.
 * Provides options to refresh or search for contractors manually after
 * a certain amount of time has passed.
 *
 * @param {number} timeElapsed - Minutes elapsed since request
 * @param {Function} onRefresh - Callback to refresh bids
 * @returns {JSX.Element} - The rendered empty state component
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { formatTimeElapsed, shouldSuggestManualSearch } from '@/utils/bidHelpers'

interface EmptyBidsStateProps {
  timeElapsed: number
  onRefresh: () => void
}

export const EmptyBidsState: React.FC<EmptyBidsStateProps> = ({ timeElapsed, onRefresh }) => {
  const showManualSearch = shouldSuggestManualSearch(timeElapsed)

  return (
    <div className="text-center py-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Tu solicitud está siendo revisada</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Los contratistas cercanos están evaluando tu solicitud. <br />
            Normalmente recibimos las primeras propuestas en menos de 2 horas.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Tiempo transcurrido: {formatTimeElapsed(timeElapsed)}
          </p>
          {showManualSearch && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm mb-2">Han pasado más de 24 horas sin propuestas.</p>
              <Button size="sm" variant="outline">
                Buscar contratistas manualmente
              </Button>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Actualizar
        </Button>
      </div>
    </div>
  )
}
