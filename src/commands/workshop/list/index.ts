import { command, subcommands } from "cmd-ts"

import { wrap } from "@/commands/workshop/wrap"
import { fetchIndex } from "@/lib/steam/lists"
import { printListIndex } from "@/lib/steam/print"

import { get } from "./get"
import { sub } from "./sub"
import { unsub } from "./unsub"

const index = command({
    name: "index",
    description: "Get the index of community mod lists",
    args: {},
    handler: async () => {
        const index = await fetchIndex()
        printListIndex(index)
    }
})

export const list = subcommands({
    name: "list",
    description: "Community mod list commands",
    cmds: {
        index,
        get: wrap(get),
        sub: wrap(sub),
        unsub: wrap(unsub)
    }
})
