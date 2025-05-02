import chalk from "chalk"
import { command, flag } from "cmd-ts"

import appid from "@/appid.js"
import { Logger } from "@/lib/logger.js"
import { getSelectedTags, tagFlags } from "@/lib/steam/cli.js"
import steam from "@/lib/steam/client.js"
import { printItemLine } from "@/lib/steam/print.js"
import { indexByTag } from "@/lib/steam/tags.js"
import { drain, dump } from "@/lib/steam/utils.js"

import { verbose } from "../args.js"

export const pubs = command({
    name: "pubs",
    description: "List published Steam Workshop items",
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
            logger.info("Fetching published Workshop items...")
            const me = steam.localplayer.getSteamId()
            const result = await steam.workshop.getUserItems(
                1, me.accountId,
                steam.workshop.UserListType.Published,
                steam.workshop.UGCType.Items,
                steam.workshop.UserListOrder.TitleAsc,
                {
                    creator: appid,
                    consumer: appid
                },
                null
            )

            if (result.totalResults === 0) {
                console.log(chalk.yellow("You have not published any Workshop items."))
                process.exit(0)
            }

            const items = await drain(page => steam.workshop.getUserItems(
                page, me.accountId,
                steam.workshop.UserListType.Published,
                steam.workshop.UGCType.Items,
                steam.workshop.UserListOrder.TitleAsc,
                {
                    creator: appid,
                    consumer: appid
                },
                null
            ))

            if (details) {
                console.log(dump(items))
                process.exit(0)
            }

            // Group items by tags
            const taggedItems = await indexByTag(items)

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
