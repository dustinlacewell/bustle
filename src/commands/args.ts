import { array, flag, multioption, option, string } from "cmd-ts"

export const modName = option({
    type: string,
    long: "mod-name",
    description: "The name of your mod"
})

export const modDir = option({
    type: string,
    long: "mod-dir",
    description: "Directory containing your mod files"
})

export const godotDir = option({
    type: string,
    long: "godot-dir",
    description: "Your Godot project directory"
})

export const buildDir = option({
    type: string,
    long: "build-dir",
    description: "Where to perform the build",
    defaultValue: () => "dist"
})

export const putReleaseIn = option({
    type: string,
    long: "put-release-in",
    description: "Where to put the release zip file",
    defaultValue: () => "."
})

export const putDevIn = option({
    type: string,
    long: "put-dev-in",
    description: "Where to put the development zip file",
    defaultValue: () => "."
})

export const gatherDir = option({
    type: string,
    long: "gather-dir",
    description: "Relative directory to put imports in",
    defaultValue: () => ".import"
})

export const optimized = flag({
    long: "optimized",
    description: `Don't include imported resources in the zip file`
})

export const strip = flag({
    long: "strip",
    description: "Whether to strip your class names from GDScript files"
})

export const include = multioption({
    type: array(string),
    long: "include",
    description: "Import resources to include in optimized builds",
    defaultValue: () => []
})

export const dryRun = flag({
    long: "dry-run",
    description: "Show what would be done without making changes"
})

export const verbose = flag({
    long: "verbose",
    description: "Show verbose debugging output"
})

export const cleanup = flag({
    long: "cleanup",
    description: "Delete the build directory after build"
})
