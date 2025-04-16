import { linkMod as linkModLinux } from "@/lib/links/linux.js"
import { linkMod as linkModWindows } from "@/lib/links/windows.js"

import { Logger } from "../logger.js"

export const linkMod = (modName: string, modDir: string, godotDir: string, logger: Logger): void => {
    if (process.platform === "win32") {
        linkModWindows(modName, modDir, godotDir, logger)
    }
    else {
        linkModLinux(modName, modDir, godotDir, logger)
    }
}
