import * as fs from 'fs/promises'


import { copyFile, ensureDir, getFilesRecursively } from "@/lib/fs-utils.js";
import { GatherOptions } from "./types.js";
import { Logger } from '@/lib/logger.js';
import path, { basename } from 'path';

export async function processImportFile(filePath: string) {
    const text = await fs.readFile(filePath, 'utf-8')
    const lines = text.split('\n')
    const pathLines = lines.filter(line => line.startsWith('path='))
    const resourcePaths = pathLines.map(line => line.match(/path="(.*?)"/)?.[1]).filter(Boolean) as string[]
    const relativePaths = resourcePaths.map((path: string) => path.replace('res://', ''))
    const basenames = relativePaths.map(path => basename(path))
    return basenames
}

export async function gather_imports(options: GatherOptions) {
    const logger = new Logger(options.dryRun ?? false)
    logger.info("Gathering import files...")
    const { importFiles } = await getFilesRecursively(options.from)
    const results = await Promise.all(importFiles.map(processImportFile))
    const resources = results.flat()
    ensureDir(options.to, logger)

    for (const resource of resources) {
        const sourcePath = path.join(options.project, '.import', resource)
        const destPath = path.join(options.to, resource)
        await copyFile(sourcePath, destPath, logger)
    }
}