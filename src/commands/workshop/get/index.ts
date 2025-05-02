import { command, flag, positional, string } from "cmd-ts"

import steam, { WorkshopItem } from "@/lib/steam/client.js"
import { printItem } from "@/lib/steam/print"
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
            printItem(flatData)
        }
        catch (error) {
            console.error(error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
