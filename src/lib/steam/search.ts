import appid from "@/appid"
import { WorkshopItem, WorkshopItemStatistic, WorkshopItemStatisticProps } from "@/lib/steam/client.js"
import steam from "@/lib/steam/client.js"

import { drain, getPersonaName } from "./utils"

export type WorkshopItemWithAuthor = {
    author: string
    id: string
    title: string
    upvotes: number
    downvotes: number
    created: number
    updated: number
    uniqueViews: bigint
    playtime: bigint
    sessions: bigint
    score: number
} & WorkshopItemStatisticProps

// map over WorkshopItemWithAuthor, take only the numeric fields
type NumericFields = {
    [key in keyof WorkshopItemWithAuthor]: WorkshopItemWithAuthor[key] extends bigint | number ? key : never
}[keyof WorkshopItemWithAuthor]

type WorkshopItemNumerics = {
    [key in NumericFields]: WorkshopItemWithAuthor[key]
}

const sortByField = (field: NumericFields) => (a: WorkshopItemNumerics, b: WorkshopItemNumerics) => {
    const aField = a[field]
    const bField = b[field]
    if (aField === undefined || bField === undefined) return 0
    return Number(bField) - Number(aField)
}

const sortByAuthor = (a: WorkshopItemWithAuthor, b: WorkshopItemWithAuthor) => {
    const aName = a.author
    const bName = b.author
    if (aName === undefined || bName === undefined) return 0
    return aName.localeCompare(bName)
}

const sortByTitle = (a: WorkshopItemWithAuthor, b: WorkshopItemWithAuthor) => {
    const aTitle = a.title
    const bTitle = b.title
    if (aTitle === undefined || bTitle === undefined) return 0
    return aTitle.localeCompare(bTitle)
}

export const sortFunctions = {
    author: sortByAuthor,
    title: sortByTitle,
    upvotes: sortByField("upvotes"),
    downvotes: sortByField("downvotes"),
    created: sortByField("created"),
    updated: sortByField("updated"),
    subscriptions: sortByField("subscriptions"),
    favorites: sortByField("favorites"),
    followers: sortByField("followers"),
    uniqueSubscriptions: sortByField("uniqueSubscriptions"),
    uniqueFavorites: sortByField("uniqueFavorites"),
    uniqueFollowers: sortByField("uniqueFollowers"),
    uniqueViews: sortByField("uniqueViews"),
    reportScore: sortByField("reportScore"),
    playtime: sortByField("playtime"),
    sessions: sortByField("sessions"),
    comments: sortByField("comments"),
    score: sortByField("score")
} as const

export type SortFunction = typeof sortFunctions[keyof typeof sortFunctions]
export type SortKeys = keyof typeof sortFunctions
export type SortOptions = Record<SortKeys, boolean>

export const getSortFunction = (options: SortOptions) => {
    if (options.author) return sortFunctions.author
    if (options.title) return sortFunctions.title
    if (options.upvotes) return sortFunctions.upvotes
    if (options.downvotes) return sortFunctions.downvotes
    if (options.created) return sortFunctions.created
    if (options.updated) return sortFunctions.updated
    if (options.subscriptions) return sortFunctions.subscriptions
    if (options.favorites) return sortFunctions.favorites
    if (options.followers) return sortFunctions.followers
    if (options.uniqueSubscriptions) return sortFunctions.uniqueSubscriptions
    if (options.uniqueFavorites) return sortFunctions.uniqueFavorites
    if (options.uniqueFollowers) return sortFunctions.uniqueFollowers
    if (options.uniqueViews) return sortFunctions.uniqueViews
    if (options.reportScore) return sortFunctions.reportScore
    if (options.playtime) return sortFunctions.playtime
    if (options.sessions) return sortFunctions.sessions
    if (options.comments) return sortFunctions.comments
    if (options.score) return sortFunctions.score
    return sortFunctions.title
}

export const sortResults = <T extends WorkshopItemNumerics>(results: T[], sortFunction: (a: T, b: T) => number, asc: boolean) => {
    results.sort(sortFunction)
    if (asc) results.reverse()
    return results
}

export const getTags = ({ character, texture, sound, gamemode, stage, tweaks, tool, overhaul, clientside, style }: Record<string, boolean>) => {
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
    return tags
}

export const flattenResult = (result: WorkshopItem, name: string) => {
    const { statistics, ...rest } = result
    // this is a WorkshopItemStatistic
    // but all the fields of form numWhatever
    // are now just whatever
    const newStatistics = {} as WorkshopItemStatisticProps
    Object.keys(statistics).forEach((key) => {
        let newKey = key.replace("num", "")
        newKey = newKey[0].toLowerCase() + newKey.slice(1)
        const val = statistics[key as keyof WorkshopItemStatistic]
        if (val === undefined)
            newStatistics[newKey as keyof WorkshopItemStatisticProps] = BigInt(0)
        else
            newStatistics[newKey as keyof WorkshopItemStatisticProps] = val
    })
    const id = rest.publishedFileId.toString()
    const createdDate = new Date(rest.timeCreated * 1000)
    const updatedDate = new Date(rest.timeUpdated * 1000)
    const created = `${createdDate.getDate()}/${createdDate.getMonth() + 1}/${createdDate.getFullYear()}`
    const updated = `${updatedDate.getDate()}/${updatedDate.getMonth() + 1}/${updatedDate.getFullYear()}`
    // decay is the number of years since the item was updated
    const decay = (Date.now() - rest.timeUpdated * 1000) / 1000 / 60 / 60 / 24 / 365
    const up = Number(rest.numUpvotes)
    const down = Number(rest.numDownvotes)
    let score = 0
    if (up > down) score = down > 0 ? up / down : up
    if (down > up) score = up > 0 ? down / up : down
    if (up === down) score = 1
    if (score === Infinity) score = 0
    return {
        id,
        author: name,
        ...newStatistics,
        ...rest,
        upvotes: rest.numUpvotes,
        downvotes: rest.numDownvotes,
        score,
        created,
        updated,
        decay,
        uniqueViews: statistics.numUniqueWebsiteViews || BigInt(0),
        playtime: statistics.numSecondsPlayed || BigInt(0),
        sessions: statistics.numPlaytimeSessions || BigInt(0)
    }
}

export const searchItems = async (query: string, max: number, tags: string[], sortFunction: SortFunction, asc: boolean) => {
    const results = await drain((page) => {
        return steam.workshop.getAllItems(
            page,
            query === "*" ? steam.workshop.UGCQueryType.RankedByTotalUniqueSubscriptions : steam.workshop.UGCQueryType.RankedByTextSearch,
            steam.workshop.UGCType.Items,
            appid, appid,
            {
                searchText: query === "*" ? undefined : query,
                requiredTags: tags,
                rankedByTrendDays: 7
            }
        )
    }, max)

    const names = await Promise.all(
        results.map<Promise<string>>((item) => {
            const owner = item.owner
            const steamId = BigInt(owner.steamId64)
            return getPersonaName(steamId)
        })
    )

    const data = names
        .map((name, i) => flattenResult(results[i], name))
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    data.sort(sortFunction as unknown as any)
    if (asc) data.reverse()
    return data
}
