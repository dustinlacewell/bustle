import { command, flag, positional, string } from "cmd-ts"
import { Table } from "console-table-printer"

import appid from "@/appid.js"
import { dryRun } from "@/commands/args.js"
import { workshop } from "@/lib/steam/client.js"
import { drain, dump, getPersonaName } from "@/lib/steam/utils.js"

export const search = command({
    name: "query",
    description: "Query for mods",
    args: {
        query: positional({
            displayName: "query",
            type: string,
            description: "Query string"
        }),
        character: flag({
            long: "character",
            description: "Search for character mods"
        }),
        texture: flag({
            long: "texture",
            description: "Search for texture mods"
        }),
        sound: flag({
            long: "sound",
            description: "Search for sound mods"
        }),
        gamemode: flag({
            long: "gamemode",
            description: "Search for gamemode mods"
        }),
        stage: flag({
            long: "stage",
            description: "Search for stage mods"
        }),
        tweaks: flag({
            long: "tweaks",
            description: "Search for tweaks mods"
        }),
        tool: flag({
            long: "tool",
            description: "Search for tool mods"
        }),
        overhaul: flag({
            long: "overhaul",
            description: "Search for overhaul mods"
        }),
        clientside: flag({
            long: "clientside",
            description: "Search for clientside mods"
        }),
        style: flag({
            long: "style",
            description: "Search for style mods"
        }),
        details: flag({
            long: "details",
            description: "Show details"
        }),
        dryRun
    },
    handler: async ({ query, character, texture, sound, gamemode, stage, tweaks, tool, overhaul, clientside, style, details }) => {
        try {
            const tags: string[] = []
            if (character) tags.push("Character")
            if (texture) tags.push("Texture Replacement")
            if (sound) tags.push("Sound Replacement")
            if (gamemode) tags.push("Gamemode")
            if (stage) tags.push("Stage")
            if (tweaks) tags.push("Tweaks")
            if (tool) tags.push("Tool")
            if (overhaul) tags.push("Overhaul")
            if (clientside) tags.push("Clientside")
            if (style) tags.push("Style")
            if (tags.length === 0) tags.push("Character")
            const results = await drain((page) => {
                return workshop.getAllItems(
                    page,
                    workshop.UGCQueryType.RankedByTotalVotesAsc,
                    workshop.UGCType.Items,
                    appid, appid,
                    {
                        searchText: query,
                        requiredTags: tags
                    }
                )
            })

            if (details) {
                console.log(dump(results))
            }
            else {
                const names = await Promise.all(
                    results.map<Promise<string>>((item) => {
                        const owner = item.owner
                        const steamId = BigInt(owner.steamId64)
                        return getPersonaName(steamId)
                    })
                )
                names.sort()
                const table = new Table({
                    columns: [
                        { name: "item", color: "blue" },
                        { name: "author", color: "white" },
                        { name: "id", color: "cyan" },
                        { name: "upvotes", color: "green" },
                        { name: "downvotes", color: "red" },
                        { name: "created", color: "magenta" },
                        { name: "updated", color: "yellow" }
                    ]
                })
                names.forEach((author, index) => {
                    const item = results[index]
                    const created = new Date(item.timeCreated * 1000)
                    const updated = new Date(item.timeUpdated * 1000)
                    table.addRow({
                        item: item.title,
                        author,
                        id: item.publishedFileId.toString(),
                        upvotes: item.numUpvotes,
                        downvotes: item.numDownvotes,
                        created: `${created.getMonth()}/${created.getFullYear()}`,
                        updated: `${updated.getMonth()}/${updated.getFullYear()}`
                    })
                })
                table.printTable()
            }
        }
        catch (error) {
            console.error(error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
