import { command, flag } from "cmd-ts"

import appid from "@/appid.js"
import { Logger } from "@/lib/logger.js"
import { steam } from "@/lib/steam/client.js"
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
        verbose
    },
    handler: async ({ details, verbose }) => {
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
                console.log("You are not subscribed to any Workshop items.")
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

            console.log(`Found ${items.length} published Workshop items:`)
            console.log("--------------------------------------")
            if (details) {
                console.log(dump(items))
            }
            else {
                items.forEach((item, index) => {
                    console.log(`${index + 1}. ${item.title} (ID: ${item.publishedFileId})`)
                })
            }
            process.exit(0)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
