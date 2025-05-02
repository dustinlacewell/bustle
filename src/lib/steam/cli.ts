import { flag } from "cmd-ts"

export const tagFlags = {
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
} as const

export const sortFlags = {
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
    }),
    score: flag({
        long: "by-score",
        description: "Sort by score"
    })
} as const

export const getSelectedTags = (tags: Record<string, boolean>) => {
    const selectedTags: string[] = []
    for (const [key, value] of Object.entries(tags)) {
        if (value) {
            // Convert flag name to proper tag name (capitalize first letter)
            const tagName = key.charAt(0).toUpperCase() + key.slice(1)

            // Handle special case for texture and sound which have "Replacement" suffix
            if (key === "texture") {
                selectedTags.push("Texture Replacement")
            }
            else if (key === "sound") {
                selectedTags.push("Sound Replacement")
            }
            else {
                selectedTags.push(tagName)
            }
        }
    }
    return selectedTags
}
