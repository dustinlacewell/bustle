import * as fs from 'fs/promises'
import { type } from 'arktype'

// Build command args type
const BuildArgsType = type({
    'from': 'string',
    'to': 'string',
    'name': 'string',
    'dryRun?': 'boolean',
    'keep?': 'boolean',
    'tempDir?': 'string'
})

// Dev command args type
const DevArgsType = type({
    'from': 'string',
    'to': 'string',
    'name': 'string',
    'dryRun?': 'boolean',
    'keep?': 'boolean',
    'tempDir?': 'string'
})

// Strip command args type
const StripArgsType = type({
    'from': 'string',
    'to': 'string',
    'dryRun?': 'boolean'
})

// Gather command args type
const GatherArgsType = type({
    'from': 'string',
    'to': 'string',
    'project': 'string',
    'dryRun?': 'boolean'
})

// Zip command args type
const ZipArgsType = type({
    'from': 'string',
    'to': 'string',
    'name': 'string',
    'dryRun?': 'boolean'
})

export type BuildArgs = {
    from: string
    to: string
    project: string
    name: string
    dryRun?: boolean
    keep?: boolean
    tempDir?: string
}

export type DevArgs = {
    from: string
    to: string
    name: string
    dryRun?: boolean
    keep?: boolean
    tempDir?: string
}

export type StripArgs = {
    from: string
    to: string
    dryRun?: boolean
}

export type GatherArgs = {
    from: string
    to: string
    project: string
    dryRun?: boolean
}

export type ZipArgs = {
    from: string
    to: string
    name: string
    dryRun?: boolean
}

// Define command-specific configurations
const CommandConfigType = type.or(
    {
        name: '"release"',
        args: BuildArgsType
    },
    {
        name: '"dev"',
        args: DevArgsType
    },
    {
        name: '"strip"',
        args: StripArgsType
    },
    {
        name: '"zip"',
        args: ZipArgsType
    },
    {
        name: '"gather"',
        args: GatherArgsType
    }
)

// The full config file type
const ConfigType = type({
    '[string]': CommandConfigType
})

export type BuildConfig = {
    name: 'release'
    args: BuildArgs
}

export type DevConfig = {
    name: 'dev'
    args: DevArgs
}

export type StripConfig = {
    name: 'strip'
    args: StripArgs
}

export type ZipConfig = {
    name: 'zip'
    args: ZipArgs
}

export type GatherConfig = {
    name: 'gather'
    args: GatherArgs
}


export type CommandConfig = BuildConfig | DevConfig | StripConfig | ZipConfig | GatherConfig

export type BustleConfig = Record<string, CommandConfig>

export async function readConfigFile(configPath = 'bustle.json'): Promise<BustleConfig> {
    const configContent = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(configContent)

    const result = ConfigType(config)

    if (result instanceof type.errors) {
        throw new Error(`Invalid bustle.json configuration: ${result.summary}`)
    } else {
        // The validated result matches our BustleConfig type
        return result as unknown as BustleConfig
    }
}