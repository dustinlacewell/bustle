import * as fs from 'fs/promises'


import { copyFile, ensureDir, getFilesRecursively } from "@/lib/fs-utils.js";
import { GatherOptions } from "./types.js";
import { Logger } from '@/lib/logger.js';
import path, { basename } from 'path';

export async function processImportFile(options: GatherOptions, filePath: string, logger: Logger) {
    let text = await fs.readFile(filePath, 'utf-8')
    logger.info(`Processing import file: ${filePath}`)
    
    
    const pathMatch = text.match(/path="(.*?)"/)
    if (pathMatch) {
        const resourcePath = pathMatch[1]
        const relativePath = resourcePath.replace('res://', '')
        const dirPath = path.dirname(relativePath)
        const baseName = basename(relativePath)
        const projectPath = path.join(options.project, '.import', baseName)
        const destDir = path.join(options.to, options.in)
        const destFile = path.join(destDir, baseName)

        const newPath = `res://${options.in}/${baseName}`
        logger.action(`Replacing path in file: ${filePath}`)
        text = text.replaceAll(resourcePath, newPath)

        if (!options.dryRun) {
            await fs.writeFile(filePath, text, 'utf-8')
        }
                 
        await ensureDir(destDir, logger)
        await copyFile(projectPath, destFile, logger)
    }
}

export async function gather_imports(options: GatherOptions) {
    const logger = new Logger(options.dryRun ?? false)
    logger.info("Gathering import files...")
    const { importFiles } = await getFilesRecursively(options.from)
    await Promise.all(importFiles.map(f => processImportFile(options, f, logger)))
}