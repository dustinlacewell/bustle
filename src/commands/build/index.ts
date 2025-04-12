import { command, option, string, flag } from 'cmd-ts';
import { buildMod } from "./buildMod.js";


export const build = command({
    name: 'release',
    description: `Build, strip and package a mod zip for release`,
    args: {
        from: option({
            type: string,
            long: 'from',
            description: 'Source directory containing mod files'
        }),
        to: option({
            type: string,
            long: 'to',
            description: 'Destination path for the mod zip file (C:\\my\\mod.zip)'
        }),
        name: option({
            type: string,
            long: 'name',
            description: 'Name of mod folder'
        }),
        project: option({
            type: string,
            long: 'project',
            description: 'Path to Godot project, enables resource import gathering',
            defaultValue: () => ""
        }),
        dryRun: flag({
            long: 'dry-run',
            description: 'Show what would be done without making changes'
        }),
        keep: flag({
            long: 'keep',
            description: 'Keep the temporary directory after build'
        }),
        tempDir: option({
            type: string,
            long: 'temp-dir',
            description: 'Temporary directory for build process',
            defaultValue: () => 'dist'
        })
    },
    handler: async (args) => {
        try {
            await buildMod(args)
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
});