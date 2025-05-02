import chalk from "chalk"
import { command, flag, positional, string } from "cmd-ts"
import { Table } from "console-table-printer"
import wrap from "word-wrap"

import steam, { WorkshopItem } from "@/lib/steam/client.js"
import { flattenResult } from "@/lib/steam/search"
import { getPersonaName } from "@/lib/steam/utils"

export const getItem = command({
    name: "get",
    description: "Get info on a mod",
    args: {
        id: positional({
            displayName: "id",
            type: string,
            description: "Mod ID"
        }),
        json: flag({
            long: "json",
            description: "Output results as JSON"
        })
    },
    handler: async (args) => {
        const { id, json } = args

        try {
            const data = await steam.workshop.getItem(BigInt(id))

            if (data === undefined) {
                console.error("Mod not found")
                process.exit(1)
            }

            if (data === null) {
                console.error("Mod is null")
                process.exit(1)
            }

            const name = await getPersonaName(data.owner.steamId64)

            if (json) {
                console.log(JSON.stringify(data, null, 2))
                process.exit(0)
            }

            const flatData = flattenResult(data as unknown as Required<WorkshopItem>, name)

            const table = new Table({
                columns: [
                    { name: "key", color: "yellow" },
                    { name: "value", color: "white" }
                ]
            })

            for (const [key, value] of Object.entries(data)) {
                table.addRow({ key, value: `${value}` })
            }

            console.log(`ID: ${chalk.gray(flatData.id)}`)
            console.log(`Title: ${chalk.bold(flatData.title)}`)
            console.log(`Author: ${chalk.white(name)}`)
            console.log(`Created: ${chalk.italic(flatData.created)}`)
            console.log(`Updated: ${chalk.italic(flatData.updated)}`)
            console.log(`Decay: ${chalk.magenta(`${flatData.decay} days`)}`)
            console.log(`Votes: ${chalk.green(flatData.upvotes)}/${chalk.red(flatData.downvotes)}`)
            console.log(`Score: ${chalk.yellow(flatData.score.toFixed(2))}`)
            console.log(`Favorites: ${chalk.cyan(flatData.favorites)}/${chalk.cyanBright(flatData.uniqueFavorites)}`)
            console.log(`Subscriptions: ${chalk.green(flatData.subscriptions)}/${chalk.greenBright(flatData.uniqueSubscriptions)}`)
            console.log(`Comments: ${chalk.blue(flatData.comments)}`)
            console.log(`Views: ${chalk.blueBright(flatData.uniqueViews)}`)
            console.log(`Banned: ${flatData.banned ? chalk.red("Yes") : chalk.italic("No")}`)
            console.log(`Report Score: ${chalk.bold(flatData.reportScore)}`)
            console.log(`Description:\n\n${wrap(flatData.description, { width: 45 })}`)
            console.log(`\n${chalk.gray(`https://steamcommunity.com/sharedfiles/filedetails/?id=${flatData.id}`)}`)
        }
        catch (error) {
            console.error(error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
