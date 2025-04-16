import * as fs from "fs/promises"
import * as path from "path"

import { Logger } from "@/lib/logger.js"

import { copyFilesRecursively, ensureDir, removeDir } from "./fs-utils.js"
import { extractImportSources, ImportMetadata, loadImports } from "./imports.js"
import { checkDestSafety } from "./path-utils.js"

export async function _stageRelease(
    modName: string,
    modDir: string,
    buildDir: string,
    optimized: boolean,
    include: string[],
    logger: Logger
): Promise<void> {
    checkDestSafety(modDir, buildDir, ["modDir", "buildDir"])
    await removeDir(buildDir, logger)

    const ignore: string[] = []
    let imports: ImportMetadata[] = []

    if (optimized) {
        imports = await loadImports(modDir, logger)
        const sourcePaths = extractImportSources(imports)
        sourcePaths.filter(p => !include.includes(p))
            .forEach(p => ignore.push(p))
    }

    for (const file of ignore) {
        logger.info(`Ignoring ${file}`)
    }

    const modBuildPath = path.join(buildDir, modName)
    await ensureDir(modBuildPath, logger)
    await copyFilesRecursively(modDir, modBuildPath, ignore, logger)
}

export async function cleanupTempDir(buildDir: string, logger: Logger): Promise<void> {
    logger.action(`Cleaning up staging directory: ${buildDir}`)
    if (!logger.dryRun) {
        await fs.rm(buildDir, { recursive: true, force: true })
    }
}

export async function copyZipToDestination(zipPath: string, destPath: string, logger: Logger): Promise<void> {
    logger.action(`Copying zip from ${zipPath} to ${destPath}`)
    if (!logger.dryRun) {
        await fs.mkdir(path.dirname(destPath), { recursive: true })
        await fs.copyFile(zipPath, destPath)
    }
}

export async function copyMetadata(modDir: string, buildDir: string, logger: Logger): Promise<void> {
    const metadataSource = path.join(modDir, "_metadata")
    const metadataDest = path.join(buildDir, "_metadata")

    logger.action(`Copying metadata from ${metadataSource} to ${metadataDest}`)
    if (!logger.dryRun) {
        await fs.cp(metadataSource, metadataDest, { recursive: true })
    }
}

export async function copyModMain(modDir: string, buildDir: string, logger: Logger): Promise<void> {
    const mainSource = path.join(modDir, "ModMain.gd")
    const mainDest = path.join(buildDir, "ModMain.gd")

    logger.action(`Copying ${mainSource} to ${mainDest}`)
    if (!logger.dryRun) {
        await fs.copyFile(mainSource, mainDest)
    }
}

export async function copyDevFiles(modName: string, modDir: string, buildDir: string, logger: Logger): Promise<void> {
    // Ensure the staging directory exists
    const destPath = path.join(buildDir, modName)
    await ensureDir(destPath, logger)

    // Copy ModMain.gd
    await copyModMain(modDir, destPath, logger)

    // Copy _metadata directory
    await copyMetadata(modDir, destPath, logger)
}
