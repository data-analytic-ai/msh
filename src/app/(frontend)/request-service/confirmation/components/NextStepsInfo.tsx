/**
 * NextStepsInfo
 *
 * Componente que muestra información sobre los siguientes pasos
 * después de enviar una solicitud de servicio.
 */
'use client'

import React from 'react'

export const NextStepsInfo: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">What happens next?</h3>
      <div className="bg-muted p-4 rounded-md">
        <ol className="list-decimal list-inside space-y-2">
          <li>Professionals in your area will receive notification of your request.</li>
          <li>Within the next 24 hours, you should receive responses.</li>
          <li>We will send you updates via email and phone.</li>
          <li>You can select the professional that best suits your needs.</li>
        </ol>
      </div>
    </div>
  )
}
