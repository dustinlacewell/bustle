import chalk from "chalk"
import { command, flag, positional, string } from "cmd-ts"

import steam from "@/lib/steam/client"
import { fetchIndex, fetchList, intersection } from "@/lib/steam/lists"
import { printTaggedItems } from "@/lib/steam/print"
import { indexByTag } from "@/lib/steam/tags"

export const get = command({
    name: "get",
    description: "Get info on a mod list",
    args: {
        name: positional({
            displayName: "name",
            type: string,
            description: "List name"
        }),
        mine: flag({
            long: "mine",
            description: "Only show mods you're subscribed to"
        })
    },
    handler: async ({ name, mine }) => {
        const index = await fetchIndex()
        const entry = index[name]
        const subs = steam.workshop.getSubscribedItems()
        const list = await fetchList(name)
        const filtered = mine ? await intersection(name, subs.map(sub => sub.toString())) : list
        const taggedItems = await indexByTag(filtered.map(id => BigInt(id)))
        console.log(`${chalk.bold(name)}: ${entry.description}`)
        console.log(chalk.gray(entry.url))
        printTaggedItems(taggedItems, [])
    }
})
