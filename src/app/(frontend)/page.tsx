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

  // 1. Buscar la página en la colección `pages` que tenga el slug 'msh-landingpage'
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
      <RenderHero
        type="urgentFixHero"
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
