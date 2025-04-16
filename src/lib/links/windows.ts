import { spawnSync, type SpawnSyncReturns } from "child_process"
import path from "path"

import { Logger } from "../logger.js"
import { checkDestSafety } from "../path-utils.js"
import { logSymlinkAction, type SymlinkCheckResult, type SymlinkCreateResult } from "./utils.js"

function runPowerShell(command: string): SpawnSyncReturns<Buffer> {
    return spawnSync("powershell.exe", ["-NoProfile", "-Command", command])
}

function getSymlinkAttributes(path: string): SpawnSyncReturns<Buffer> {
    return runPowerShell(`Get-Item -Path "${path}" | Select-Object -ExpandProperty Attributes`)
}

function checkSymlinkExists(path: string): SymlinkCheckResult {
    const result = getSymlinkAttributes(path)
    if (result.error) return { exists: false, error: result.error.message }
    if (result.status !== 0) return { exists: false, error: result.stderr?.toString() }
    const attributes = result.stdout?.toString().trim()
    if (!attributes) return { exists: false }
    const isSymlink = attributes.includes("ReparsePoint")
    return { exists: isSymlink }
}

function buildSymlinkCommand(linkPath: string, targetPath: string): string {
    return `New-Item -ItemType Junction -Path "${linkPath}" -Value "${targetPath}"`
}

function createSymlink(linkPath: string, targetPath: string, logger: Logger): SymlinkCreateResult {
    logSymlinkAction(linkPath, targetPath, logger)
    if (!logger.dryRun) {
        const command = buildSymlinkCommand(linkPath, targetPath)
        const result = runPowerShell(command)
        if (result.error) return { success: false, error: result.error.message }
        if (result.status !== 0) return { success: false, error: result.stderr?.toString() }
    }
    return { success: true }
}

function handleError(error: string, logger: Logger): void {
    logger.error(error)
}

function linkModInternal(modName: string, modDir: string, godotDir: string, logger: Logger): void {
    const linkPath = path.join(godotDir, modName)
    checkDestSafety(modDir, linkPath, ["modDir", "modName", "godotDir"])
    const { exists } = checkSymlinkExists(linkPath)
    if (exists) {
        logger.error(`Symlink already exists: ${linkPath}`)
        return
    }
    const targetPath = modDir
    const result = createSymlink(linkPath, targetPath, logger)
    if (!result.success && result.error) {
        handleError(result.error, logger)
    }
}

export const linkMod = (modName: string, modDir: string, godotDir: string, logger: Logger): void => {
    linkModInternal(modName, modDir, godotDir, logger)
}
