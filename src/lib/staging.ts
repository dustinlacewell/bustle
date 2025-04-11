import * as fs from 'fs/promises'
import * as path from 'path'
import { Logger } from '@/lib/logger.js'
import { ensureDir } from './fs-utils.js'

export async function cleanupTempDir(buildDir: string, logger: Logger): Promise<void> {
    logger.action(`Cleaning up staging directory: ${buildDir}`)
    if (!logger.dryRun) {
        await fs.rm(buildDir, { recursive: true, force: true })
    }
}

export async function moveZipToDestination(from: string, to: string, logger: Logger): Promise<void> {
    const originalZipName = path.basename(from)
    const finalDestPath = (await fs.stat(to).catch(() => null))?.isDirectory() 
        ? path.join(to, originalZipName)
        : to

    logger.action(`Moving zip from ${from} to ${finalDestPath}`)

    if (!logger.dryRun) {
        // Ensure the destination directory exists
        await fs.mkdir(path.dirname(finalDestPath), { recursive: true })
        await fs.copyFile(from, finalDestPath)
    }
}

export async function copyZipToDestination(zipPath: string, destPath: string, logger: Logger): Promise<void> {
    logger.action(`Copying zip from ${zipPath} to ${destPath}`)
    if (!logger.dryRun) {
        await fs.mkdir(path.dirname(destPath), { recursive: true })
        await fs.copyFile(zipPath, destPath)
    }
}

export async function copyMetadata(sourceDir: string, buildDir: string, logger: Logger): Promise<void> {
    const metadataSource = path.join(sourceDir, '_metadata')
    const metadataDest = path.join(buildDir, '_metadata')
    
    logger.action(`Copying metadata from ${metadataSource} to ${metadataDest}`)
    if (!logger.dryRun) {
        await fs.cp(metadataSource, metadataDest, { recursive: true })
    }
}

export async function copyModMain(from: string, buildDir: string, logger: Logger): Promise<void> {
    const mainSource = path.join(from, 'ModMain.gd')
    const mainDest = path.join(buildDir, 'ModMain.gd')

    logger.action(`Copying ${mainSource} to ${mainDest}`)
    if (!logger.dryRun) {
        await fs.copyFile(mainSource, mainDest)
    }
}

export async function copyDevFiles(from: string, buildDir: string, logger: Logger): Promise<void> {
    // Ensure the staging directory exists
    await fs.mkdir(buildDir, { recursive: true })

    // Copy ModMain.gd
    await copyModMain(from, buildDir, logger)

    // Copy _metadata directory
    await copyMetadata(from, buildDir, logger)
}