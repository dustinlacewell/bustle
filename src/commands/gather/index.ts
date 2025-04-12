import { command, option, string, flag } from 'cmd-ts';
import { gather_imports } from './gatherImports.js';

export const gather = command({
    name: 'gather',
    description: 'Gather any resource import files',
    args: {
        mod: option({
            type: string,
            long: 'mod',
            description: 'Your mod directory'
        }),
        to: option({
            type: string,
            long: 'to',
            description: 'Where to copy resources to'
        }),
        project: option({
            type: string,
            long: 'project',
            description: 'The Godot directory'
        }),
        dryRun: flag({
            long: 'dry-run',
            description: 'Show what would be done without making changes'
        })
    },
    handler: async (args) => {
        try {
            await gather_imports(args)
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
});
