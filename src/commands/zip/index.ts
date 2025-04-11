import { command, option, string, flag } from 'cmd-ts';
import { createModZip } from './createModZip.js';

export const zip = command({
    name: 'zip',
    description: 'Create a mod zip file',
    args: {
        from: option({
            type: string,
            long: 'from',
            description: 'Root directory containing mod files'
        }),
        to: option({
            type: string,
            long: 'to',
            description: 'Destination path of mod zip file (C:\\my\\mod.zip)',
        }),
        dryRun: flag({
            long: 'dry-run',
            description: 'Show what would be done without making changes'
        })
    },
    handler: async (args) => {
        try {
            await createModZip(args)
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
});