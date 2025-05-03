import { command, positional, string } from "cmd-ts"

import { fetchList } from "@/lib/steam/lists"
import { printUnsubscribeResults } from "@/lib/steam/print.js"
import { unsubFromAll } from "@/lib/steam/subs"

export const unsub = command({
    name: "unsub",
    description: "Unsubscribe from one or more mods",
    args: {
        name: positional({
            displayName: "name",
            type: string,
            description: "List name"
        })
    },
    handler: async ({ name }) => {
        const list = await fetchList(name)
        const results = await unsubFromAll(list.map(id => BigInt(id)))
        await printUnsubscribeResults(results)
    }
})
