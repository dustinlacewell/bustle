import fetch from "node-fetch"

import { subToAll, unsubFromAll } from "./subs.js"

export const indexUrl = "https://raw.githubusercontent.com/dustinlacewell/bustle-community-lists/refs/heads/main/lists.txt"

export const listUrlPrefix = "https://raw.githubusercontent.com/dustinlacewell/bustle-community-lists/refs/heads/main/lists/"

export const fetchIndex = async () => {
    const response = await fetch(indexUrl)
    const text = await response.text()
    const lines = text.split("\n").filter(line => line !== "")
    const entries = lines.map((line: string) => {
        const [, filename, ...description] = line.match(/^([^.]+)\.txt\s*(.*)$/) || []
        return [filename, { description: description.join(" "), url: listUrlPrefix + filename }] as const
    })
    return Object.fromEntries(entries)
}

export const fetchList = async (name: string) => {
    const response = await fetch(listUrlPrefix + name + ".txt")
    const text = await response.text()
    return text.split("\n").filter(line => line !== "")
}

export const intersection = async (listName: string, ids: string[]) => {
    const list = await fetchList(listName)
    return ids.filter(id => list.includes(id))
}

export const difference = async (listName: string, ids: string[]) => {
    const list = await fetchList(listName)
    return ids.filter(id => !list.includes(id))
}

export const ensureSubscribed = async (listName: string, ids: string[]) => {
    const missing = await difference(listName, ids)
    return subToAll(missing.map(id => BigInt(id)))
}

export const ensureUnsubscribed = async (listName: string, ids: string[]) => {
    const extra = await intersection(listName, ids)
    return unsubFromAll(extra.map(id => BigInt(id)))
}
