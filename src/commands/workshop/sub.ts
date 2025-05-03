import { command, restPositionals, string } from "cmd-ts"

import { printSubscribeResults } from "@/lib/steam/print"
import { subToAll } from "@/lib/steam/subs"

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
        const { alreadyIds, successIds, failureIds } = await subToAll(ids.map(id => BigInt(id)))
        await printSubscribeResults({ alreadyIds, successIds, failureIds })
    }
})
