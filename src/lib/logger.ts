import chalk from "chalk"

export class Logger {
    constructor(public dryRun: boolean = false, public verbose: boolean = false) {}

    public info(message: string): void {
        console.log(`${chalk.blue("[INFO]")} ${message}`)
    }

    public extra(message: string): void {
        if (this.verbose) {
            console.log(`${chalk.magenta("[VERBOSE]")} ${message}`)
        }
    }

    public action(message: string): void {
        const label: string = this.dryRun
            ? chalk.yellow("[WOULD ACTION]")
            : chalk.green("[ACTION]")
        console.log(`${label} ${message}`)
    }

    public error(message: string): void {
        console.error(`${chalk.red("[ERROR]")} ${message}`)
    }
}
