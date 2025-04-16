import { command } from "cmd-ts"

import { BustleConfig } from "@/lib/config.js"
import { linkMod } from "@/lib/links/index.js"
import { Logger } from "@/lib/logger.js"

import { dryRun, godotDir, modDir, modName, verbose } from "../args.js"

export const link = command({
    name: "link",
    description: "Link your mod to your Godot project",
    args: {
        modName,
        modDir,
        godotDir,
        dryRun,
        verbose
    },
    handler: ({ modName, modDir, godotDir, dryRun, verbose }) => {
        try {
            const logger = new Logger(dryRun, verbose)
            linkMod(modName, modDir, godotDir, logger)
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})

export const _link = (config: BustleConfig, logger: Logger) => {
    linkMod(config.modName, config.modDir, config.godotDir, logger)
}
