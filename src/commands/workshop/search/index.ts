import { command, flag, number, option, positional, string } from "cmd-ts"

import { printTable } from "@/lib/steam/table"

import { getSortFunction, getTags, searchItems } from "../../../lib/steam/search"

const sortFlags = {
    author: flag({
        long: "by-author",
        description: "Sort by author"
    }),
    title: flag({
        long: "by-title",
        description: "Sort by title"
    }),
    upvotes: flag({
        long: "by-upvotes",
        description: "Sort by upvotes"
    }),
    downvotes: flag({
        long: "by-downvotes",
        description: "Sort by downvotes"
    }),
    created: flag({
        long: "by-created",
        description: "Sort by creation date"
    }),
    updated: flag({
        long: "by-updated",
        description: "Sort by last update date"
    }),
    subscriptions: flag({
        long: "by-subscriptions",
        description: "Sort by number of subscriptions"
    }),
    favorites: flag({
        long: "by-favorites",
        description: "Sort by number of favorites"
    }),
    followers: flag({
        long: "by-followers",
        description: "Sort by number of followers"
    }),
    uniqueSubscriptions: flag({
        long: "by-unique-subscriptions",
        description: "Sort by number of unique subscriptions"
    }),
    uniqueFavorites: flag({
        long: "by-unique-favorites",
        description: "Sort by number of unique favorites"
    }),
    uniqueFollowers: flag({
        long: "by-unique-followers",
        description: "Sort by number of unique followers"
    }),
    uniqueViews: flag({
        long: "by-unique-views",
        description: "Sort by number of unique views"
    }),
    reportScore: flag({
        long: "by-report-score",
        description: "Sort by report score"
    }),
    playtime: flag({
        long: "by-playtime",
        description: "Sort by playtime"
    }),
    sessions: flag({
        long: "by-sessions",
        description: "Sort by number of playtime sessions"
    }),
    comments: flag({
        long: "by-comments",
        description: "Sort by number of comments"
    })
}

const tagFlags = {
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
    })
}

export const search = command({
    name: "query",
    description: "Query for mods",
    args: {
        query: positional({
            displayName: "query",
            type: string,
            description: "Query string"
        }),
        max: option({
            type: number,
            long: "max",
            description: "Maximum number of results (limit: 2000)",
            defaultValue: () => 100
        }),
        asc: flag({
            long: "asc",
            description: "Sort in ascending order"
        }),
        json: flag({
            long: "json",
            description: "Output results as JSON"
        }),
        ...tagFlags,
        ...sortFlags
    },
    handler: async (args) => {
        const { query, max, json, asc, ...rest } = args

        try {
            const tags = getTags(rest)
            const sortFunction = getSortFunction(rest)
            const data = (await searchItems(query, max, tags, sortFunction, asc))
                .map(item => ({
                    ...item,
                    votes: `${item.upvotes}/${item.downvotes}`,
                    score: Number(item.score.toFixed(2))
                }))

            if (json) {
                console.log(JSON.stringify(data, null, 2))
                process.exit(0)
            }

            printTable(data, [
                "title",
                "author",
                "id",
                "votes",
                "score",
                "subscriptions",
                "favorites",
                "created",
                "updated",
                "decay",
                "comments"
            ])
        }
        catch (error) {
            console.error(error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
})
