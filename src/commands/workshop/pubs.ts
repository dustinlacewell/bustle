import chalk from "chalk"
import { command, flag } from "cmd-ts"

import appid from "@/appid.js"
import { Logger } from "@/lib/logger.js"
import { getSelectedTags, tagFlags } from "@/lib/steam/cli.js"
import steam from "@/lib/steam/client.js"
import { printTaggedItems } from "@/lib/steam/print.js"
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
                {
                    onlyIds: true
                }
            ))

            if (details) {
                console.log(dump(items))
                process.exit(0)
            }

            const taggedItems = await indexByTag(items.map(item => item.publishedFileId))
            printTaggedItems(taggedItems, getSelectedTags(tags))
            process.exit(0)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
