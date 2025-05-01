import { type } from "arktype"
import * as fs from "fs/promises"

import { availableTags } from "@/lib/steam/client.js"

type Visibility = "private" | "public" | "friends" | "unlisted"
type Tag = (typeof availableTags)[number]

// eslint-disable-next-line
const ConfigType = type({
    id: "string?",
    title: "string > 0",
    preview: "string > 0",
    description: "string > 0",
    visibility: type("string").narrow<Visibility>(v => ["private", "public", "friends", "unlisted"].includes(v)).default("public"),
    tags: type("string").narrow<Tag>((t: string) => availableTags.includes(t as Tag)).array().atLeastLength(1)
})

export type WorkshopConfig = {
    id?: string // The ID of the mod
    title: string // The title of the mod
    preview: string // The preview image path
    description: string // The description of the mod
    visibility: Visibility // The visibility of the mod
    tags: Tag[] // The tags for the mod
}

export async function readWorkshopConfigFile(configPath = "workshop.json"): Promise<WorkshopConfig> {
    const configContent = await fs.readFile(configPath, "utf-8")
    const config = JSON.parse(configContent) as unknown
    const result = ConfigType(config)
    if (result instanceof type.errors) {
        throw new Error(`Invalid workshop.json configuration: ${result.summary}`)
    }
    else {
        return {
            id: result.id,
            title: result.title,
            preview: result.preview,
            description: result.description,
            visibility: result.visibility,
            tags: result.tags
        } satisfies WorkshopConfig
    }
}

export async function writeWorkshopConfigFile(config: Required<WorkshopConfig>, configPath = "workshop.json"): Promise<void> {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2))
}
