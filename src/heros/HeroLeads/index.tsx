"use client"
import { Page } from "@/payload-types"


type leadsHeroSection = {
    richText?: any
    media?: any
    
  }

export const HeroLeads: React.FC<Page['hero']> = ({richText, media}) => {
 
    return(
        <div><h1>Hero de prueba</h1></div>
    )
}

