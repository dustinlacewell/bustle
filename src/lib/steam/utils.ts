import { execSync } from "child_process"

import { WorkshopItem, WorkshopPaginatedResult } from "@/lib/steam/client.js"
import steam from "@/lib/steam/client.js"

import { personaStateChangeEvent } from "./events.js"

/**
 * Open a directory in the system file explorer
 */
export function openDirectory(dirPath: string): void {
    try {
        if (process.platform === "win32") {
            // Handle Windows path in WSL
            if (dirPath.startsWith("/")) {
                // Attempt to convert WSL path to Windows path if needed
                dirPath = dirPath.replace(/^\/mnt\/([a-z])\//, "$1:/").replace(/\//g, "\\")
            }
            execSync(`explorer "${dirPath}"`, { stdio: "ignore" })
        }
        else if (process.platform === "darwin") {
            execSync(`open "${dirPath}"`, { stdio: "ignore" })
        }
        else {
            execSync(`xdg-open "${dirPath}"`, { stdio: "ignore" })
        }
        console.log(`Opened directory: ${dirPath}`)
    }
    catch (error) {
        // Suppress error since explorer might still open successfully
        console.log(`Attempted to open directory: ${dirPath}`)
    }
}

/**
 * Open a URL in the default browser
 */
export function openUrl(url: string): void {
    const command = process.platform === "win32"
        ? `start "" "${url}"`
        : process.platform === "darwin"
            ? `open "${url}"`
            : `xdg-open "${url}"`

    execSync(command)
}

/**
 * Checks if Steam is running
 */
export function isSteamRunning(): boolean {
    try {
        const cmd = process.platform === "win32"
            ? "tasklist /fi \"imagename eq steam.exe\" /fo csv /nh"
            : process.platform === "darwin"
                ? "ps -A | grep steam"
                : "ps -A | grep steam"

        const result = execSync(cmd, { encoding: "utf8" })
        return result.toLowerCase().includes("steam")
    }
    catch (error) {
        return false
    }
}

export const openWorkshopPage = (): void => {
    openUrl("steam://url/SteamWorkshopPage/2212330")
}

export const dump = (obj: unknown): string => {
    return JSON.stringify(
        obj,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (_, v) => typeof v === "bigint" ? v.toString() : v,
        2
    )
}

export const drain = async (callback: (page: number) => Promise<WorkshopPaginatedResult>, maxResults?: number) => {
    maxResults = Math.min(2000, maxResults || 2000)
    const items: WorkshopItem[] = []
    let page = 1
    let result = await callback(page)
    while (result.returnedResults > 0 && items.length <= maxResults) {
        items.push(
            ...result.items.filter(item => item !== null) as WorkshopItem[]
        )
        try {
            result = await callback(++page)
        }
        catch (error) {
            if (items.length > 0) {
                return items
            }
            console.error(error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
    return items
}

export const getPersonaName = (steamId64: bigint): Promise<string> => {
    return new Promise((resolve) => {
        const name = steam.friends.getPersonaName(steamId64)
        if (name === "[unknown]") {
            personaStateChangeEvent.on(steamId64.toString(), () => {
                const name = steam.friends.getPersonaName(steamId64)
                resolve(name)
            })
        }
        else {
            resolve(name)
        }
        steam.friends.requestUserInformation(steamId64)
    })
}
