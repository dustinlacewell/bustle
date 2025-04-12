#!/usr/bin/env node
import { run, subcommands } from 'cmd-ts';
import pkg from '../package.json' with { type: 'json' };
import { strip } from './commands/strip/index.js';
import { zip } from './commands/zip/index.js';
import { build as release } from './commands/build/index.js';
import { dev } from './commands/dev/index.js';
import { readConfigFile } from './lib/config.js';
import { gather } from './commands/gather/index.js';


async function handleAlias(arg: string): Promise<string[]> {

  if (["--help", "--version"].includes(arg)) {
    return [arg]
  }

  try {
    const config = await readConfigFile("bustle.json")
    const command = config[arg];
    if (command) {      
      const args = []
      switch (command.name) {
        case 'release':
          args.push('release');
          if (command.args.from) {
            args.push('--from', command.args.from);
          }
          if (command.args.to) {
            args.push('--to', command.args.to);
          }
          if (command.args.project) {
            args.push('--project', command.args.project);
          }
          if (command.args.name) {
            args.push('--name', command.args.name);
          }
          if (command.args.dryRun) {
            args.push('--dry-run');
          }
          if (command.args.keep) {
            args.push('--keep');
          }
          if (command.args.tempDir) {
            args.push('--temp-dir', command.args.tempDir);
          }
          return args;
        case 'dev':
          args.push('dev');
          if (command.args.from) {
            args.push('--from', command.args.from);
          }
          if (command.args.to) {
            args.push('--to', command.args.to);
          }
          if (command.args.name) {
            args.push('--name', command.args.name);
          }
          if (command.args.dryRun) {
            args.push('--dry-run');
          }
          if (command.args.keep) {
            args.push('--keep');
          }
          if (command.args.tempDir) {
            args.push('--temp-dir', command.args.tempDir);
          }
          return args;
        case 'strip':
          args.push('strip');
          if (command.args.from) {
            args.push('--from', command.args.from);
          }
          if (command.args.to) {
            args.push('--to', command.args.to);
          }
          if (command.args.dryRun) {
            args.push('--dry-run');
          }
          return args;
        case 'zip':
          args.push('zip');
          if (command.args.from) {
            args.push('--from', command.args.from);
          }
          if (command.args.to) {
            args.push('--to', command.args.to);
          }
          if (command.args.name) {
            args.push('--name', command.args.name);
          }
          if (command.args.dryRun) {
            args.push('--dry-run');
          }
          return args
        default:
          console.error(`Unknown command in bustle.json: ${name}`);
          process.exit(1);
      }
    }
  } catch (error) {
    console.error('Error reading bustle.json:', error);
    process.exit(1);
  }

  return [arg];
}

async function main() {
  var args = process.argv.slice(2)

  if (args.length === 1) {
    args = await handleAlias(args[0])
  }

  const app = subcommands({
    name: 'bustle',
    description: 'A build tool for YOMI Hustle mods',
    version: pkg.version,
    cmds: {
      release,
      dev,
      gather,
      strip,
      zip
    }
  });

  run(app, args);

}

main()