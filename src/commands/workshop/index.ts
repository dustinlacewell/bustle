import { command, subcommands } from "cmd-ts"

import type { SteamModule } from "@/lib/steam/client"

import { getItem } from "./get/index.js"
import { pubs } from "./pubs.js"
import { search } from "./search/index.js"
import { sub } from "./sub/index.js"
import { subs } from "./subs.js"
import { top } from "./top/index.js"
import { unsub } from "./unsub/index.js"
import { upload } from "./upload/index.js"
// import { upload } from "./upload/index.js"
import { user } from "./user/index.js"

const wrap = <T extends ReturnType<typeof command>>(cmd: T) => {
    const original = cmd.handler
    cmd.handler = (async (...args: Parameters<T["handler"]>) => {
        const clientMod = await import("@/lib/steam/client.js")
        const steam = clientMod.default as unknown as SteamModule
        await steam.init()
        // @ts-expect-error yup
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return original(...args)
    }) as unknown as T["handler"]
    return cmd
}

export const workshop = subcommands({
    name: "workshop",
    description: "Steam Workshop commands",
    cmds: {
        user: wrap(user),
        upload: wrap(upload),
        sub: wrap(sub),
        unsub: wrap(unsub),
        subs: wrap(subs),
        pubs: wrap(pubs),
        get: wrap(getItem),
        search: wrap(search),
        top: wrap(top)
    }
})
