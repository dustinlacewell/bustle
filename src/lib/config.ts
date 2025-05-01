import * as fs from "node:fs/promises"

import { type } from "arktype"

// eslint-disable-next-line
const ConfigType = type({
    "modName": "string",
    "modDir": "string",
    "godotDir": "string",
    "putReleaseIn": "string",
    "putDevIn": "string",
    "buildDir?": "string",
    "strip?": "boolean",
    "gather?": "boolean | string",
    "cleanup?": "boolean",
    "optimized?": "boolean",
    "include?": "string[]",
    "dryRun?": "boolean",
    "verbose?": "boolean"
})

export type BustleConfig = {
    modName: string // The name of the mod
    modDir: string // The directory where the mod is located
    godotDir: string // The directory where the Godot project is located
    buildDir: string // The directory where the build output will be placed
    putReleaseIn: string // The directory where the release zip will be placed
    putDevIn: string // The directory where the dev zip will be placed
    strip: boolean // Where to strip the code of class names
    gather: string | null // Whether to gather resources from the Godot project
    cleanup: boolean // Whether to clean up the build directory after the process
    optimized: boolean // Whether to omit resource sources
    include: string[] // List of resource sources to include
    dryRun: boolean // Whether to perform a dry run
    verbose: boolean // Whether to print verbose output
}

export async function readConfigFile(configPath = "bustle.json", dryRun = undefined): Promise<BustleConfig> {
    const configContent = await fs.readFile(configPath, "utf-8")
    const config = JSON.parse(configContent) as unknown
    const result = ConfigType(config)
    if (result instanceof type.errors) {
        throw new Error(`Invalid bustle.json configuration: ${result.summary}`)
    }
    else {
        return {
            modName: result.modName,
            modDir: result.modDir,
            godotDir: result.godotDir,
            putReleaseIn: result.putReleaseIn,
            putDevIn: result.putDevIn,
            strip: result.strip ?? false,
            gather: result.gather === true ? ".import" : result.gather ? result.gather : null,
            optimized: result.optimized ?? false,
            include: result.include ?? [],
            buildDir: result.buildDir ?? "dist",
            cleanup: result.cleanup ?? false,
            dryRun: dryRun !== undefined ? dryRun : result.dryRun ?? false,
            verbose: result.verbose ?? false
        }
    }
}
