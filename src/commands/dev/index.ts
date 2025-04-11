import { command, option, string, flag } from 'cmd-ts';
import { buildDevMod } from './buildDevMod.js';

export const dev = command({
    name: 'dev',
    description: `Build a development zip`,
    args: {
        from: option({
            type: string,
            long: 'from',
            description: 'Where your mod files are'
        }),
        to: option({
            type: string,
            long: 'to',
            description: 'Where to put the zip file'
        }),
        name: option({
            type: string,
            long: 'name',
            description: 'Name of mod folder'
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
            await buildDevMod(args)
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
});