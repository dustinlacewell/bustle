import { command, option, positional, string } from "cmd-ts"

import { Logger } from "@/lib/logger.js"
import { readWorkshopConfigFile } from "@/lib/steam/config.js"
import { uploadToWorkshop } from "@/lib/steam/workshop.js"

import { dryRun, verbose } from "../../args.js"

export const upload = command({
    name: "upload",
    description: "Upload your mod to the Steam Workshop",
    args: {
        zipFile: positional({
            type: string,
            description: "Path to the zip file to upload"
        }),
        releaseNotes: option({
            type: string,
            long: "release-notes",
            description: "Release notes for the mod",
            defaultValue: () => ""
        }),
        dryRun,
        verbose
    },
    handler: async ({ zipFile, releaseNotes, dryRun, verbose }) => {
        try {
            const config = await readWorkshopConfigFile()
            const logger = new Logger(dryRun, verbose)
            await uploadToWorkshop(zipFile, config, logger, releaseNotes)
            process.exit(0)
        }
        catch (error) {
            console.error(error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
