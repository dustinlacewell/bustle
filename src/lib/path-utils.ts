import * as path from 'path'


export const makeRelativePath = (fullPath: string, baseDir: string): string =>
    path.relative(baseDir, fullPath)
        .replace(/\\/g, '/')

export const makeDestPath = (sourcePath: string, sourceDir: string, destDir: string): string =>
    path.join(destDir, makeRelativePath(sourcePath, sourceDir))