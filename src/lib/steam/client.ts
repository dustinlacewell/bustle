import * as steamworks from "steamworks.js"

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

export type Steam = ReturnType<typeof steamworks.init>
export type Workshop = Steam["workshop"]
export type LocalPlayer = Steam["localplayer"]

export let steam: Steam
export let workshop: Workshop
export let localplayer: LocalPlayer

export const init = () => {
    steam = steamworks.init(appid)
    console.log(`Steamworks initialized for appid ${appid}: ${steam !== undefined}`)
    workshop = steam.workshop
    localplayer = steam.localplayer
    steam.callback.register(steam.callback.SteamCallback.PersonaStateChange, (value) => {
        personaStateChangeEvent.emit(value.steam_id.toString())
    })
    return steam
}

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
