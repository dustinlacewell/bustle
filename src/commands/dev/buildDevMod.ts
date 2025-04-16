import path from "path"

import { rm } from "@/lib/fs-utils.js"
import { Logger } from "@/lib/logger.js"
import { checkDestSafety } from "@/lib/path-utils.js"
import { copyDevFiles } from "@/lib/staging.js"

import { createModZip } from "../zip/createModZip.js"

export async function buildDevMod(
    modName: string,
    modDir: string,
    buildDir: string,
    putDevIn: string,
    cleanup: boolean,
    logger: Logger
): Promise<void> {
    checkDestSafety(modDir, buildDir, ["modDir", "buildDir"])
    checkDestSafety(modDir, putDevIn, ["modDir", "putDevIn"])

    await copyDevFiles(modName, modDir, buildDir, logger)

    const zipPath = path.join(putDevIn, `${modName}.zip`)
    checkDestSafety(modDir, zipPath, ["modDir", "buildDir", "putDevIn"])
    await createModZip(
        buildDir,
        zipPath,
        logger
    )

    if (cleanup) {
        await rm(buildDir, true, logger)
    }
}
