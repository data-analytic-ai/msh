'use client'

import React, { useState } from 'react'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { FormBlock } from '@/blocks/Form/Component'
import { Media as MediaType } from '@/payload-types'
import ServiceCard from '@/components/ServiceCard'

interface UrgentFixServicesBlockProps {
  heading: string
  description: SerializedEditorState
  services: Array<{
    serviceType: string
    serviceIcon: string
    serviceDescription: string
    serviceImage?: MediaType
  }>
  showRequestForm: boolean
  requestForm?: {
    id: string
    confirmationType: 'message' | 'redirect'
    emails: any[]
    fields: any[]
    title: string
  }
  links?: Array<{
    link: {
      type: 'custom' | 'reference'
      label?: string
      page?: {
        id: string
        slug: string
      }
      url?: string
    }
  }>
  layout: 'grid' | 'list' | 'cards'
  enableHover: boolean
}

export const UrgentFixServicesBlock: React.FC<UrgentFixServicesBlockProps> = (props) => {
  const {
    heading,
    description,
    services,
    showRequestForm,
    requestForm,
    links,
    layout = 'grid',
    enableHover = true,
  } = props

  const [selectedService, setSelectedService] = useState<string | null>(null)

  const serviceNames: Record<string, string> = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    glass: 'Windows',
    hvac: 'HVAC',
    pests: 'Pest Control',
    locksmith: 'Locksmith',
    roofing: 'Roofing',
    siding: 'Siding',
    general: 'General Repairs',
  }

  return (
    <div className="container mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
          {heading}
        </h2>

        {description && (
          <div className="max-w-3xl mx-auto">
            <RichText data={description} />
          </div>
        )}
      </div>

      {/* Services section */}
      <div
        className={
          layout === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-12'
            : layout === 'cards'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'
              : 'space-y-4 mb-12'
        }
      >
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            icon={service.serviceIcon}
            name={serviceNames[service.serviceType] || service.serviceType}
            type={service.serviceType}
            description={service.serviceDescription}
            image={service.serviceImage}
            isSelected={selectedService === service.serviceType}
            enableHover={enableHover}
            layout={layout}
            onClick={() => setSelectedService(service.serviceType)}
          />
        ))}
      </div>

      {/* Main links */}
      {links && links.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 my-10">
          {links.map((linkItem, i) => {
            return <CMSLink key={i} {...linkItem.link} />
          })}
        </div>
      )}

      {/* Request form */}
      {showRequestForm && requestForm && selectedService && (
        <div className="bg-card border border-border rounded-lg shadow-md p-6 my-10 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            Request service: {serviceNames[selectedService] || selectedService}
          </h2>

          <div className="mb-6">
            {services
              .filter((service) => service.serviceType === selectedService)
              .map((service, index) => (
                <p key={index} className="text-muted-foreground">
                  {service.serviceDescription}
                </p>
              ))}
          </div>

          <FormBlock form={requestForm} enableIntro={false} blockType="formBlock" />
        </div>
      )}
    </div>
  )
}
