import path from "path"

import { rm } from "@/lib/fs-utils.js"
import { gatherImports } from "@/lib/imports.js"
import { Logger } from "@/lib/logger.js"
import { checkDestSafety } from "@/lib/path-utils.js"
import { _stageRelease } from "@/lib/staging.js"
import { stripScripts } from "@/lib/transforms/index.js"

import { createModZip } from "../zip/createModZip.js"

export async function buildMod(
    modName: string,
    modDir: string,
    godotDir: string,
    buildDir: string,
    putReleaseIn: string,
    gatherDir: string | null,
    optimized: boolean,
    strip: boolean,
    include: string[],
    cleanup: boolean,
    logger: Logger
) {
    checkDestSafety(modDir, buildDir, ["modDir", "buildDir"])
    checkDestSafety(modDir, putReleaseIn, ["modDir", "putReleaseIn"])
    if (gatherDir !== null)
        checkDestSafety(modDir, path.join(buildDir, gatherDir), ["modDir", "buildDir", "gatherDir"])

    await _stageRelease(
        modName,
        modDir,
        buildDir,
        optimized,
        include,
        logger
    )

    if (gatherDir !== null) {
        await gatherImports(
            modName,
            modDir,
            buildDir,
            gatherDir,
            godotDir,
            logger
        )
    }

    const sourceDir = path.join(buildDir, modName)
    checkDestSafety(modDir, sourceDir, ["modDir", "buildDir"])
    if (strip) {
        await stripScripts(
            modName,
            sourceDir,
            buildDir,
            logger
        )
    }

    const zipPath = path.join(putReleaseIn, `${modName}.zip`)
    checkDestSafety(modDir, zipPath, ["modDir", "putReleaseIn"])
    await createModZip(
        buildDir,
        zipPath,
        logger
    )

    if (cleanup) {
        await rm(buildDir, true, logger)
    }
}
