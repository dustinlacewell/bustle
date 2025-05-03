import { availableTags, WorkshopItem } from "./client"
import { getCollection } from "./collection"
import { flattenResult, ModItem } from "./search"
import { getPersonaName } from "./utils"

export const indexByTag = async (ids: bigint[]) => {
    const results = await getCollection(ids)
    // Group items by tags
    const taggedItems = new Map<string, Array<{ id: bigint, data: ModItem }>>()

    // Initialize with "Unknown" category for items without tags
    taggedItems.set("Unknown", [])

    // Initialize with all available tags
    availableTags.forEach((tag) => {
        taggedItems.set(tag, [])
    })

    // Process each item and add to appropriate tag groups
    for (const item of results) {
        const name = await getPersonaName(item.owner.steamId64)
        const flatData = flattenResult(item as unknown as Required<WorkshopItem>, name)

        if (!item.tags || item.tags.length === 0) {
            taggedItems.get("Unknown")!.push({ id: item.id, data: flatData })
            continue
        }

        // Add item to each of its tag categories
        for (const tag of item.tags) {
            if (!taggedItems.has(tag)) {
                taggedItems.set(tag, [])
            }
            taggedItems.get(tag)!.push({ id: item.id, data: flatData })
        }
    }

    return taggedItems
}
