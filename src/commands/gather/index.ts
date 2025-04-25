import { command, option, string } from "cmd-ts"

import { gatherImports } from "@/lib/imports.js"
import { Logger } from "@/lib/logger.js"

import { dryRun, godotDir, verbose } from "../args.js"

export const gather = command({
    name: "gather",
    description: "Gather resource imports",
    args: {
        zipRoot: option({
            type: string,
            long: "zip-root",
            description: "Parent directory of your zip content"
        }),
        gatherDir: option({
            type: string,
            long: "gather-dir",
            description: "Directory relative to zip-root to put imports in"
        }),
        godotDir,
        dryRun,
        verbose
    },
    handler: async ({ zipRoot, gatherDir, godotDir, dryRun, verbose }) => {
        try {
            const logger = new Logger(dryRun, verbose)
            await gatherImports(
                zipRoot,
                gatherDir,
                godotDir,
                logger
            )
        }
        catch (error) {
            console.error("Error:", error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
