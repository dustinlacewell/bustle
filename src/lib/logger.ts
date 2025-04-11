export 

// Logger
class Logger {
    constructor(public dryRun: boolean = false) {}

    info(message: string): void {
        console.log(`[INFO] ${message}`)
    }

    fileStart(filePath: string): void {
        console.log(`\n[FILE] ${filePath}`)
    }

    classNameStripped(className: string): void {
        console.log(`  Stripped class_name: ${className}`)
    }

    annotationStripped(original: string, modified: string): void {
        console.log(`  Stripped annotation:`)
        console.log(`    Before: ${original.trim()}`)
        console.log(`    After:  ${modified.trim()}`)
    }

    classUsagesFound(classes: string[]): void {
        if (classes.length > 0) {
            console.log(`  Injecting imports for: ${classes.join(', ')}`)
        }
    }

    action(message: string): void {
        console.log(`[${this.dryRun ? 'WOULD ' : ''}ACTION] ${message}`)
    }

    error(message: string): void {
        console.error(`[ERROR] ${message}`)
    }

    extendsTransformed(original: string, modified: string): void {
        console.log(`  Transformed extends:`)
        console.log(`    Before: ${original}`)
        console.log(`    After:  ${modified}`)
    }

    nameMangled(original: string, mangled: string): void {
        console.log(`  Mangled class name: ${original} -> ${mangled}`)
    }
}