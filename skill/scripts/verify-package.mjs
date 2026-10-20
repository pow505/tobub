import { createHash } from 'node:crypto';
import { readFile, readdir, realpath } from 'node:fs/promises';
import { dirname, resolve, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { demoPath, readDemo } from './demo-resources.mjs';

export async function verifyPackage(root, repositoryRoot = dirname(root)) {
  const lock = JSON.parse(await readFile(join(root, 'references/source-lock.json'), 'utf8'));
  if (lock.schema_version !== 1 || !Array.isArray(lock.resources) || !lock.resources.length) throw new Error('Invalid package resource lock');
  const seen = new Set();
  for (const resource of lock.resources) {
    const path = resource.path;
    if (typeof path !== 'string' || isAbsolute(path) || path.includes('\\') || path.split('/').some((part) => !part || part === '.' || part === '..') || seen.has(path)
      || !/^[a-f0-9]{64}$/.test(resource.sha256)) throw new Error('Invalid package resource path/hash');
    seen.add(path);
    const bytes = await readFile(join(root, path));
    if (createHash('sha256').update(bytes).digest('hex') !== resource.sha256) throw new Error(`Package resource was changed: ${path}`);
  }
  const actual = await pathsUnder(root);
  const extras = actual.filter((path) => path !== 'references/source-lock.json' && !seen.has(path));
  if (extras.length) throw new Error(`Untracked package resources: ${extras.join(', ')}`);
  for (const path of ['SKILL.md', 'INSTALL.md', 'scripts/runtime-mcp.mjs', 'references/capability-catalog.json', 'references/demos-index.json']) {
    if (!seen.has(path)) throw new Error(`Missing required package resource: ${path}`);
  }
  const skill = await readFile(join(root, 'SKILL.md'), 'utf8');
  if (!/^---\r?\nname: tobub\r?\ndescription: [^\r\n]+\r?\n---\r?\n/.test(skill)) throw new Error('Invalid Tobub Skill frontmatter');
  for (const match of skill.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1];
    if (/^[a-z]+:/i.test(target)) continue;
    if (isAbsolute(target) || target.includes('..') || (!seen.has(target) && target !== 'references/source-lock.json')) throw new Error(`Broken/nonportable Skill reference: ${target}`);
  }
  const catalog = JSON.parse(await readFile(join(root, 'references/capability-catalog.json'), 'utf8'));
  if (catalog.runtime_version !== lock.runtime_version || catalog.items.length !== lock.capability_count || new Set(catalog.items.map((item) => item.id)).size !== catalog.items.length) throw new Error('Capability catalog version/count/identifiers do not match the package');
  const demos = JSON.parse(await readFile(join(root, 'references/demos-index.json'), 'utf8'));
  if (demos.examples.length !== lock.demo_count) throw new Error('Demo index count does not match the package');
  const hashes = new Map(lock.resources.map((resource) => [resource.path, resource.sha256]));
  const demoFiles = new Set();
  for (const demo of demos.examples) {
    const path = demoPath(demos, demo);
    if (demoFiles.has(path) || (demos.layout === 'bundled' && hashes.get(path) !== demo.sha256)) throw new Error('Demo provenance/integrity does not match the package');
    demoFiles.add(path);
    await readDemo(root, demos, demo, repositoryRoot);
  }
  if (demos.layout === 'repository' && actual.some((path) => path.startsWith('examples/'))) throw new Error('Repository Skill must reference demos without copying them');
  const tools = JSON.parse(await readFile(join(root, 'references/runtime-tools.json'), 'utf8')).tools;
  if (!tools.length || new Set(tools.map((tool) => tool.name)).size !== tools.length) throw new Error('Invalid Runtime tool index');
  return { runtime_version: lock.runtime_version, resources: lock.resources.length, capabilities: lock.capability_count, demos: lock.demo_count };
}

async function pathsUnder(root, prefix = '') {
  const paths = [];
  for (const item of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isSymbolicLink()) throw new Error(`Package must not contain symlinks: ${path}`);
    if (item.isDirectory()) paths.push(...await pathsUnder(root, path));
    else if (item.isFile()) paths.push(path);
    else throw new Error(`Unsupported package resource: ${path}`);
  }
  return paths;
}

if (process.argv[1] && process.argv[1] !== '-' && await realpath(process.argv[1]) === await realpath(fileURLToPath(import.meta.url))) {
  try {
    const { values } = parseArgs({ options: { repository: { type: 'string' } }, strict: true });
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    console.log(JSON.stringify(await verifyPackage(root, values.repository ? resolve(values.repository) : dirname(root))));
  }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
