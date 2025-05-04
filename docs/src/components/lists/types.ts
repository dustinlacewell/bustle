export interface Mod {
    id: string
    author: string
    subscriptions: string
    favorites: string
    followers: string
    uniqueSubscriptions: string
    uniqueFavorites: string
    uniqueFollowers: string
    uniqueWebsiteViews: string
    reportScore: string
    secondsPlayed: string
    playtimeSessions: string
    comments: string
    secondsPlayedDuringTimePeriod: string
    playtimeSessionsDuringTimePeriod: string
    publishedFileId: string
    creatorAppId: number
    consumerAppId: number
    title: string
    description: string
    owner: {
        steamId64: string
        steamId32: string
        accountId: number
    }
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
    decay: string
    uniqueViews: string
    playtime: string
    sessions: string
    votes: string
}

export interface CommunityList {
    filename: string
    baseName: string
    displayName: string
    description: string
}

export interface SortConfig {
    key: keyof Mod
    direction: 'ascending' | 'descending'
}
