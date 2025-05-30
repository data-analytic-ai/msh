/**
 * NextStepsInfo
 *
 * Componente que muestra información sobre los siguientes pasos
 * después de enviar una solicitud de servicio usando el nuevo
 * sistema de licitaciones.
 */
'use client'

import React from 'react'
import { Clock, MessageCircle, Star, CreditCard } from 'lucide-react'

export const NextStepsInfo: React.FC = () => {
  return (
    <div className="space-y-4 dark:text-white">
      <h3 className="text-lg font-semibold">¿Qué sucede ahora?</h3>
      <div className="bg-muted p-4 rounded-md">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Contratistas están revisando tu solicitud</h4>
              <p className="text-sm text-muted-foreground">
                Los profesionales cercanos han sido notificados y están preparando sus cotizaciones.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Recibirás cotizaciones en tiempo real</h4>
              <p className="text-sm text-muted-foreground">
                Las ofertas aparecerán automáticamente en esta página. Normalmente la primera llega
                en menos de 2 horas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Compara y elige la mejor opción</h4>
              <p className="text-sm text-muted-foreground">
                Podrás ver precios, perfiles de contratistas, reseñas y hacer preguntas antes de
                decidir.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Pago seguro y protegido</h4>
              <p className="text-sm text-muted-foreground">
                El pago se procesa de forma segura y se libera al contratista solo cuando confirmes
                que el trabajo está completo.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Consejo:</strong> Mantén esta página abierta para ver las cotizaciones en
            tiempo real. También te enviaremos notificaciones por email cuando lleguen nuevas
            ofertas.
          </p>
        </div>
      </div>
    </div>
  )
}
