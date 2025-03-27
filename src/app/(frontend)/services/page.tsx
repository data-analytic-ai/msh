import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { Metadata } from 'next'
import { Media } from '@/components/Media'

import { Service } from '@/payload-types'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600
export const metadata: Metadata = {
  title: 'Services | UrgentFix',
  description: 'Discover our range of emergency repair services for your home',
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const servicesQuery = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 10,
    overrideAccess: false,
    select: {
      name: true,
      icon: true,
      shortDescription: true,
      featuredImage: true,
      slug: true,
      type: true,
    },
  })

  const services = servicesQuery.docs as Service[]

  return (
    <div className="container mx-auto py-16">
      <PageClient />
      <h1 className="text-4xl font-bold mb-8 text-center">Our Services</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/services/${(service as any).slug}`}
            className="group block"
          >
            <div className="bg-card border rounded-lg overflow-hidden shadow-sm transition-all duration-300 h-full hover:shadow-md">
              {service.featuredImage && (
                <div className="h-48 w-full relative">
                  <Media className="object-cover" alt={service.name} />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl" role="img" aria-label={service.name}>
                    {service.icon}
                  </span>
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                    {service.name}
                  </h2>
                </div>
                <p className="text-muted-foreground">{service.shortDescription}</p>

                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
