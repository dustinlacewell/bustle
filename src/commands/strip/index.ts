import { command, option, string, flag } from 'cmd-ts';
import { stripMod } from './stripMod.js';

export const strip = command({
    name: 'strip',
    description: 'Strip type-annotations & class_name from GDScript files',
    args: {
        from: option({
            type: string,
            long: 'from',
            description: 'Source directory containing Godot files'
        }),
        to: option({
            type: string,
            long: 'to',
            description: 'Destination directory for processed files (C:\\my\\mod\\dist\\)'
        }),
        dryRun: flag({
            long: 'dry-run',
            description: 'Show what would be done without making changes'
        })
    },
    handler: async (args) => {
        try {
            await stripMod(args)
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error)
            process.exit(1)
        }
    }
});
