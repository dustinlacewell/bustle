import * as fs from "fs/promises"
import * as path from "path"

import { Logger } from "./logger.js"

export const writeFile = async (filePath: string, content: string, logger: Logger): Promise<void> => {
    logger.action(`Writing file: ${filePath}`)
    if (!logger.dryRun) {
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, content, "utf-8")
    }
}

export const writeBinaryFile = async (filePath: string, content: Buffer, logger: Logger): Promise<void> => {
    logger.action(`Writing binary file: ${filePath}`)
    if (!logger.dryRun) {
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, content)
    }
}

export const rm = async (filePath: string, recursive: boolean, logger: Logger): Promise<void> => {
    logger.action(`Removing file: ${filePath}`)
    if (!logger.dryRun) {
        if (recursive) {
            await fs.rm(filePath, { recursive: true, force: true })
        }
        else {
            await fs.rm(filePath)
        }
    }
}

export const isGodotScript = (file: string): boolean =>
    file.endsWith(".gd")

export const isGodotScene = (file: string): boolean =>
    file.endsWith(".tscn")

export const isImportFile = (file: string): boolean =>
    file.endsWith(".import")

export const getStripFilesRecursively = async (dir: string): Promise<{ gdFiles: string[], tscnFiles: string[], importFiles: string[] }> => {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            return getStripFilesRecursively(fullPath)
        }
        else {
            return {
                gdFiles: isGodotScript(fullPath) ? [fullPath] : [],
                tscnFiles: isGodotScene(fullPath) ? [fullPath] : [],
                importFiles: isImportFile(fullPath) ? [fullPath] : []
            }
        }
    }))

    return files.reduce((acc, curr) => ({
        gdFiles: [...acc.gdFiles, ...curr.gdFiles],
        tscnFiles: [...acc.tscnFiles, ...curr.tscnFiles],
        importFiles: [...acc.importFiles, ...curr.importFiles]
    }), { gdFiles: [], tscnFiles: [], importFiles: [] })
}

export const getFilesRecursively = async (dir: string, extension: string): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            return getFilesRecursively(fullPath, extension)
        }
        else {
            return fullPath.endsWith(extension) ? [fullPath] : []
        }
    }))
    return files.reduce((acc, curr) => [...acc, ...curr], [])
}

export const copyFilesRecursively = async (source: string, dest: string, ignore: string[], logger: Logger): Promise<void> => {
    logger.action(`Copying files from ${source} to ${dest}`)
    if (!logger.dryRun) {
        await fs.mkdir(dest, { recursive: true })

        const entries = await fs.readdir(source, { withFileTypes: true })

        for (const entry of entries) {
            const sourcePath = path.join(source, entry.name)
            const destPath = path.join(dest, entry.name)

            // Calculate the relative path from the source root for ignore checking
            const relativePath = path.relative(source, sourcePath)

            // Skip if the path matches any ignore pattern
            if (ignore.some(pattern => relativePath === pattern || relativePath.startsWith(pattern + path.sep))) {
                logger.info(`Skipping ignored path: ${relativePath}`)
                continue
            }

            if (entry.isDirectory()) {
                await copyFilesRecursively(sourcePath, destPath, ignore, logger)
            }
            else {
                await copyFile(sourcePath, destPath, logger)
            }
        }
    }
}

export const writeFileLines = async (filePath: string, lines: string[], logger: Logger): Promise<void> => {
    logger.action(`Writing ${lines.length} lines to: ${filePath}`)
    if (!logger.dryRun) {
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, lines.join("\n"))
    }
}

export const copyFile = async (sourcePath: string, destPath: string, logger: Logger): Promise<void> => {
    logger.action(`Copying file from ${sourcePath} to ${destPath}`)
    if (!logger.dryRun) {
        await fs.mkdir(path.dirname(destPath), { recursive: true })
        await fs.copyFile(sourcePath, destPath)
    }
}

export async function ensureDir(dir: string, logger: Logger): Promise<void> {
    logger.action(`Ensuring directory exists: ${dir}`)
    if (!logger.dryRun) {
        await fs.mkdir(dir, { recursive: true })
    }
}

export async function removeDir(dir: string, logger: Logger): Promise<void> {
    logger.action(`Removing directory: ${dir}`)
    if (!logger.dryRun) {
        await fs.rm(dir, { recursive: true, force: true })
    }
}
