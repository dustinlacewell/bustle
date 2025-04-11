import path from "path"
import { Logger } from "./logger.js"
import { ensureDir } from "./fs-utils.js"
import { createModZip } from "@/commands/zip/createModZip.js"
import { cleanupTempDir, copyMetadata, copyZipToDestination } from "./staging.js"

export interface BuildPackageOptions {
    from: string
    to: string
    name: string
    tempDir: string
    keep: boolean
    dryRun: boolean
}

export type BuildJob = (
    logger: Logger,
    tempDir: string
) => Promise<void>

export async function build(options: BuildPackageOptions, job: BuildJob): Promise<void> {
    const logger = new Logger(options.dryRun)
    const tempDir = path.join(options.tempDir, options.name)
    const zipName = `${options.name}.zip`
    const buildZipPath = path.join(options.tempDir, zipName)
    const finalZipPath = path.join(options.to, zipName)

    logger.info("Starting build...")

    try {
        await ensureDir(tempDir, logger)

        await job(logger, tempDir)

        await copyMetadata(options.from, tempDir, logger)

        await createModZip({
            from: tempDir,
            to: buildZipPath,
            dryRun: options.dryRun
        })

        await copyZipToDestination(buildZipPath, finalZipPath, logger)

        if (!options.keep) {
            await cleanupTempDir(options.tempDir, logger)
        }

        logger.info('Build complete!')
    } catch (error) {
        if (!options.keep) {
            await cleanupTempDir(tempDir, logger).catch(() => { })
        }
        throw error
    }
}