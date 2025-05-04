#!/usr/bin/env node

import fs from 'fs'
import { command, restPositionals, string, run, option } from 'cmd-ts'

// Define the Mod interface with strict typing
interface Owner {
    steamId64: number
    steamId32: string
    accountId: number
}

interface Mod {
    id: string
    author: string
    subscriptions: number
    favorites: number
    followers: number
    uniqueSubscriptions: number
    uniqueFavorites: number
    uniqueFollowers: number
    uniqueWebsiteViews: number
    reportScore: number
    secondsPlayed: number
    playtimeSessions: number
    comments: number
    secondsPlayedDuringTimePeriod: number
    playtimeSessionsDuringTimePeriod: number
    publishedFileId: number
    creatorAppId: number
    consumerAppId: number
    title: string
    description: string
    owner: Owner
    timeCreated: number
    timeUpdated: number
    timeAddedToUserList: number
    visibility: number
    banned: boolean
    acceptedForUse: boolean
    tags: string[]
    tagsTruncated: boolean
    url: string
    numUpvotes: number
    numDownvotes: number
    numChildren: number
    previewUrl: string
    upvotes: number
    downvotes: number
    score: number
    created: string
    updated: string
    decay: number
    uniqueViews: number
    playtime: number
    sessions: number
    votes: string
}

/**
 * Reads and parses a JSON file
 */
const readJsonFile = (filePath: string): Mod[] => {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data) as Mod[]
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error)
        return []
    }
}

/**
 * Adds a mod to the map if it doesn't already exist
 */
const addModToMap = (modMap: Map<string, Mod>, mod: Mod): void => {
    if (!modMap.has(mod.id)) {
        modMap.set(mod.id, mod)
    }
}

/**
 * Processes a single file and adds its mods to the map
 */
const processFile = (modMap: Map<string, Mod>, filePath: string): void => {
    const mods = readJsonFile(filePath)
    
    for (const mod of mods) {
        addModToMap(modMap, mod)
    }
}

/**
 * Merges multiple arrays of mods into a single map indexed by ID
 */
const mergeMods = (inputFiles: string[]): Map<string, Mod> => {
    const modMap = new Map<string, Mod>()

    for (const file of inputFiles) {
        processFile(modMap, file)
    }

    return modMap
}

/**
 * Converts the mod map to an array for output
 */
const mapToArray = (modMap: Map<string, Mod>): Mod[] => {
    return Array.from(modMap.values())
}

/**
 * Writes the merged mods to the output file
 */
const writeOutputFile = (outputFile: string, mods: Mod[]): void => {
    try {
        fs.writeFileSync(outputFile, JSON.stringify(mods, null, 2), 'utf8')
        console.log(`Successfully merged ${mods.length} unique mods to ${outputFile}`)
    } catch (error) {
        console.error(`Error writing to ${outputFile}:`, error)
    }
}

/**
 * Main merge function that orchestrates the entire process
 */
const performMerge = (inputFiles: string[], outputFile: string): void => {
    console.log(`Merging ${inputFiles.length} files into ${outputFile}`)
    
    const modMap = mergeMods(inputFiles)
    const modsArray = mapToArray(modMap)
    writeOutputFile(outputFile, modsArray)
}

// Define the command using cmd-ts
const mergeCommand = command({
    name: 'merge',
    description: 'Merge multiple JSON files containing mods into a single output file',
    args: {
        output: option({
            type: string,
            long: 'output',
            short: 'o',
            description: 'Output JSON file path'
        }),
        inputFiles: restPositionals({
            type: string,
            description: 'Input JSON files to merge'
        })
    },
    handler: (args) => {
        if (args.inputFiles.length === 0) {
            console.error('Error: No input files specified')
            process.exit(1)
        }
        
        if (!args.output) {
            console.error('Error: No output file specified')
            process.exit(1)
        }
        
        performMerge(args.inputFiles, args.output)
    }
})

// Run the command
run(mergeCommand, process.argv.slice(2))
