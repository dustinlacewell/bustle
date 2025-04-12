export 

// Logger
class Logger {
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
        console.log(`[${this.dryRun ? 'WOULD ' : ''}ACTION] ${message}`)
    }

    error(message: string): void {
        console.error(`[ERROR] ${message}`)
    }

    nameMangled(original: string, mangled: string): void {
        this.extra(`  Mangled class name: ${original} -> ${mangled}`)
    }

    fileStart(filePath: string): void {
        this.extra(`\n[FILE] ${filePath}`)
    }

    classNameStripped(className: string): void {
        this.extra(`  Stripped class_name: ${className}`)
    }

    annotationStripped(original: string, modified: string): void {
        this.extra(`  Stripped annotation:`)
        this.extra(`    Before: ${original.trim()}`)
        this.extra(`    After:  ${modified.trim()}`)
    }

    classUsagesFound(classes: string[]): void {
        if (classes.length > 0) {
            this.extra(`  Injecting imports for: ${classes.join(', ')}`)
        }
    }

    extendsTransformed(original: string, modified: string): void {
        this.extra(`  Transformed extends:`)
        this.extra(`    Before: ${original}`)
        this.extra(`    After:  ${modified}`)
    }
}