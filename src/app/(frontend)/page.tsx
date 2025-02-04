import { getPayload } from 'payload'
import payloadConfig from '@/payload.config'
import React from 'react'
import type { Page as PageType } from '@/payload-types'
// Un componente para renderizar tus datos
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Pages } from '@/collections/Pages'
import { RenderHero } from '@/heros/RenderHero'

// O tu HeroSection, etc.

export default async function Home() {
  const payload = await getPayload({ config: payloadConfig })

  // 1. Buscar la página en la colección `pages` que tenga el slug 'rfsdhub-landingpage'
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'rfsdhub-landingpage' },
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
      <RenderHero  type='rfsdhubHeroSection' richText={page.hero.richText} form={page.hero.form} media={page.hero.media}  />
      <RenderBlocks blocks={page.layout} />
    </>

  )
}
