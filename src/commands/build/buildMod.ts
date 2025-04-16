import { copyMetadata, copyModMain } from "@/lib/staging.js"
import { stripMod } from "../strip/stripMod.js"
import { build, BuildPackageOptions } from "@/lib/build.js"
import path from "path"
import { gather_imports } from "../gather/gatherImports.js"

export type BuildOptions = {
    project: string
    importsIn: string
} & BuildPackageOptions

export async function buildMod(options: BuildOptions): Promise<void> {
    return build(options, async (logger) => {
        await stripMod({
            from: options.from,
            to: path.join(options.tempDir, options.name),
            dryRun: options.dryRun
        })
        if (options.project != "") {
            await gather_imports({
                from: options.from,
                to: options.tempDir,
                in: options.importsIn,
                project: options.project,
                dryRun: options.dryRun
            })
        }
    })
}