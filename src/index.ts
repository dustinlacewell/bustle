#!/usr/bin/env node
import { run, subcommands } from 'cmd-ts';
import pkg from '../package.json' with { type: 'json' };
import { strip } from './commands/strip/index.js';
import { zip } from './commands/zip/index.js';
import { build as release } from './commands/build/index.js';
import { dev } from './commands/dev/index.js';
import { CommandConfig, readConfigFile } from './lib/config.js';
import { buildMod } from './commands/build/buildMod.js';


async function handleAlias() {
  const arg = process.argv[2];

  if (["--help", "--version"].includes(arg)) {
    return
  }

  try {
    const config = await readConfigFile("bustle.json")
    const command = config[arg];
    if (command) {
      process.argv = [process.argv[0], process.argv[1]]
      switch (command.name) {
        case 'release':
          process.argv = []
          process.argv.push('release');
          if (command.args.from) {
            process.argv.push('--from', command.args.from);
          }
          if (command.args.to) {
            process.argv.push('--to', command.args.to);
          }
          if (command.args.name) {
            process.argv.push('--name', command.args.name);
          }
          if (command.args.dryRun) {
            process.argv.push('--dry-run');
          }
          if (command.args.keep) {
            process.argv.push('--keep');
          }
          if (command.args.tempDir) {
            process.argv.push('--temp-dir', command.args.tempDir);
          }
          break;
        case 'dev':
          process.argv = []
          process.argv.push('dev');
          if (command.args.from) {
            process.argv.push('--from', command.args.from);
          }
          if (command.args.to) {
            process.argv.push('--to', command.args.to);
          }
          if (command.args.name) {
            process.argv.push('--name', command.args.name);
          }
          if (command.args.dryRun) {
            process.argv.push('--dry-run');
          }
          if (command.args.keep) {
            process.argv.push('--keep');
          }
          if (command.args.tempDir) {
            process.argv.push('--temp-dir', command.args.tempDir);
          }
          break;
        case 'strip':
          process.argv = []
          process.argv.push('strip');
          if (command.args.from) {
            process.argv.push('--from', command.args.from);
          }
          if (command.args.to) {
            process.argv.push('--to', command.args.to);
          }
          if (command.args.dryRun) {
            process.argv.push('--dry-run');
          }
          break;
        case 'zip':
          process.argv = []
          process.argv.push('zip');
          if (command.args.from) {
            process.argv.push('--from', command.args.from);
          }
          if (command.args.to) {
            process.argv.push('--to', command.args.to);
          }
          if (command.args.name) {
            process.argv.push('--name', command.args.name);
          }
          if (command.args.dryRun) {
            process.argv.push('--dry-run');
          }
          break
        default:
          console.error(`Unknown command in bustle.json: ${name}`);
          process.exit(1);
      }
    }
  } catch (error) {
    console.error('Error reading bustle.json:', error);
    process.exit(1);
  }
}

async function main() {
  if (process.argv.length === 3) {
    await handleAlias()
  }

  const app = subcommands({
    name: 'bustle',
    description: 'A build tool for YOMI Hustle mods',
    version: pkg.version,
    cmds: {
      release,
      dev,
      strip,
      zip
    }
  });

  run(app, process.argv);

}

main()