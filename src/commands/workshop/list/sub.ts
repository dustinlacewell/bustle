import { command, positional, string } from "cmd-ts"

import { fetchList } from "@/lib/steam/lists"
import { printSubscribeResults } from "@/lib/steam/print"
import { subToAll } from "@/lib/steam/subs"

export const sub = command({
    name: "sub",
    description: "Subscribe to the mods in a community list",
    args: {
        name: positional({
            displayName: "name",
            type: string,
            description: "List name"
        })
    },
    handler: async ({ name }) => {
        const list = await fetchList(name)
        const { alreadyIds, successIds, failureIds } = await subToAll(list.map(id => BigInt(id)))
        await printSubscribeResults({ alreadyIds, successIds, failureIds })
    }
})
