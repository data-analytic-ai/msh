import { buildConfig } from "payload/config"
import { Leads } from "./collections/Leads"
import { LeadsSection } from "./blocks/LeadsSection/config"

export default buildConfig({
  collections: [
    // ... other collections
    Leads,
  ],
  globals: [
    {
      slug: "pages",
      fields: [
        {
          name: "content",
          type: "blocks",
          blocks: [
            // ... other blocks
            LeadsSection,
          ],
        },
      ],
    },
  ],
})

