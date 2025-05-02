import chalk from "chalk"
import { command, restPositionals, string } from "cmd-ts"

import steam, { WorkshopItem } from "@/lib/steam/client.js"
import { printItemLine } from "@/lib/steam/print"
import { flattenResult } from "@/lib/steam/search"
import { getPersonaName } from "@/lib/steam/utils"

export const sub = command({
    name: "sub",
    description: "Subscribe to one or more mods",
    args: {
        ids: restPositionals({
            displayName: "ids",
            type: string,
            description: "Mod IDs"
        })
    },
    handler: async (args) => {
        const { ids } = args
        const alreadyIds: bigint[] = []
        const successIds: bigint[] = []
        const failureIds: { id: bigint, error: string }[] = []
        const idSet = new Set(ids)
        for (const idString of idSet) {
            try {
                if (String(idString).length !== 10) {
                    failureIds.push({ id: BigInt(idString), error: "Mod ID must be 10 digits long." })
                    continue
                }

                const subs = steam.workshop.getSubscribedItems()

                if (subs.includes(BigInt(idString))) {
                    alreadyIds.push(BigInt(idString))
                    continue
                }

                const data = await steam.workshop.getItem(BigInt(idString))

                if (data === undefined) {
                    failureIds.push({ id: BigInt(idString), error: "Couldn't find mod. Check the ID." })
                    continue
                }

                if (data === null) {
                    failureIds.push({ id: BigInt(idString), error: "Mod is null." })
                    continue
                }

                await steam.workshop.subscribe(BigInt(idString))

                if (!steam.workshop.getSubscribedItems().includes(BigInt(idString))) {
                    failureIds.push({ id: BigInt(idString), error: "Couldn't subscribe to mod!" })
                    continue
                }

                successIds.push(BigInt(idString))
            }
            catch (error) {
                failureIds.push({ id: BigInt(idString), error: error instanceof Error ? error.message : String(error) })
            }
        }

        if (alreadyIds.length > 0) {
            console.log(chalk.yellow(`\nWas already subscribed to ${alreadyIds.length} mods:`))
            for (const id of alreadyIds) {
                const data = await steam.workshop.getItem(id)
                const name = await getPersonaName(data!.owner.steamId64)
                const flatData = flattenResult(data as unknown as Required<WorkshopItem>, name)
                printItemLine(flatData)
            }
            console.log()
        }

        if (successIds.length > 0) {
            console.log(chalk.green(`\nSuccessfully subscribed to ${successIds.length} mods.`))
            for (const id of successIds) {
                const data = await steam.workshop.getItem(id)
                const name = await getPersonaName(data!.owner.steamId64)
                const flatData = flattenResult(data as unknown as Required<WorkshopItem>, name)
                printItemLine(flatData)
            }
            console.log()
        }

        if (failureIds.length > 0) {
            console.log(chalk.red("\nFailed to subscribe to the following mods:"))

            for (const failure of failureIds) {
                console.log(chalk.red(`  ${failure.id}:`))
                console.log(chalk.red(`    ${failure.error}`))
            }
        }
    }
})
