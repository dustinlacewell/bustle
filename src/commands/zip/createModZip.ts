import * as fs from 'fs/promises'
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
        
        // find all files and folders in options.from
        const entries = await fs.readdir(options.from, { withFileTypes: true })
        for (const entry of entries) {
            if (entry.isDirectory()) {
                logger.action(`Adding folder: ${entry.name}`)
                zip.addLocalFolder(path.join(options.from, entry.name), entry.name)
            }
            else {
                logger.action(`Adding file: ${entry.name}`)
                zip.addLocalFile(path.join(options.from, entry.name), entry.name)
            }
        }
        
        await new Promise<void>((resolve, reject) => {
            zip.writeZip(zipPath, (error) => {
                if (error) reject(error)
                else resolve()
            })
        })
    }
}