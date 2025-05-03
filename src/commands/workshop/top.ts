import { command, flag, number, option } from "cmd-ts"

import { sortFlags, tagFlags } from "@/lib/steam/cli"
import { printTable } from "@/lib/steam/table"

import { getSortFunction, getTags, searchItems } from "../../lib/steam/search"

export const top = command({
    name: "top",
    description: "List the top mods",
    args: {
        max: option({
            type: number,
            long: "max",
            description: "Maximum number of results (limit: 100)",
            defaultValue: () => 10
        }),
        json: flag({
            long: "json",
            description: "Output results as JSON"
        }),
        ...tagFlags,
        ...sortFlags
    },
    handler: async (args) => {
        const { max, json, ...rest } = args;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (rest as any).asc = false
        try {
            const tags = getTags(rest)
            const sortFunction = getSortFunction(rest)
            const data = (await searchItems("*", max, tags, sortFunction, false))
                .map(item => ({
                    ...item,
                    votes: `${item.upvotes}/${item.downvotes}`
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
