import * as fs from 'fs/promises'
import path from "path"
import { copyFile, getFilesRecursively } from "@/lib/fs-utils.js"
import { Logger } from "@/lib/logger.js"
import { makeDestPath } from "@/lib/path-utils.js"
import { StripProcessingOptions, MangledNames } from "./types.js"
import { buildClassMap, processFile } from "./file-processor.js"

// Main Process
export const stripMod = async (options: StripProcessingOptions): Promise<void> => {
    const logger = new Logger(options.dryRun ?? false)
    logger.info(`Starting ${options.dryRun ? 'dry run' : 'processing'}`)

    if (!options.dryRun) {
        logger.action(`Cleaning destination directory: ${options.to}`)
        await fs.rm(options.to, { recursive: true, force: true })
        await fs.mkdir(options.to, { recursive: true })
    }

    const { gdFiles, tscnFiles } = await getFilesRecursively(options.from)
    logger.info(`Found ${gdFiles.length} GDScript files and ${tscnFiles.length} scene files to process`)

    const classMap = await buildClassMap(gdFiles, options.from)
    logger.info(`Found ${Object.keys(classMap).length} named classes`)

    const modName = path.basename(options.to)
    const mangledNames: MangledNames = {}

    // Process GDScript files
    for (const sourcePath of gdFiles) {
        const destPath = makeDestPath(sourcePath, options.from, options.to)
        await processFile(sourcePath, destPath, classMap, logger, modName, mangledNames)
    }

    // Copy scene files
    for (const sourcePath of tscnFiles) {
        const destPath = makeDestPath(sourcePath, options.from, options.to)
        await copyFile(sourcePath, destPath, logger)
    }
    
    logger.info('Processing complete!')
}