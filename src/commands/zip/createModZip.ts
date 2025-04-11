import path from 'path'

import AdmZip from 'adm-zip'

import { Logger } from "@/lib/logger.js"
import { ZipOptions } from "./types.js"

export async function createModZip(options: ZipOptions): Promise<void> {
    const logger = new Logger(options.dryRun ?? false)
    const zipPath = options.to
    const withoutExt = path.basename(zipPath, path.extname(zipPath))

    logger.action(`Creating zip archive: ${zipPath} from ${options.from}`)

    if (!logger.dryRun) {
        const zip = new AdmZip()
        
        zip.addLocalFolder(options.from, withoutExt)
        
        await new Promise<void>((resolve, reject) => {
            zip.writeZip(zipPath, (error) => {
                if (error) reject(error)
                else resolve()
            })
        })
    }
}