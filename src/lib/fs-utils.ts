import * as fs from 'fs/promises'
import * as path from 'path'
import { Logger } from './logger.js'


export const isGodotScript = (file: string): boolean => 
    file.endsWith('.gd')

export const isGodotScene = (file: string): boolean =>
    file.endsWith('.tscn')

export const getFilesRecursively = async (dir: string): Promise<{gdFiles: string[], tscnFiles: string[]}> => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    const files = await Promise.all(entries.map(async entry => {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            return getFilesRecursively(fullPath)
        } else {
            return {
                gdFiles: isGodotScript(fullPath) ? [fullPath] : [],
                tscnFiles: isGodotScene(fullPath) ? [fullPath] : []
            }
        }
    }))

    return files.reduce((acc, curr) => ({
        gdFiles: [...acc.gdFiles, ...curr.gdFiles],
        tscnFiles: [...acc.tscnFiles, ...curr.tscnFiles]
    }), { gdFiles: [], tscnFiles: [] })
}

export const writeFileLines = async (filePath: string, lines: string[], logger: Logger): Promise<void> => {
    logger.action(`Writing ${lines.length} lines to: ${filePath}`)
    if (!logger.dryRun) {
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, lines.join('\n'))
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