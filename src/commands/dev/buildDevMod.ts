import { copyModMain } from "@/lib/staging.js"
import { build, BuildPackageOptions } from "@/lib/build.js"

export async function buildDevMod(options: BuildPackageOptions): Promise<void> {
    return build(options, (logger, tempDir) => {
        return copyModMain(options.from, tempDir, logger)
    })
}