import * as fs from "fs/promises"
import path, { basename } from "path"

import { ensureDir, getFilesRecursively, writeBinaryFile, writeFile } from "./fs-utils.js"
import { Logger } from "./logger.js"
import { checkDestSafety } from "./path-utils.js"

export type ImportMetadata = {
    sourcePath: string
    resourcePath: string
    relativePath: string
    baseName: string
    content: string
    redirectPath?: string
    importPath: string // Added this field
}

export const matchResourcePath = (text: string): string | null => {
    const regex = /path="(.*?)"/g
    const match = regex.exec(text)
    if (match) {
        return match[1]
    }
    return null
}

export const matchSourceFile = (text: string): string | null => {
    const regex = /sourceFile="res:\/\/[^/]+\/(.*?)"/g
    const match = regex.exec(text)
    if (match) {
        return match[1]
    }
    return null
}

export const findImports = async (dir: string): Promise<string[]> => {
    return getFilesRecursively(dir, ".import")
}

export const parseImport = async (file: string, logger: Logger): Promise<ImportMetadata | null> => {
    const content = await fs.readFile(file, "utf-8")
    const resourcePath = matchResourcePath(content)
    const sourcePath = matchSourceFile(content)

    if (!resourcePath) {
        logger.error(`No resource path found in ${file}`)
        return null
    }

    if (!sourcePath) {
        logger.error(`No source path found in ${file}`)
        return null
    }

    const relativePath = resourcePath.replace("res://", "")
    const baseName = basename(relativePath)

    return {
        sourcePath,
        resourcePath,
        relativePath,
        baseName,
        content,
        importPath: file // Store the original import file path
    }
}

export const parseImports = async (files: string[], logger: Logger): Promise<ImportMetadata[]> => {
    const metas = await Promise.all(files.map(f => parseImport(f, logger)))
    return metas.filter(metadata => metadata !== null)
}

export const redirectImport = (meta: ImportMetadata, gatherDir: string) => {
    meta.redirectPath = `res://${gatherDir}/${meta.baseName}`
    meta.content = meta.content.replaceAll(meta.resourcePath, meta.redirectPath)
}

export const redirectImports = async (metadatas: ImportMetadata[], gatherDir: string): Promise<ImportMetadata[]> => {
    await Promise.all(metadatas.map(meta => redirectImport(meta, gatherDir)))
    return metadatas
}

export const writeImport = async (meta: ImportMetadata, modDir: string, buildDir: string, modName: string, logger: Logger) => {
    const relativeToMod = path.relative(modDir, meta.importPath)
    const destFile = path.join(buildDir, modName, relativeToMod)
    await ensureDir(path.dirname(destFile), logger)
    await writeFile(destFile, meta.content, logger)
}

export const writeImports = async (metadatas: ImportMetadata[], modDir: string, buildDir: string, modName: string, logger: Logger) => {
    await Promise.all(metadatas.map(meta => writeImport(meta, modDir, buildDir, modName, logger)))
}

export const copyResource = async (meta: ImportMetadata, godotDir: string, buildDir: string, gatherDir: string, logger: Logger) => {
    const sourceFile = path.join(godotDir, meta.relativePath)
    const destFile = path.join(buildDir, gatherDir, meta.baseName)

    await ensureDir(path.dirname(destFile), logger)
    const content = await fs.readFile(sourceFile)
    await writeBinaryFile(destFile, content, logger)
}

export const copyResources = async (metadatas: ImportMetadata[], godotDir: string, buildDir: string, gatherDir: string, logger: Logger) => {
    await Promise.all(metadatas.map(meta => copyResource(meta, godotDir, buildDir, gatherDir, logger)))
}

export const extractImportSources = (metadatas: ImportMetadata[]): string[] => {
    const sources = new Set(metadatas.map(meta => meta.sourcePath))
    return [...sources]
}

export const loadImports = async (modDir: string, logger: Logger): Promise<ImportMetadata[]> => {
    const importFiles = await findImports(modDir)

    for (const file of importFiles) {
        logger.info(`Loaded import file: ${file}`)
    }

    return await parseImports(importFiles, logger)
}

export const gatherImports = async (modName: string, modDir: string, buildDir: string, gatherDir: string, godotDir: string, logger: Logger, imports: ImportMetadata[] | null = null): Promise<void> => {
    checkDestSafety(modDir, buildDir, ["modDir", "buildDir"])
    checkDestSafety(modDir, path.join(buildDir, gatherDir), ["modDir", "buildDir"])

    const metas = imports ?? await loadImports(modDir, logger)

    // Always redirect the paths in the import files
    await redirectImports(metas, gatherDir)

    // Write the modified import files to buildDir/modName/ maintaining modDir structure
    await writeImports(metas, modDir, buildDir, modName, logger)

    // Copy the resource files to buildDir/gatherDir
    await copyResources(metas, godotDir, buildDir, gatherDir, logger)
}
