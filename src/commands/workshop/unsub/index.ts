import chalk from "chalk"
import { command, restPositionals, string } from "cmd-ts"

import steam, { WorkshopItem } from "@/lib/steam/client.js"
import { printItemLine } from "@/lib/steam/print.js"
import { flattenResult } from "@/lib/steam/search.js"
import { getPersonaName } from "@/lib/steam/utils.js"

export const unsub = command({
    name: "unsub",
    description: "Unsubscribe from one or more mods",
    args: {
        ids: restPositionals({
            displayName: "ids",
            type: string,
            description: "Mod IDs"
        })
    },
    handler: async (args) => {
        const { ids } = args
        const notSubbedIds: bigint[] = []
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
                const id = BigInt(idString)

                if (!subs.includes(id)) {
                    notSubbedIds.push(id)
                    continue
                }

                await steam.workshop.unsubscribe(id)

                if (steam.workshop.getSubscribedItems().includes(id)) {
                    failureIds.push({ id, error: "Couldn't unsubscribe from mod!" })
                    continue
                }

                successIds.push(id)
            }
            catch (error) {
                failureIds.push({ id: BigInt(idString), error: error instanceof Error ? error.message : String(error) })
            }
        }

        if (notSubbedIds.length > 0) {
            console.log(chalk.yellow(`\nWasn't subscribed to ${notSubbedIds.length} mods:`))
            for (const id of notSubbedIds) {
                console.log(chalk.yellow(`  ${id}`))
            }
            console.log()
        }

        if (successIds.length > 0) {
            console.log(chalk.green(`\nSuccessfully unsubscribed from ${successIds.length} mods:`))
            for (const id of successIds) {
                const data = await steam.workshop.getItem(id)
                if (data) {
                    const name = await getPersonaName(data.owner.steamId64)
                    const flatData = flattenResult(data as unknown as Required<WorkshopItem>, name)
                    printItemLine(flatData)
                }
                else {
                    console.log(chalk.green(`  ${id}`))
                }
            }
            console.log()
        }

        if (failureIds.length > 0) {
            console.log(chalk.red("\nFailed to unsubscribe from the following mods:"))

            for (const failure of failureIds) {
                console.log(chalk.red(`  ${failure.id}:`))
                console.log(chalk.red(`    ${failure.error}`))
            }
        }
    }
})
