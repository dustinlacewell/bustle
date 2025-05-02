import chalk from "chalk"
import wrap from "word-wrap"

import { flattenResult } from "./search"

export const printItem = (item: ReturnType<typeof flattenResult>) => {
    console.log(`ID: ${chalk.gray(item.id)}`)
    console.log(`Title: ${chalk.bold(item.title)}`)
    console.log(`Author: ${chalk.white(item.author)}`)
    console.log(`Created: ${chalk.italic(item.created)}`)
    console.log(`Updated: ${chalk.italic(item.updated)}`)
    console.log(`Decay: ${chalk.magenta(`${item.decay} days`)}`)
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

export const printItemLine = (item: ReturnType<typeof flattenResult>) => {
    const id = chalk.gray(item.id)
    const title = chalk.bold(item.title)
    const author = chalk.italic(item.author)
    console.log(`${id} | ${title} by ${author}`)
}

export const printItems = (items: ReturnType<typeof flattenResult>[]) => {
    items.forEach(printItemLine)
}
