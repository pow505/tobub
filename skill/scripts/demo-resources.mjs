import { readFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';

export function demoPath(index, demo) {
  const source = demo.source_path;
  if (typeof source !== 'string' || !source.startsWith('demos/') || source.includes('\\') || source.split('/').some((part) => !part || part === '.' || part === '..') || !source.endsWith('.skill.json')) throw new Error('Invalid demo source path');
  const expected = index.layout === 'repository' ? `../${source}` : index.layout === 'bundled' ? `examples/${source.slice('demos/'.length)}` : undefined;
  if (!expected || demo.file !== expected || !/^[a-f0-9]{64}$/.test(demo.sha256)) throw new Error('Invalid demo layout/path/hash');
  return expected;
}

export async function readDemo(root, index, demo, repositoryRoot = dirname(root)) {
  const path = demoPath(index, demo);
  const base = await realpath(index.layout === 'repository' ? repositoryRoot : root);
  const expected = resolve(base, index.layout === 'repository' ? demo.source_path : path);
  // Reject aliases as well as file symlinks: an indexed demo must be the actual repository/bundle resource.
  if (await realpath(expected) !== expected) throw new Error(`Demo must not use symlinks: ${demo.source_path}`);
  const bytes = await readFile(expected);
  if (createHash('sha256').update(bytes).digest('hex') !== demo.sha256) throw new Error(`Demo resource was changed: ${demo.source_path}`);
  return bytes;
}
