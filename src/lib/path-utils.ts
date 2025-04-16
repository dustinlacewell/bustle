import * as path from "path"

export const makeRelativePath = (fullPath: string, baseDir: string): string =>
    path.relative(baseDir, fullPath)
        .replace(/\\/g, "/")

export const makeDestPath = (sourcePath: string, sourceDir: string, destDir: string): string =>
    path.join(destDir, makeRelativePath(sourcePath, sourceDir))

export function destIsSafe(basePath: string, testPath: string): boolean {
    const normalizedBasePath: string = normalizeAndResolvePath(basePath)
    const normalizedTestPath: string = normalizeAndResolvePath(testPath)
    if (isSamePath(normalizedBasePath, normalizedTestPath)) return false
    if (isSubPath(normalizedBasePath, normalizedTestPath)) return false
    return true
}

export function checkDestSafety(basePath: string, testPath: string, vars?: string[]) {
    if (!destIsSafe(basePath, testPath)) {
        let warnString = ""
        if (vars && vars.length) {
            const varsString = vars.join(", ")
            warnString = ` Check these: ${varsString}`
        }
        throw new Error(`Destination directory ${testPath} is not safe.${warnString}`)
    }
}

export function mkDest(basePath: string, a: string, b: string, vars?: string[]): string {
    const destPath = path.join(a, b)
    checkDestSafety(basePath, destPath, vars)
    return destPath
}

function normalizeAndResolvePath(inputPath: string): string {
    return path.resolve(inputPath).replace(/\\/g, "/")
}

function isSamePath(a: string, b: string): boolean {
    return a === b
}

function isSubPath(base: string, test: string): boolean {
    if (!test.startsWith(base.endsWith("/") ? base : base + "/")) return false
    return true
}
