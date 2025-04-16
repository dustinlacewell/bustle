import { command, option, string } from "cmd-ts"
import path from "path"

import { BustleConfig } from "@/lib/config.js"
import { Logger } from "@/lib/logger.js"
import { checkDestSafety } from "@/lib/path-utils.js"

import { dryRun } from "../args.js"
import { createModZip } from "./createModZip.js"

export const zip = command({
    name: "zip",
    description: "Zip a directory",
    args: {
        from: option({
            type: string,
            long: "from",
            description: "Source directory"
        }),
        to: option({
            type: string,
            long: "to",
            description: "Destination file"
        }),
        dryRun
    },
    handler: async ({ from, to, dryRun }) => {
        try {
            checkDestSafety(from, to, ["from", "to"])
            const logger = new Logger(dryRun)
            await createModZip(from, to, logger)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})

export const _zip = async (config: BustleConfig, logger: Logger) => {
    const destFile = path.join(config.putReleaseIn, `${config.modName}.zip`)
    checkDestSafety(config.modDir, destFile, ["modDir", "putReleaseIn"])
    await createModZip(
        config.buildDir,
        destFile,
        logger
    )
}
