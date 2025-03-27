import React from 'react'
import { Page } from '../payload-types'
import { blockComponents } from '.'

export const RenderBlocks: React.FC<{
  blocks: Page['layout']
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
              {/* The most direct solution is to use a @ts-ignore comment to tell the compiler to ignore the error on that specific line. While it's not ideal to ignore TypeScript errors, in this case it's justified because:
             At runtime, each component receives exactly the properties it needs based on its blockType
             The alternative would be to implement a complex structure of discriminated types that could be excessive
             If we prefer a solution without @ts-ignore, we could:
             Create a specific discriminated union type for each component
             Extract only the properties that each component needs
             Implement a custom renderer for each block type
             But for most cases, @ts-ignore is sufficient and keeps the code simpler */}
              {/* @ts-expect-error - Cada componente espera props específicos basados en blockType */}
              <Block {...block} />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
