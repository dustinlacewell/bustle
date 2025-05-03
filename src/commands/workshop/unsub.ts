import { command, restPositionals, string } from "cmd-ts"

import { printUnsubscribeResults } from "@/lib/steam/print.js"
import { unsubFromAll } from "@/lib/steam/subs"

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
        const results = await unsubFromAll(ids.map(id => BigInt(id)))
        await printUnsubscribeResults(results)
    }
})
