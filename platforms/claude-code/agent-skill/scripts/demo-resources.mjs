import { readFile, realpath, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';

export function demoPath(index, demo) {
  const source = demo.source_path;
  if (typeof source !== 'string' || !source.startsWith('demos/') || source.includes('\\') || source.split('/').some((part) => !part || part === '.' || part === '..') || !source.endsWith('.skill.json')) throw new Error('Invalid demo source path');
  let expected;
  if (index.layout === 'repository') {
    expected = demo.file;
    if (typeof expected !== 'string' || expected.startsWith('/') || expected.includes('\\')
      || expected.split('/').some((part) => !part || part === '.')) throw new Error('Invalid repository demo path');
    if (!expected.endsWith(source)) throw new Error('Invalid repository demo path');
  } else if (index.layout === 'bundled') expected = `examples/${source.slice('demos/'.length)}`;
  else if (index.layout === 'workbuddy') expected = `references/examples/${source.slice('demos/'.length)}`;
  if (!expected || demo.file !== expected || !/^[a-f0-9]{64}$/.test(demo.sha256)) throw new Error('Invalid demo layout/path/hash');
  return expected;
}

export async function findRepositoryRoot(start) {
  let current = resolve(start);
  while (true) {
    try {
      if ((await stat(resolve(current, 'demos'))).isDirectory()) return current;
    } catch { /* keep walking toward the repository root */ }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`Cannot locate repository demos directory above ${start}`);
}

export async function readDemo(root, index, demo, repositoryRoot, pathRoot = root) {
  const path = demoPath(index, demo);
  const base = await realpath(index.layout === 'repository' ? repositoryRoot ?? await findRepositoryRoot(root) : root);
  const expected = resolve(base, index.layout === 'repository' ? demo.source_path : path);
  if (index.layout === 'repository' && resolve(await realpath(pathRoot), path) !== expected) throw new Error(`Demo path does not resolve to its repository source: ${demo.source_path}`);
  // Reject aliases as well as file symlinks: an indexed demo must be the actual repository/bundle resource.
  if (await realpath(expected) !== expected) throw new Error(`Demo must not use symlinks: ${demo.source_path}`);
  const bytes = await readFile(expected);
  if (createHash('sha256').update(bytes).digest('hex') !== demo.sha256) throw new Error(`Demo resource was changed: ${demo.source_path}`);
  return bytes;
}
