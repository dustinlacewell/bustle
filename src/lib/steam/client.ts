import type { Client } from "steamworks.js"

import appid from "../../appid.js"
import { personaStateChangeEvent } from "./events.js"

export const availableTags = [
    "Character",
    "Texture Replacement",
    "Sound Replacement",
    "Gamemode",
    "Stage",
    "Tweaks",
    "Tool",
    "Overhaul",
    "Clientside",
    "Style"
] as const

export type Steam = Client
export type Workshop = Steam["workshop"]
export type Friends = Steam["friends"]
export type LocalPlayer = Steam["localplayer"]

export class SteamModule {
    client!: Client
    friends!: Friends
    workshop!: Workshop
    localplayer!: LocalPlayer

    async init() {
        if (this.client !== undefined) {
            return
        }
        const steamworks = await import("steamworks.js")
        const steam = steamworks.init(appid) as Client
        steam.friends.getPersonaName(BigInt(5))
        steam.callback.register(steam.callback.SteamCallback.PersonaStateChange, (value) => {
            personaStateChangeEvent.emit(value.steam_id.toString())
        })
        this.client = steam
        this.workshop = steam.workshop
        this.localplayer = steam.localplayer
        this.friends = steam.friends

        if (process.stdout.isTTY) {
            console.log("\x1b[2A\x1b[2K\x1b[1B\x1b[2K\x1b[1A")
        }
    }
}

const steamModule = new SteamModule()
export default steamModule

export const init = () => steamModule.init()

type Unwrap<T> = T extends Promise<infer U> ? U : T

export type UGCQueryType = Workshop["UGCQueryType"]
export type UserListType = Workshop["UserListType"]
export type UserListOrder = Workshop["UserListOrder"]
export type ItemVisibility = Workshop["UgcItemVisibility"]
export type UpdateStatus = Workshop["UpdateStatus"]
export type UGCType = Workshop["UGCType"]

export type WorkshopPaginatedResult = Unwrap<ReturnType<Workshop["getUserItems"]>>
export type WorkshopQueryResults = WorkshopPaginatedResult["items"]
export type WorkshopItem = Required<NonNullable<WorkshopQueryResults[number]>>
export type WorkshopItemStatistic = WorkshopItem["statistics"]

export interface WorkshopItemStatisticProps {
    subscriptions: bigint
    favorites: bigint
    followers: bigint
    uniqueSubscriptions: bigint
    uniqueFavorites: bigint
    uniqueFollowers: bigint
    uniqueWebsiteViews: bigint
    reportScore: bigint
    secondsPlayed: bigint
    playtimeSessions: bigint
    comments: bigint
    secondsPlayedDuringTimePeriod: bigint
    playtimeSessionsDuringTimePeriod: bigint
}
