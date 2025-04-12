import { copyModMain } from "@/lib/staging.js"
import { build, BuildPackageOptions } from "@/lib/build.js"
import path from "path"

export async function buildDevMod(options: BuildPackageOptions): Promise<void> {
    return build(options, (logger) => {
        return copyModMain(options.from, path.join(options.tempDir, options.name), logger)
    })
}