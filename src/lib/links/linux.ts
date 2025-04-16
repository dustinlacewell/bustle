import type { Stats } from "fs"
import fs from "fs"
import path from "path"

import type { Logger } from "../logger.js"
import { checkDestSafety } from "../path-utils.js"
import { logSymlinkAction, SymlinkCheckResult, SymlinkCreateResult } from "./utils.js"

function getStat(linkPath: string): Stats {
    return fs.lstatSync(linkPath)
}

function isSymbolicLink(stat: Stats): boolean {
    return stat.isSymbolicLink()
}

function checkSymlinkExists(linkPath: string): SymlinkCheckResult {
    try {
        const stat = getStat(linkPath)
        return { exists: isSymbolicLink(stat) }
    }
    catch (error) {
        if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "ENOENT") return { exists: false }
        return { exists: false, error: error instanceof Error ? error.message : String(error) }
    }
}

function createSymlink(linkPath: string, targetPath: string, logger: Logger): SymlinkCreateResult {
    logSymlinkAction(linkPath, targetPath, logger)
    try {
        fs.symlinkSync(targetPath, linkPath, "junction")
        return { success: true }
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
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
