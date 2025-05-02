import chalk from "chalk"
import { command, flag } from "cmd-ts"

import { Logger } from "@/lib/logger.js"
import { getSelectedTags, tagFlags } from "@/lib/steam/cli.js"
import steam, { availableTags, WorkshopItem } from "@/lib/steam/client.js"
import { printItemLine } from "@/lib/steam/print.js"
import { flattenResult } from "@/lib/steam/search.js"
import { dump, getPersonaName } from "@/lib/steam/utils.js"

import { verbose } from "../args.js"

export const subs = command({
    name: "subs",
    description: "List subscribed Steam Workshop items",
    args: {
        details: flag({
            long: "details",
            short: "d",
            description: "Show detailed information for each item"
        }),
        ...tagFlags,
        verbose
    },
    handler: async ({ details, verbose, ...tags }) => {
        try {
            const logger = new Logger(false, verbose)
            logger.info("Fetching subscribed Workshop items...")

            const items = steam.workshop.getSubscribedItems()

            if (items.length === 0) {
                console.log(chalk.yellow("You are not subscribed to any Workshop items."))
                process.exit(0)
            }

            const work = await Promise.all(items.map(id => steam.workshop.getItem(id)))
            const results = work
                .filter(item => item !== null)
                .map((item, idx) => ({ ...item, id: items[idx] }))

            if (details) {
                console.log(dump(results))
                process.exit(0)
            }

            // Group items by tags
            const taggedItems = new Map<string, Array<{ id: bigint, data: ReturnType<typeof flattenResult> }>>()

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

            // Check if any tag flags are selected
            const selectedTags = getSelectedTags(tags)
            const anyTagSelected = selectedTags.length > 0

            // Print items by tag groups
            for (const [tag, items] of taggedItems.entries()) {
                // Skip empty categories
                if (items.length === 0) {
                    continue
                }

                // Skip categories that aren't selected (if any are selected)
                if (anyTagSelected && !selectedTags.includes(tag)) {
                    continue
                }

                console.log(`\n${tag} (${items.length}):`)
                console.log("-".repeat(tag.length + items.length.toString().length + 4))

                for (const { data } of items) {
                    printItemLine(data)
                }
            }

            process.exit(0)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
