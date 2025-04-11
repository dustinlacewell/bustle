import * as fs from 'fs/promises'
import { writeFileLines } from "@/lib/fs-utils.js"
import { Logger } from "@/lib/logger.js"
import { makeRelativePath } from "@/lib/path-utils.js"
import { extractClassName, isCommentLine, isClassNameLine } from "./code-analysis.js"
import { ClassMap, MangledNames } from "./types.js"

// Split into separate functions for each type annotation context
export const stripFunctionParams = (line: string, classNames: Set<string>, logger: Logger): string => {
    // Matches: func name(param: Type, other: Type2)
    const funcParamPattern = /\((.*?)\)/
    const match = line.match(funcParamPattern)
    if (!match || !line.startsWith('func ')) return line

    const params = match[1].split(',')
    const processedParams = params.map(param => {
        const [name, type] = param.split(':').map(s => s.trim())
        if (type && classNames.has(type)) {
            logger.annotationStripped(`${name}: ${type}`, name)
            return name
        }
        return param
    })

    return line.replace(funcParamPattern, `(${processedParams.join(', ')})`)
}

export const stripReturnType = (line: string, classNames: Set<string>, logger: Logger): string => {
    // Matches: func name(...) -> Type
    const returnPattern = /\)(.*->)\s*([A-Z][a-zA-Z0-9_]*)/
    const match = line.match(returnPattern)
    if (!match || !line.startsWith('func ')) return line

    const returnType = match[2]
    if (classNames.has(returnType)) {
        logger.annotationStripped(`-> ${returnType}`, '')
        return line.replace(returnPattern, ')')
    }
    return line
}

export const stripVarType = (line: string, classNames: Set<string>, logger: Logger): string => {
    // Matches: var name: Type
    const varPattern = /^var\s+([a-zA-Z0-9_]+)\s*:\s*([A-Z][a-zA-Z0-9_]*)/
    const match = line.match(varPattern)
    if (!match) return line

    const [_, varName, typeName] = match
    if (classNames.has(typeName)) {
        logger.annotationStripped(`var ${varName}: ${typeName}`, `var ${varName}`)
        return `var ${varName}`
    }
    return line
}

export const stripTypeAnnotation = (line: string, classNames: Set<string>, logger: Logger): string => {
    let result = line

    // Only process lines that could have type annotations
    if (line.includes(':') || line.includes('->')) {
        result = stripFunctionParams(result, classNames, logger)
        result = stripReturnType(result, classNames, logger)
        result = stripVarType(result, classNames, logger)
    }

    return result
}

export const generateLoadStatement = (
    mangledName: string,
    filePath: string, 
    modName: string
): string =>
    `var ${mangledName} = load("res://${modName}/${filePath}")`

export const generateLoadStatements = (
    usedClasses: Set<string>, 
    classMap: ClassMap, 
    modName: string,
    fileNameMapping: Map<string, string>
): string[] =>
    Array.from(usedClasses)
        .sort()
        .map(className => generateLoadStatement(
            fileNameMapping.get(className)!,
            classMap[className],
            modName
        ))

// File Processing
export const buildClassMap = async (files: string[], sourceDir: string): Promise<ClassMap> => {
    const classMap: ClassMap = {}

    for (const file of files) {
        const lines = await fs.readFile(file, 'utf-8').then(content => content.split('\n'))
        for (const line of lines) {
            const className = extractClassName(line)
            if (className) {
                classMap[className] = makeRelativePath(file, sourceDir)
            }
        }
    }

    return classMap
}

export const extractExtendsClassName = (line: string): string | null => {
    const match = line.match(/^extends\s+([A-Z][a-zA-Z0-9_]*)/)
    return match ? match[1] : null
}

export const transformExtends = (
    line: string, 
    classMap: ClassMap, 
    modName: string,
    logger: Logger
): string => {
    const className = extractExtendsClassName(line)
    if (!className || !classMap[className]) {
        return line
    }

    const classPath = classMap[className]
    const newExtends = `extends "res://${modName}/${classPath}"`
    
    logger.extendsTransformed(line.trim(), newExtends)
    return newExtends
}

export const generateMangledName = (className: string, usedNames: Set<string>): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let mangledName: string
    do {
        const suffix = Array.from({ length: 4 }, () => 
            chars[Math.floor(Math.random() * chars.length)]
        ).join('')
        mangledName = `${className}${suffix}`
    } while (usedNames.has(mangledName))
    return mangledName
}

export const processFile = async (
    sourcePath: string,
    destPath: string,
    classMap: ClassMap,
    logger: Logger,
    modName: string,
    mangledNames: MangledNames
): Promise<void> => {
    logger.fileStart(sourcePath)
    const lines = await fs.readFile(sourcePath, 'utf-8').then(content => content.split('\n'))
    const classNames = new Set(Object.keys(classMap))

    // First collect all comment lines at the start
    const initialComments: string[] = []
    let i = 0
    while (i < lines.length && isCommentLine(lines[i])) {
        initialComments.push(lines[i])
        i++
    }

    // Handle extends line - either transform it (if class-based) or preserve it
    let extendsLine: string | null = null
    const originalExtendsLine = lines.find(line => line.trim().startsWith('extends'))
    if (originalExtendsLine) {
        const className = extractExtendsClassName(originalExtendsLine)
        if (className && classMap[className]) {
            // If it's extending one of our classes, transform it
            extendsLine = transformExtends(originalExtendsLine, classMap, modName, logger)
        } else {
            // Otherwise preserve it exactly as is
            extendsLine = originalExtendsLine
        }
    }

    // Process remaining lines - do ALL transformations first
    const processedLines = lines
        .filter(line => !isCommentLine(line) && !line.trim().startsWith('extends'))
        .filter(line => !isClassNameLine(line))
        .map(line => stripTypeAnnotation(line, classNames, logger))

    // NOW scan for class usages in the fully transformed code
    const usedClasses = new Set<string>()
    const fullContent = processedLines.join('\n')
    
    // Check each class name against the full transformed content
    for (const className of classNames) {
        // Look for the class name as a whole word
        const regex = new RegExp(`\\b${className}\\b`, 'g')
        if (regex.test(fullContent)) {
            usedClasses.add(className)
        }
    }

    const usedClassesArray = Array.from(usedClasses).sort()
    logger.classUsagesFound(usedClassesArray)

    // Create mangled names for used classes
    const fileNameMapping = new Map<string, string>()
    for (const className of usedClasses) {
        mangledNames[className] = mangledNames[className] || new Set()
        const mangledName = generateMangledName(className, mangledNames[className])
        mangledNames[className].add(mangledName)
        fileNameMapping.set(className, mangledName)
        logger.nameMangled(className, mangledName)
    }

    // Replace class names with mangled versions, but skip strings
    const mangledLines = processedLines.map(line => {
        let result = line
        let inString = false
        let stringChar = ''
        let newLine = ''
        let currentSegment = ''

        // Go through the line character by character to track string boundaries
        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            
            // Handle escape sequences in strings
            if (inString && char === '\\' && i + 1 < line.length) {
                newLine += char + line[i + 1]
                i++ // Skip next character as it's part of escape sequence
                continue
            }

            // Track string boundaries
            if ((char === '"' || char === "'") && (i === 0 || line[i - 1] !== '\\')) {
                if (inString) {
                    if (char === stringChar) {
                        // End of string
                        inString = false
                        newLine += currentSegment + char
                        currentSegment = ''
                    } else {
                        // Different quote character inside string
                        currentSegment += char
                    }
                } else {
                    // Start of string
                    inString = true
                    stringChar = char
                    
                    // Mangle any collected segment before the string
                    if (currentSegment) {
                        let mangledSegment = currentSegment
                        for (const [className, mangledName] of fileNameMapping) {
                            mangledSegment = mangledSegment.replace(
                                new RegExp(`\\b${className}\\b`, 'g'),
                                mangledName
                            )
                        }
                        newLine += mangledSegment
                    }
                    newLine += char
                    currentSegment = ''
                }
            } else {
                currentSegment += char
            }
        }

        // Handle any remaining segment after the last string (or if no strings in line)
        if (currentSegment) {
            let mangledSegment = currentSegment
            for (const [className, mangledName] of fileNameMapping) {
                mangledSegment = mangledSegment.replace(
                    new RegExp(`\\b${className}\\b`, 'g'),
                    mangledName
                )
            }
            newLine += mangledSegment
        }

        return newLine || result
    })

    // Build final file in correct order
    const finalLines = [
        ...initialComments,                    // Initial comments first
        ...(extendsLine ? [extendsLine] : []), // Either transformed or preserved extends line
        '',                                    // Blank line after extends
        ...generateLoadStatements(usedClasses, classMap, modName, fileNameMapping),
        ...(usedClasses.size > 0 ? [''] : []), // Blank line after load statements if they exist
        ...mangledLines                        // Then the rest of the code
    ]

    await writeFileLines(destPath, finalLines, logger)
}