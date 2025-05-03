import { command } from "cmd-ts"

import { SteamModule } from "@/lib/steam/client"

export const wrap = <T extends ReturnType<typeof command>>(cmd: T) => {
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
