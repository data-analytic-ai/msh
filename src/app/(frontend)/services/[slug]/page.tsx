import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'

import type { Service } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamicParams = true

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const services = await payload.find({
    collection: 'services' as any,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = services.docs.map(({ slug }) => {
    return { type: slug }
  })

  return params
}

type Args = {
  params: Promise<{
    type?: string
  }>
}

export default async function ServicePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { type = '' } = await paramsPromise
  const url = '/services/' + type
  const service = await queryServiceBySlug({ slug: type })

  if (!service) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="container mx-auto">
        {/* Hero section */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-6xl mb-4">{service.icon}</span>
          <h1 className="text-4xl font-bold mb-4">{service.name}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">{service.shortDescription}</p>
          <Button asChild size="lg">
            <Link href={`/request-service?type=${service.type}`}>Request This Service</Link>
          </Button>
        </div>

        {/* Image and content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {service.featuredImage && (
            <div className="rounded-lg overflow-hidden aspect-video relative">
              <Media
                resource={service.featuredImage as any}
                className="object-cover"
                fill
                size="large"
                alt={service.name}
              />
            </div>
          )}
          <div className="prose max-w-none dark:prose-invert">
            <RichText data={service.content} />
          </div>
        </div>

        {/* Pricing section */}
        {service.pricing && service.pricing.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Pricing Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.pricing.map((price, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-6 ${price.isPopular ? 'bg-primary/5 border-primary' : 'bg-card'}`}
                >
                  {price.isPopular && (
                    <div className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{price.name}</h3>
                  <p className="text-3xl font-bold mb-4">{price.price}</p>
                  <p className="text-muted-foreground mb-6">{price.description}</p>
                  <Button
                    asChild
                    variant={price.isPopular ? 'default' : 'outline'}
                    className="w-full"
                  >
                    <Link href={`/request-service?type=${service.type}&plan=${price.name}`}>
                      Select
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs section */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto divide-y">
              {service.faqs.map((faq, index) => (
                <div key={index} className="py-5">
                  <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Button asChild size="lg">
            <Link href={`/request-service?type=${service.type}`}>Request This Service</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { type = '' } = await paramsPromise
  const service = await queryServiceBySlug({ slug: type })

  return generateMeta({ doc: service })
}

const queryServiceBySlug = cache(async ({ slug }: { slug: string }): Promise<Service | null> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'services',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs?.[0] as Service) || null
})
