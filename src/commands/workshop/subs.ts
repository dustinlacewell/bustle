import { command, flag } from "cmd-ts"

import { Logger } from "@/lib/logger.js"
import steam from "@/lib/steam/client.js"
import { dump } from "@/lib/steam/utils.js"

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
        verbose
    },
    handler: async ({ details, verbose }) => {
        try {
            const logger = new Logger(false, verbose)
            logger.info("Fetching subscribed Workshop items...")

            const items = steam.workshop.getSubscribedItems()

            if (items.length === 0) {
                console.log("You are not subscribed to any Workshop items.")
                process.exit(0)
            }

            const work = await Promise.all(items.map(id => steam.workshop.getItem(id)))
            const results = work
                .filter(item => item !== null)
                .map((item, idx) => ({ ...item, id: items[idx] }))

            console.log(`Found ${results.length} subscribed Workshop items:`)
            console.log("--------------------------------------")

            if (details) {
                console.log(dump(results))
                process.exit(0)
            }

            results.forEach((item, index) => {
                console.log(`${index + 1}. ${item.title} (ID: ${item.publishedFileId})`)
            })

            process.exit(0)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
