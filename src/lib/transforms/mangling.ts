import { Logger } from "@/lib/logger.js"

import { MangledNames } from "./types.js"

export const generateMangledName = (className: string, usedNames: Set<string>): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let mangledName: string
    do {
        const suffix = Array.from({ length: 4 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("")
        mangledName = `${className}${suffix}`
    } while (usedNames.has(mangledName))
    usedNames.add(mangledName)
    return mangledName
}

export const generateMangledNames = (
    usedClasses: Set<string>,
    mangledNames: MangledNames,
    logger: Logger
) => {
    const fileNameMapping: Record<string, string> = {}
    for (const className of usedClasses) {
        mangledNames[className] = mangledNames[className] || new Set()
        const mangledName = generateMangledName(className, mangledNames[className])
        mangledNames[className].add(mangledName)
        fileNameMapping[className] = mangledName
        logger.extra(`  Mangled class name: ${className} -> ${mangledName}`)
    }
    return fileNameMapping
}

export const generateLoadStatements = (
    usedClasses: Set<string>,
    classMap: Record<string, string>,
    modName: string,
    fileNameMapping: Record<string, string>
): string[] =>
    Array.from(usedClasses)
        .sort()
        .map(className => generateLoadStatement(
            fileNameMapping[className],
            classMap[className],
            modName
        ))

export const generateLoadStatement = (
    mangledName: string,
    filePath: string,
    modName: string
): string =>
    `const ${mangledName} = preload("res://${modName}/${filePath}")`
