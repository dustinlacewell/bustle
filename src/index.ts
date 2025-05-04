#!/usr/bin/env node

import { run, subcommands } from "cmd-ts"

import pkg from "../package.json"
import { bootstrap } from "./boostrap"
import { _build, build as release } from "./commands/build/index.js"
import { _dev, dev } from "./commands/dev/index.js"
import { gather } from "./commands/gather/index.js"
import { _link, link } from "./commands/link/index.js"
import { workshop } from "./commands/workshop/index.js"
import { zip } from "./commands/zip/index.js"
import { readConfigFile } from "./lib/config.js"
import { Logger } from "./lib/logger.js"

async function execute() {
    let args = process.argv.slice(2)
    let dryRun = false
    let verbose = false

    if (args.includes("--dry-run")) {
        dryRun = true
        args = args.filter(a => a !== "--dry-run")
    }

    if (args.includes("--verbose")) {
        verbose = true
        args = args.filter(a => a !== "--verbose")
    }

    if (args.length === 1 && ![
        "--help",
        "--version"
    ].includes(args[0])) {
        if (![
            "gather", "workshop", "zip"
        ].includes(args[0])) {
            const config = await readConfigFile()
            const logger = new Logger(dryRun || config.dryRun, verbose || config.verbose)
            switch (args[0]) {
                case "dev":
                    await _dev(config, logger)
                    return
                case "release":
                    await _build(config, logger)
                    return
                case "link":
                    _link(config, logger)
                    return
                // case "zip":
                //     await _zip(config, logger)
                //     return
                default:
                    console.error(`Unknown command: ${args[0]}`)
                    process.exit(1)
            }
        }
    }

    const app = subcommands({
        name: "bustle",
        description: "A build tool for YOMI Hustle mods",
        version: pkg.version,
        cmds: {
            dev,
            release,
            link,
            gather,
            zip,
            workshop
        }
    })

    return run(app, process.argv.slice(2))
}

const main = async () => {
    try {
        bootstrap()
        await execute()
    }
    catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error)
        process.exit(1)
    }
    finally {
        process.exit(0)
    }
}

void main()
