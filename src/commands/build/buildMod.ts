import { copyMetadata, copyModMain } from "@/lib/staging.js"
import { stripMod } from "../strip/stripMod.js"
import { build, BuildPackageOptions } from "@/lib/build.js"

export async function buildMod(options: BuildPackageOptions): Promise<void> {
    return build(options, async (logger, tempDir) => {
        await stripMod({
            from: options.from,
            to: tempDir,
            dryRun: options.dryRun
        })
    })
}