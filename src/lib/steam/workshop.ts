import { existsSync, promises as fs } from "fs"
import { constants, readFile } from "fs/promises"

// import sharp from "sharp"
import appid from "@/appid.js"
import steam from "@/lib/steam/client.js"

import { Logger } from "../logger.js"
import { WorkshopConfig, writeWorkshopConfigFile } from "./config.js"

const validateImage = async (imagePath: string): Promise<boolean> => {
    try {
        await fs.access(imagePath)
        // const metadata = await sharp(imagePath).metadata()
        return true
    }
    catch (_e) {
        return false
    }
}

export const uploadToWorkshop = async (
    zipPath: string,
    config: WorkshopConfig,
    logger: Logger,
    updateNotes?: string
): Promise<string> => {
    try {
        await fs.access(zipPath, constants.R_OK)
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Couldn't open zip file: ${zipPath}`)
        }
    }

    try {
        await validateImage(config.preview)
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Couldn't open preview image: ${config.preview}`)
        }
    }

    const id = config.id ? parseInt(config.id, 10) : 0

    // Convert visibility from string to enum value
    let visibility: number
    switch (config.visibility) {
        case "private":
            visibility = steam.workshop.UgcItemVisibility.Private
            break
        case "friends":
            visibility = steam.workshop.UgcItemVisibility.FriendsOnly
            break
        case "unlisted":
            visibility = steam.workshop.UgcItemVisibility.Unlisted
            break
        case "public":
        default:
            visibility = steam.workshop.UgcItemVisibility.Public
            break
    }

    if (id === 0) {
        logger.action("Creating new workshop item...")
        let newId: bigint = BigInt("696969420") // Placeholder ID for dry runs
        let newData: Required<WorkshopConfig> = config as Required<WorkshopConfig>

        if (!logger.dryRun) {
            try {
                const ugc = await steam.workshop.createItem(appid)
                newId = ugc.itemId

                newData = {
                    ...config,
                    id: newId.toString()
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to create workshop item: ${error.message}`)
                }
            }
        }

        logger.action(`Writing new workshop ID to workshop.json: ${newId}`)
        if (!logger.dryRun) {
            await writeWorkshopConfigFile(newData)
        }

        config.id = newId.toString()

        return await uploadToWorkshop(zipPath, config, logger)
    }
    else {
        logger.action(`Updating workshop item ${id}...`)
        if (!logger.dryRun) {
            if (updateNotes && existsSync(updateNotes)) {
                updateNotes = await readFile(updateNotes, "utf-8")
            }
            else {
                updateNotes = ""
            }

            await steam.workshop.updateItem(BigInt(config.id!), {
                title: config.title,
                description: config.description,
                tags: config.tags,
                contentPath: zipPath,
                previewPath: config.preview,
                visibility,
                changeNote: updateNotes
            })
        }

        return `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`
    }
}
