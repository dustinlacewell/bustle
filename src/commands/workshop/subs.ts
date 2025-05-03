import chalk from "chalk"
import { command, flag } from "cmd-ts"

import { Logger } from "@/lib/logger.js"
import { getSelectedTags, tagFlags } from "@/lib/steam/cli.js"
import steam from "@/lib/steam/client.js"
import { printTaggedItems } from "@/lib/steam/print.js"
import { indexByTag } from "@/lib/steam/tags.js"

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

            const taggedItems = await indexByTag(items)
            const selectedTags = getSelectedTags(tags)
            printTaggedItems(taggedItems, selectedTags)
            process.exit(0)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
