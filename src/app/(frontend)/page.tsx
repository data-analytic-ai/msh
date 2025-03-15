import { getPayload } from 'payload'
import payloadConfig from '@/payload.config'
import React from 'react'
// Un componente para renderizar tus datos
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import Link from 'next/link'

// O tu HeroSection, etc.

export default async function Home() {
  const payload = await getPayload({ config: payloadConfig })

  // 1. Buscar la página en la colección `pages` que tenga el slug 'rfsdhub-landingpage'
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'msh-landingpage' },
    },
    limit: 1,
    overrideAccess: true, // false para usar Access Control
  })
  const page = result?.docs?.[0]

  if (!page) {
    // Manejo del caso de no encontrar la página
    return <div>No se encontró la página de inicio</div>
  }

  // 2. Renderizar la página usando tus componentes
  return (
    <>
      {/* Banner de Servicios de Emergencia */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-bold">
              Emergency? Get immediate help from verified professionals
            </span>
          </div>
          <Link
            href="/emergency-services"
            className="bg-white text-red-600 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-100 transition-colors"
          >
            24/7 Emergency Services
          </Link>
        </div>
      </div>

      <RenderHero
        type="rfsdhubHeroSection"
        richText={page.hero.richText}
        form={page.hero.form}
        media={page.hero.media}
      />
      <div className="px-4 md:px-6 lg:px-8">
        <RenderBlocks blocks={page.layout} />
      </div>
    </>
  )
}
