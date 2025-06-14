/**
 * BidDetail - Detailed bid view component
 *
 * Displays comprehensive information about a specific bid including
 * contractor details, price breakdown, materials, portfolio, and
 * contact information. Provides full set of bid management actions.
 *
 * @param {Bid} bid - The bid to display in detail
 * @param {Function} onBack - Callback to return to list view
 * @param {Function} onAccept - Callback when bid is accepted
 * @param {Function} onReject - Callback when bid is rejected
 * @param {boolean} isAccepting - Whether accept action is in progress
 * @param {boolean} isRejecting - Whether reject action is in progress
 * @returns {JSX.Element} - The rendered bid detail component
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Phone as PhoneIcon,
  Mail,
  MapPin,
  Image,
} from 'lucide-react'
import { Bid } from '@/types/bid'
import { ContractorInfo } from './ContractorInfo'
import { formatCurrency } from '@/utils/bidHelpers'

interface BidDetailProps {
  bid: Bid
  onBack: () => void
  onAccept: (bidId: string) => void
  onReject?: (bidId: string) => void
  isAccepting: boolean
  isRejecting?: boolean
}

export const BidDetail: React.FC<BidDetailProps> = ({
  bid,
  onBack,
  onAccept,
  onReject,
  isAccepting,
  isRejecting = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a propuestas
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Contractor Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <ContractorInfo contractor={bid.contractor} detailed={true} size="lg" />
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(bid.amount)}</div>
              <Badge
                variant={bid.status === 'accepted' ? 'default' : 'outline'}
                className={bid.status === 'accepted' ? 'bg-green-600' : ''}
              >
                {bid.status === 'pending' && 'Pendiente'}
                {bid.status === 'accepted' && 'Aceptada'}
                {bid.status === 'rejected' && 'Rechazada'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bid Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la propuesta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Descripción del trabajo:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{bid.description}</p>
          </div>

          {bid.priceBreakdown && (
            <div>
              <h4 className="font-medium mb-2">Desglose de precios:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mano de obra:</span>
                  <span>{formatCurrency(bid.priceBreakdown.labor)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materiales:</span>
                  <span>{formatCurrency(bid.priceBreakdown.materials)}</span>
                </div>
                {bid.priceBreakdown.additional > 0 && (
                  <div className="flex justify-between">
                    <span>Adicionales:</span>
                    <span>{formatCurrency(bid.priceBreakdown.additional)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(bid.amount)}</span>
                </div>
                {bid.priceBreakdown.notes && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <strong>Notas:</strong> {bid.priceBreakdown.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {bid.estimatedDuration && (
              <div>
                <h4 className="font-medium mb-1">Duración estimada:</h4>
                <p className="text-sm text-muted-foreground">{bid.estimatedDuration}</p>
              </div>
            )}
            {bid.availability && (
              <div>
                <h4 className="font-medium mb-1">Disponibilidad:</h4>
                <p className="text-sm text-muted-foreground">{bid.availability}</p>
              </div>
            )}
          </div>

          {bid.warranty && (
            <div>
              <h4 className="font-medium mb-1">Garantía:</h4>
              <p className="text-sm text-muted-foreground">{bid.warranty}</p>
            </div>
          )}

          {bid.materials && bid.materials.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Materiales incluidos:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {bid.materials.map((material, index) => (
                  <li key={index} className="flex justify-between">
                    <span>• {material.item}</span>
                    {material.cost && (
                      <span className="font-medium">{formatCurrency(material.cost)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bid.contractor.phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{bid.contractor.phone}</span>
              <Button size="sm" variant="outline">
                Llamar
              </Button>
            </div>
          )}
          {bid.contractor.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{bid.contractor.email}</span>
              <Button size="sm" variant="outline">
                Email
              </Button>
            </div>
          )}
          {bid.contractor.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{bid.contractor.location}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio */}
      {bid.portfolio && bid.portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trabajos anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bid.portfolio.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {bid.status === 'pending' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => onAccept(bid.id)}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  'Aceptando...'
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Aceptar propuesta
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Negociar precio
              </Button>
              {onReject && (
                <Button
                  variant="ghost"
                  onClick={() => onReject(bid.id)}
                  disabled={isRejecting}
                  className="text-destructive hover:text-destructive"
                >
                  {isRejecting ? 'Rechazando...' : 'Rechazar'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
