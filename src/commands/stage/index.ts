import { command } from "cmd-ts"

import { BustleConfig } from "@/lib/config.js"
import { Logger } from "@/lib/logger.js"
import { _stageRelease } from "@/lib/staging.js"

import { buildDir, dryRun, include, modDir, modName, optimized, verbose } from "../args.js"

export const stage = command({
    name: "stage",
    description: `Prepare a build directory`,
    args: {
        modName,
        modDir,
        buildDir,
        optimized,
        include,
        dryRun,
        verbose
    },
    handler: async ({ modName, modDir, buildDir, optimized, include, dryRun, verbose }) => {
        try {
            const logger = new Logger(dryRun, verbose)
            return _stageRelease(
                modName,
                modDir,
                buildDir,
                optimized,
                include,
                logger
            )
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})

export const _stage = async (config: BustleConfig, logger: Logger) => {
    await _stageRelease(
        config.modName,
        config.modDir,
        config.buildDir,
        config.optimized,
        config.include,
        logger
    )
}
