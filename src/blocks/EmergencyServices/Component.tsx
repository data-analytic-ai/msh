'use client'

import React, { useState } from 'react'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { FormBlock } from '@/blocks/Form/Component'

// Debemos asegurarnos de definir correctamente los tipos según nuestro Payload
interface EmergencyServiceBlockProps {
  heading: string
  description: SerializedEditorState
  services: Array<{
    serviceType: 'plumbing' | 'electrical' | 'glass' | 'hvac' | 'pests' | 'locksmith'
    serviceIcon: string
    serviceDescription: string
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
  showContractorSection: boolean
  contractorHeading?: string
  contractorDescription?: SerializedEditorState
  contractorLinks?: Array<{
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
}

export const EmergencyServicesBlock: React.FC<EmergencyServiceBlockProps> = (props) => {
  const {
    heading,
    description,
    services,
    showRequestForm,
    requestForm,
    links,
    showContractorSection,
    contractorHeading,
    contractorDescription,
    contractorLinks,
  } = props

  const [selectedService, setSelectedService] = useState<
    EmergencyServiceBlockProps['services'][0]['serviceType'] | null
  >(null)

  const serviceNames: Record<EmergencyServiceBlockProps['services'][0]['serviceType'], string> = {
    plumbing: 'Plomería',
    electrical: 'Electricidad',
    glass: 'Vidrios',
    hvac: 'HVAC',
    pests: 'Plagas',
    locksmith: 'Cerrajería',
  }

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
          {heading}
        </h1>

        {description && (
          <div className="max-w-3xl mx-auto">
            <RichText data={description} />
          </div>
        )}
      </div>

      {/* Sección de servicios */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {services.map((service, index) => (
          <button
            key={index}
            className={`flex flex-col items-center p-4 rounded-lg ${
              selectedService === service.serviceType
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card shadow-sm hover:shadow-md transition-shadow'
            }`}
            onClick={() => setSelectedService(service.serviceType)}
          >
            <span className="text-4xl mb-2">{service.serviceIcon}</span>
            <span className="font-medium">{serviceNames[service.serviceType]}</span>
          </button>
        ))}
      </div>

      {/* Enlaces principales */}
      {links && links.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {links.map((linkItem, i) => {
            return <CMSLink key={i} {...linkItem.link} />
          })}
        </div>
      )}

      {/* Formulario de solicitud */}
      {showRequestForm && requestForm && selectedService && (
        <div className="bg-card border border-border rounded-lg p-6 my-10">
          <h2 className="text-2xl font-bold mb-6">
            Solicitar servicio de {serviceNames[selectedService]}
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

      {/* Sección para contratistas */}
      {showContractorSection && (
        <div className="mt-16 bg-muted p-8 rounded-lg">
          {contractorHeading && <h2 className="text-2xl font-bold mb-4">{contractorHeading}</h2>}

          {contractorDescription && (
            <div className="mb-6">
              <RichText data={contractorDescription} />
            </div>
          )}

          {contractorLinks && contractorLinks.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {contractorLinks.map((linkItem, i) => {
                return <CMSLink key={i} {...linkItem.link} />
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
