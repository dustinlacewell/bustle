import { command, flag, number, option, positional, string } from "cmd-ts"

import { sortFlags, tagFlags } from "@/lib/steam/cli"
import { printTable } from "@/lib/steam/table"

import { getSortFunction, getTags, searchItems } from "../../lib/steam/search"

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
