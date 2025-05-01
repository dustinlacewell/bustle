import fs from "node:fs"
import path from "node:path"
// At runtime, get the virtual file data and write it to physical storage for the OS to access.
function writeToStorage(virtualFilePath: string) {
    const realInstallDir = path.join(process.cwd())

    if (!fs.existsSync(realInstallDir)) {
        fs.mkdirSync(realInstallDir)
    }

    const filename = path.basename(virtualFilePath)
    const realInstallPath = path.join(realInstallDir, filename)

    if (!fs.existsSync(realInstallPath)) {
        console.log("Writing to storage:", virtualFilePath)
        const data = fs.readFileSync(virtualFilePath)
        fs.writeFileSync(realInstallPath, data)
    }

    return realInstallPath
}

export const bootstrap = () => {
    writeToStorage(path.join(__dirname, "../dist/steamworks/win64/steam_api64.dll"))
}
