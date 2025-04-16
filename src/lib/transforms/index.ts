import * as fs from "fs/promises"
import path from "path"

import { BustleConfig } from "../config.js"
import { ensureDir, writeFile } from "../fs-utils.js"
import { Logger } from "../logger.js"
import { makeDestPath } from "../path-utils.js"
import { stripTypes } from "./annotations.js"
import { moveExtendsToTop, replaceExtends } from "./extends.js"
import { generateLoadStatements, generateMangledNames } from "./mangling.js"
import { buildClassMap, locateGDFiles } from "./mapping.js"
import { detectTokens, replaceTokens } from "./replaceTokens.js"
import { MangledNames } from "./types.js"

/**
 * Strips scripts from a given directory and writes them to a build directory.
 * Stripping consists of replacing extends statements with load statements and
 * stripping type annotations.
 * @param modName The name of the mod.
 * @param from The directory to strip scripts from.
 * @param to The directory to write stripped scripts to.
 * @param logger A logger to log messages to.
 */
export const stripScripts = async (modName: string, from: string, to: string, logger: Logger): Promise<void> => {
    const stepwise = false
    logger.info(`Stripping scripts from ${from} to ${to}`)
    const buildDir = path.join(to, modName)
    await ensureDir(buildDir, logger)
    const gdFiles = await locateGDFiles(from)
    const classMap = await buildClassMap(from)
    const classNames = new Set(Object.keys(classMap))
    const mangledNames: MangledNames = {}

    const removeClassName = async (destPath: string, text: string, className?: string) => {
        logger.extra(`Stripping className ${className}`)
        text = className ? text.replace(`class_name ${className}`, "") : text
        if (stepwise) await writeFile(destPath + ".className", text, logger)
        return text
    }
    const findMyClassName = (sourcePath: string) => {
        return Object.entries(classMap).find(([_, value]) => path.join(from, value) === sourcePath)?.[0]
    }

    const replaceAllExtends = async (destPath: string, text: string) => {
        for (const className of classNames) {
            text = replaceExtends(text, className, `res://${modName}/${classMap[className]}`, logger)
        }
        if (stepwise) await writeFile(destPath + ".extends", text, logger)
        return text
    }

    const stripAllTypes = async (destPath: string, text: string) => {
        logger.extra(`Stripping types...`)
        text = stripTypes(text, [...classNames])
        if (stepwise) await writeFile(destPath + ".types", text, logger)
        return text
    }

    const mangleNames = async (destPath: string, text: string, mangledMap: Record<string, string>) => {
        logger.extra(`Mangling names in ${destPath}...`)
        for (const [oldName, newName] of Object.entries(mangledMap))
            logger.extra(`Mangling ${oldName} -> ${newName}`)
        text = replaceTokens(text, mangledMap)
        if (stepwise) await writeFile(destPath + ".tokens", text, logger)
        return text
    }

    const addLoadStatements = (destPath: string, text: string, usedClasses: Set<string>, mangledMap: Record<string, string>) => {
        logger.extra(`Adding load statements in ${destPath}...`)
        for (const className of usedClasses)
            logger.extra(`Loading ${className} from ${classMap[className]}`)
        const loadStatements = generateLoadStatements(usedClasses, classMap, modName, mangledMap)
        const loadPrelude = loadStatements.join("\n")
        const draft = loadPrelude + "\n" + text
        return draft
    }

    for (const sourcePath of gdFiles) {
        const destPath = makeDestPath(sourcePath, from, buildDir)
        const myClassName = findMyClassName(sourcePath)
        let text = await fs.readFile(sourcePath, "utf-8")
        text = await removeClassName(destPath, text, myClassName)
        text = await replaceAllExtends(destPath, text)
        text = await stripAllTypes(destPath, text)
        const usedClasses = detectTokens(text, classNames)
        const mangledMap = generateMangledNames(usedClasses, mangledNames, logger)
        text = await mangleNames(destPath, text, mangledMap)
        text = addLoadStatements(destPath, text, usedClasses, mangledMap)
        text = moveExtendsToTop(text)
        await writeFile(destPath, text, logger)
    }
}

export const _stripScripts = async (config: BustleConfig) => {
    const logger = new Logger(config.dryRun)
    await stripScripts(config.modName, config.modDir, config.buildDir, logger)
}
