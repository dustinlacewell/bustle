import { command } from "cmd-ts"

import { Logger } from "@/lib/logger.js"
import steam from "@/lib/steam/client.js"

export const user = command({
    name: "user",
    description: "Get your Steam user details",
    args: {},
    // eslint-disable-next-line @typescript-eslint/require-await
    handler: async () => {
        try {
            const logger = new Logger(false, false)
            const steamId = steam.localplayer.getSteamId()
            const name = steam.localplayer.getName()
            logger.info(`Steam ID: ${steamId.accountId}`)
            logger.info(`Name: ${name}`)
            logger.info(`Level: ${steam.localplayer.getLevel()}`)
        }
        catch (error) {
            console.error(error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
