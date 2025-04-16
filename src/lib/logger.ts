export class Logger {
    constructor(public dryRun: boolean = false, public verbose: boolean = false) {}

    info(message: string): void {
        console.log(`[INFO] ${message}`)
    }

    extra(message: string): void {
        if (this.verbose) {
            console.log(`[VERBOSE] ${message}`)
        }
    }

    action(message: string): void {
        console.log(`[${this.dryRun ? "WOULD " : ""}ACTION] ${message}`)
    }

    error(message: string): void {
        console.error(`[ERROR] ${message}`)
    }
}
