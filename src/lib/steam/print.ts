import chalk from "chalk"
import wrap from "word-wrap"

import steam, { WorkshopItem } from "./client"
import { fetchIndex } from "./lists"
import { flattenResult, ModItem } from "./search"
import { subToAll, unsubFromAll } from "./subs"
import { indexByTag } from "./tags"
import { getPersonaName } from "./utils"

export const printListIndex = (index: Awaited<ReturnType<typeof fetchIndex>>) => {
    console.log("Community Lists:")
    Object.entries(index).forEach(([name, { url, description }]) => {
        console.log(`${chalk.bold(name)}: ${chalk.gray(description)}`)
    })
}

export const printTaggedItems = (items: Awaited<ReturnType<typeof indexByTag>>, tags: string[]) => {
    const anyTagSelected = tags.length > 0

    // Print items by tag groups
    for (const [tag, taggedItems] of items.entries()) {
        // Skip empty categories
        if (taggedItems.length === 0) {
            continue
        }

        // Skip categories that aren't selected (if any are selected)
        if (anyTagSelected && !tags.includes(tag)) {
            continue
        }

        console.log(`\n${tag} (${taggedItems.length}):`)
        console.log("-".repeat(tag.length + taggedItems.length.toString().length + 4))

        for (const { data } of taggedItems) {
            printItemLine(data)
        }
    }
}

export const printItem = (item: ModItem) => {
    console.log(`ID: ${chalk.gray(item.id)}`)
    console.log(`Title: ${chalk.bold(item.title)}`)
    console.log(`Author: ${chalk.white(item.author)}`)
    console.log(`Created: ${chalk.italic(item.created)}`)
    console.log(`Updated: ${chalk.italic(item.updated)}`)
    console.log(`Decay: ${chalk.magenta(`${item.decay.toFixed(2)} days`)}`)
    console.log(`Votes: ${chalk.green(item.upvotes)}/${chalk.red(item.downvotes)}`)
    console.log(`Score: ${chalk.yellow(item.score.toFixed(2))}`)
    console.log(`Favorites: ${chalk.cyan(item.favorites)}/${chalk.cyanBright(item.uniqueFavorites)}`)
    console.log(`Subscriptions: ${chalk.green(item.subscriptions)}/${chalk.greenBright(item.uniqueSubscriptions)}`)
    console.log(`Comments: ${chalk.blue(item.comments)}`)
    console.log(`Views: ${chalk.blueBright(item.uniqueViews)}`)
    console.log(`Banned: ${item.banned ? chalk.red("Yes") : chalk.italic("No")}`)
    console.log(`Report Score: ${chalk.bold(item.reportScore)}`)
    console.log(`Description:\n\n${wrap(item.description, { width: 45 })}`)
    console.log(`\n${chalk.gray(`https://steamcommunity.com/sharedfiles/filedetails/?id=${item.id}`)}`)
}

export const printItemLine = (item: ModItem) => {
    const id = chalk.gray(item.id)
    const title = chalk.bold(item.title)
    const author = chalk.italic(item.author)
    console.log(`${id} | ${title} by ${author}`)
}

export const printItems = (items: ModItem[]) => {
    items.forEach(printItemLine)
}

export const printAlreadySubscribed = async (ids: bigint[]) => {
    console.log(chalk.yellow(`\nWas already subscribed to ${ids.length} mods:`))
    for (const id of ids) {
        const data = await steam.workshop.getItem(id)
        const name = await getPersonaName(data!.owner.steamId64)
        const flatData = flattenResult(data as unknown as Required<WorkshopItem>, name)
        printItemLine(flatData)
    }
    console.log()
}

export const printSuccessSubscribed = async (ids: bigint[]) => {
    console.log(chalk.green(`\nSuccessfully subscribed to ${ids.length} mods:`))
    for (const id of ids) {
        const data = await steam.workshop.getItem(id)
        const name = await getPersonaName(data!.owner.steamId64)
        const flatData = flattenResult(data as unknown as Required<WorkshopItem>, name)
        printItemLine(flatData)
    }
    console.log()
}

export const printFailureSubscribed = (ids: { id: bigint, error: string }[]) => {
    console.log(chalk.red("\nFailed to subscribe to the following mods:"))
    for (const failure of ids) {
        console.log(chalk.red(`  ${failure.id}:`))
        console.log(chalk.red(`    ${failure.error}`))
    }
    console.log()
}

export const printSubscribeResults = async (results: Awaited<ReturnType<typeof subToAll>>) => {
    if (results.alreadyIds.length > 0) {
        await printAlreadySubscribed(results.alreadyIds)
    }

    if (results.successIds.length > 0) {
        await printSuccessSubscribed(results.successIds)
    }

    if (results.failureIds.length > 0) {
        printFailureSubscribed(results.failureIds)
    }
}

export const printNotSubscribed = (ids: bigint[]) => {
    console.log(chalk.yellow(`\nWasn't subscribed to ${ids.length} mods:`))
    for (const id of ids) {
        console.log(chalk.yellow(`  ${id}`))
    }
    console.log()
}

export const printUnsubscribed = async (ids: bigint[]) => {
    console.log(chalk.green(`\nSuccessfully unsubscribed from ${ids.length} mods:`))
    for (const id of ids) {
        const data = await steam.workshop.getItem(id)
        const name = await getPersonaName(data!.owner.steamId64)
        const flatData = flattenResult(data as unknown as Required<WorkshopItem>, name)
        printItemLine(flatData)
    }
    console.log()
}

export const printFailureUnsubscribed = (ids: { id: bigint, error: string }[]) => {
    console.log(chalk.red("\nFailed to unsubscribe from the following mods:"))
    for (const failure of ids) {
        console.log(chalk.red(`  ${failure.id}:`))
        console.log(chalk.red(`    ${failure.error}`))
    }
    console.log()
}

export const printUnsubscribeResults = async (results: Awaited<ReturnType<typeof unsubFromAll>>) => {
    if (results.notSubbedIds.length > 0) {
        printNotSubscribed(results.notSubbedIds)
    }

    if (results.successIds.length > 0) {
        await printUnsubscribed(results.successIds)
    }

    if (results.failureIds.length > 0) {
        printFailureUnsubscribed(results.failureIds)
    }
}
