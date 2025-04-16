import * as fs from 'fs/promises'
import path from 'path'

import AdmZip from 'adm-zip'

import { Logger } from "@/lib/logger.js"
import { checkDestSafety } from '@/lib/path-utils.js'

export async function createModZip(from: string, to: string, logger: Logger): Promise<void> {
    checkDestSafety(from, to, ['from', 'to'])

    logger.action(`Creating zip archive: ${to} from ${from}`)

    if (!logger.dryRun) {
        const zip = new AdmZip()
        
        // find all files and folders in from
        const entries = await fs.readdir(from, { withFileTypes: true })
        for (const entry of entries) {
            if (entry.isDirectory()) {
                logger.action(`Adding folder: ${entry.name}`)
                zip.addLocalFolder(path.join(from, entry.name), entry.name)
            }
            else {
                logger.action(`Adding file: ${entry.name}`)
                zip.addLocalFile(path.join(from, entry.name), entry.name)
            }
        }
        
        await new Promise<void>((resolve, reject) => {
            logger.action(`Writing zip file: ${to}`)
            zip.writeZip(to, (error) => {
                if (error) reject(error)
                else resolve()
            })
        })
    }
}