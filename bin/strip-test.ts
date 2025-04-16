import { stripTypes } from '../src/lib/stripping/transform/gdTypeStripper';
import { replaceTokens } from '../src/lib/stripping/transform/replaceTokens';
import * as fs from 'fs';
import * as path from 'path';

// Usage: node param-types-gdstrip.ts <input> <output>
const inputPath = process.argv[2] || path.join(process.cwd(), 'bin', 'param-examples.in');
const outputPath = process.argv[3] || path.join(process.cwd(), 'bin', 'param-examples.out');

// You may want to keep this list in sync with your Godot project
const classNames = ['Baz', 'Bar'];

const input = fs.readFileSync(inputPath, 'utf-8');
const output = replaceTokens(stripTypes(input, [...classNames, "Foo"]), {
    Foo: 'FooFEIJW'
});

fs.writeFileSync(outputPath, output);
console.log(`Wrote stripped params to ${outputPath}`);
