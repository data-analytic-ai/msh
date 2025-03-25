import React from 'react'
import { Page } from '../payload-types'

import { ArchiveBlock } from './ArchiveBlock/Component'
import { BannerBlock } from './Banner/Component'
import { CallToActionBlock } from './CallToAction/Component'
import { CodeBlock } from './Code/Component'
import { ContentBlock } from './Content/Component'
import { MediaBlock } from './MediaBlock/Component'
import { RelatedPosts } from './RelatedPosts/Component'
import { FormBlock } from './Form/Component'
import { EmergencyServicesBlock } from './EmergencyServices/Component'
import { UrgentFixServicesBlock } from './UrgentFixServices/Component'

const blockComponents = {
  archiveBlock: ArchiveBlock,
  bannerBlock: BannerBlock,
  callToAction: CallToActionBlock,
  codeBlock: CodeBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  relatedPosts: RelatedPosts,
  emergencyServices: EmergencyServicesBlock,
  urgentFixServices: UrgentFixServicesBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][][]
}> = (props) => {
  const { blocks } = props

  if (!blocks || blocks?.length === 0) {
    return null
  }

  return (
    <div className="my-8 space-y-16">
      {blocks.map((block, index) => {
        const Block = blockComponents?.[block.blockType as keyof typeof blockComponents]

        if (Block) {
          return (
            <div
              key={index}
              data-block-type={block.blockType}
              className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}
              data-index={index}
            >
              <Block {...(block as any)} />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
