import { command } from "cmd-ts"

import {
    buildDir,
    cleanup,
    dryRun,
    gatherDir,
    godotDir,
    include,
    modDir,
    modName,
    optimized,
    putReleaseIn,
    strip,
    verbose
} from "@/commands/args.js"
import { BustleConfig } from "@/lib/config.js"
import { Logger } from "@/lib/logger.js"

import { buildMod } from "./buildMod.js"

export const build = command({
    name: "release",
    description: `Build a release zip`,
    args: {
        modName,
        modDir,
        godotDir,
        buildDir,
        putReleaseIn,
        gatherDir,
        optimized,
        strip,
        include,
        dryRun,
        cleanup,
        verbose
    },
    handler: async ({
        modName,
        modDir,
        godotDir,
        buildDir,
        putReleaseIn,
        gatherDir,
        optimized,
        strip,
        include,
        dryRun,
        cleanup,
        verbose
    }) => {
        try {
            const logger = new Logger(dryRun, verbose)
            await buildMod(
                modName,
                modDir,
                godotDir,
                buildDir,
                putReleaseIn,
                gatherDir,
                optimized,
                strip,
                include,
                cleanup,
                logger)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})

export const _build = async (config: BustleConfig, logger: Logger) => {
    await buildMod(
        config.modName,
        config.modDir,
        config.godotDir,
        config.buildDir,
        config.putReleaseIn,
        config.gather,
        config.optimized,
        config.strip,
        config.include,
        config.cleanup,
        logger
    )
}
