import type { Logger } from "../logger.js"

export type SymlinkCheckResult = {
    exists: boolean
    error?: string
}

export type SymlinkTargetResult = {
    target: string | null
    error?: string
}

export type SymlinkCreateResult = {
    success: boolean
    error?: string
}

export function logSymlinkAction(linkPath: string, targetPath: string, logger: Logger): void {
    logger.action(`Creating symlink: ${linkPath} -> ${targetPath}`)
}

export function logSymlinkExists(linkPath: string, logger: Logger): void {
    logger.error(`Symlink already exists: ${linkPath}`)
}
