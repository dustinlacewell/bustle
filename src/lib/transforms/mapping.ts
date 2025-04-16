import * as fs from "fs/promises"

import { getFilesRecursively } from "@/lib/fs-utils.js"
import { makeRelativePath } from "@/lib/path-utils.js"

export const locateGDFiles = async (dir: string): Promise<string[]> => {
    return getFilesRecursively(dir, ".gd")
}

export const locateTSCNFiles = async (dir: string): Promise<string[]> => {
    return getFilesRecursively(dir, ".tscn")
}

export const findClassName = (text: string): string | null => {
    const regex = /class_name\s+(\w+)/g
    const match = regex.exec(text)
    if (match) {
        return match[1]
    }
    return null
}

export const buildClassMap = async (sourceDir: string): Promise<Record<string, string>> => {
    const files = await getFilesRecursively(sourceDir, ".gd")
    const classMap: Record<string, string> = {}
    for (const file of files) {
        const text = await fs.readFile(file, "utf-8")
        const className = findClassName(text)
        if (className) {
            classMap[className] = makeRelativePath(file, sourceDir)
        }
    }
    return classMap
}
