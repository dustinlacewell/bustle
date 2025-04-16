import { command } from "cmd-ts"

import { BustleConfig } from "@/lib/config.js"
import { Logger } from "@/lib/logger.js"

import { buildDir, cleanup, dryRun, modDir, modName, putDevIn, verbose } from "../args.js"
import { buildDevMod } from "./buildDevMod.js"

export const dev = command({
    name: "dev",
    description: `Build a development zip`,
    args: {
        modName,
        modDir,
        buildDir,
        putDevIn,
        dryRun,
        cleanup,
        verbose
    },
    handler: async ({
        modName,
        modDir,
        buildDir,
        putDevIn,
        dryRun,
        cleanup,
        verbose
    }) => {
        try {
            const logger = new Logger(dryRun, verbose)
            await buildDevMod(modName, modDir, buildDir, putDevIn, cleanup, logger)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})

export const _dev = async (config: BustleConfig, logger: Logger) => {
    const { modName, modDir, buildDir, putDevIn, cleanup } = config
    await buildDevMod(modName, modDir, buildDir, putDevIn, cleanup, logger)
}
