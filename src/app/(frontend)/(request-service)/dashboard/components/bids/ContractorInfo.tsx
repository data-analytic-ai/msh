/**
 * ContractorInfo - Reusable contractor information component
 *
 * Displays contractor profile information including avatar, name, rating,
 * verification status, specialties, and other relevant details.
 * Can be used in different contexts (bid cards, detail views, etc.).
 *
 * @param {BidContractor} contractor - Contractor information object
 * @param {boolean} detailed - Whether to show detailed information
 * @param {string} size - Size variant for the display ('sm' | 'md' | 'lg')
 * @returns {JSX.Element} - The rendered contractor info component
 */

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, Shield, Award, User } from 'lucide-react'
import { BidContractor } from '@/types/bid'
import { getContractorInitials } from '@/utils/bidHelpers'

interface ContractorInfoProps {
  contractor: BidContractor
  detailed?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const ContractorInfo: React.FC<ContractorInfoProps> = ({
  contractor,
  detailed = false,
  size = 'md',
}) => {
  const avatarSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar className={avatarSizes[size]}>
        <AvatarImage src={contractor.profileImage?.url} />
        <AvatarFallback>
          {contractor.firstName && contractor.lastName ? (
            getContractorInitials(contractor.firstName, contractor.lastName)
          ) : (
            <User className={iconSizes[size]} />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium ${textSizes[size]}`}>
            {contractor.name || `${contractor.firstName} ${contractor.lastName}`}
          </h4>
          {contractor.verified && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Shield className="h-3 w-3" />
              Verificado
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            {contractor.rating} ({contractor.reviewCount} reseñas)
          </div>
          {detailed && contractor.completedJobs && (
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-blue-500" />
              {contractor.completedJobs} trabajos completados
            </div>
          )}
        </div>

        {detailed && contractor.experience && (
          <p className="text-sm text-muted-foreground mb-2">Experiencia: {contractor.experience}</p>
        )}

        {contractor.specialties && contractor.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contractor.specialties.slice(0, detailed ? undefined : 2).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {!detailed && contractor.specialties.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{contractor.specialties.length - 2} más
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
