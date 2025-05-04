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

        (_, v) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            typeof v === "bigint"
                ? Number(v).toString() === v.toString()
                    ? Number(v)
                    : v.toString()
                : v,
        2
    )
}

export const drain = async (callback: (page: number) => Promise<WorkshopPaginatedResult>, maxResults?: number, concurrency = 10) => {
    const limit = Math.min(20000, maxResults || 20000)
    const items: WorkshopItem[] = []

    try {
        // Fetch the first page to get total results
        const firstPageResult = await callback(1)

        // Process first page results
        const validFirstPageItems = firstPageResult.items.filter((item): item is WorkshopItem => item !== null)
        items.push(...validFirstPageItems)

        // If we have enough items or no more results, return early
        if (items.length >= limit || firstPageResult.returnedResults === 0) {
            return items
        }

        // Calculate total pages based on totalResults (50 items per page)
        const itemsPerPage = 50
        const totalPages = Math.ceil(firstPageResult.totalResults / itemsPerPage)
        const remainingPages = Math.min(
            Math.ceil((limit - items.length) / itemsPerPage),
            totalPages - 1 // Subtract 1 because we already fetched page 1
        )

        if (remainingPages <= 0) {
            return items
        }

        // Create an array of page numbers to fetch
        const pageNumbers = Array.from(
            { length: remainingPages },
            (_, i) => i + 2 // Start from page 2
        )

        // Process pages in batches based on concurrency
        for (let i = 0; i < pageNumbers.length; i += concurrency) {
            const batch = pageNumbers.slice(i, i + concurrency)
            const batchPromises = batch.map(page => callback(page))

            // Wait for all promises in the current batch to resolve
            const batchResults = await Promise.all(batchPromises)

            // Process results from each page in the batch
            for (let j = 0; j < batchResults.length; j++) {
                const result = batchResults[j]
                const page = batch[j]

                if (result.returnedResults > 0) {
                    const validItems = result.items.filter((item): item is WorkshopItem => item !== null)

                    // If we got no valid items but returnedResults > 0, we might be in a loop
                    if (validItems.length === 0) {
                        continue
                    }

                    items.push(...validItems)

                    // Check if we've reached the limit
                    if (items.length >= limit) {
                        break
                    }
                }
            }

            // Check if we've reached the limit after processing a batch
            if (items.length >= limit) {
                break
            }
        }

        return items
    }
    catch (error) {
        if (items.length > 0) {
            console.warn(`Encountered error after collecting ${items.length} items: ${error instanceof Error ? error.message : String(error)}`)
            return items
        }
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

export const getPersonaName = (steamId64: bigint): Promise<string> => {
    return new Promise((resolve) => {
        const name = steam.friends.getPersonaName(steamId64)
        if (name === "[unknown]") {
            personaStateChangeEvent.once(steamId64.toString(), () => {
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
