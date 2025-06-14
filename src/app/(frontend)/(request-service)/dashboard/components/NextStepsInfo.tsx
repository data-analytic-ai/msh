/**
 * NextStepsInfo
 *
 * Component that displays information about the next steps
 * after submitting a service request using the new
 * bidding system.
 */
'use client'

import React from 'react'
import { Clock, MessageCircle, Star, CreditCard } from 'lucide-react'

export const NextStepsInfo: React.FC = () => {
  return (
    <div className="space-y-4 dark:text-white">
      <h3 className="text-lg font-semibold">What happens now?</h3>
      <div className="bg-muted p-4 rounded-md">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Contractors are reviewing your request</h4>
              <p className="text-sm text-muted-foreground">
                Nearby professionals have been notified and are preparing their quotes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">You&apos;ll receive quotes in real-time</h4>
              <p className="text-sm text-muted-foreground">
                Offers will appear automatically on this page. Usually, the first one arrives in
                less than 2 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Compare and choose the best option</h4>
              <p className="text-sm text-muted-foreground">
                You&apos;ll be able to see prices, contractor profiles, reviews, and ask questions
                before deciding.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Secure and protected payment</h4>
              <p className="text-sm text-muted-foreground">
                Payment is processed securely and released to the contractor only when you confirm
                that the work is complete.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Keep this page open to see quotes in real-time. We&apos;ll also
            send you email notifications when new offers arrive.
          </p>
        </div>
      </div>
    </div>
  )
}
