import { command, option, string } from "cmd-ts"
import path from "path"

import { BustleConfig } from "@/lib/config.js"
import { Logger } from "@/lib/logger.js"
import { checkDestSafety } from "@/lib/path-utils.js"
import { stripScripts } from "@/lib/transforms/index.js"

import { dryRun, modName, verbose } from "../args.js"

export const strip = command({
    name: "strip",
    description: "Strip your class names from GDScript files",
    args: {
        modName,
        from: option({
            type: string,
            long: "from",
            description: "Directory containing GDScript files"
        }),
        to: option({
            type: string,
            long: "to",
            description: "Where to put the stripped files"
        }),
        dryRun,
        verbose
    },
    handler: async ({ modName, from, to, dryRun, verbose }) => {
        try {
            checkDestSafety(from, to, ["from", "to"])
            const logger = new Logger(dryRun, verbose)
            await stripScripts(modName, from, to, logger)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})

export const _strip = async (config: BustleConfig, logger: Logger) => {
    const to = path.join(config.buildDir, config.modName)
    checkDestSafety(config.modDir, to, ["modDir", "buildDir"])
    await stripScripts(config.modName, config.modDir, to, logger)
}
