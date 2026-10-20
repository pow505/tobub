import { mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, join, isAbsolute, relative } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createHash } from 'node:crypto';
import { readDemo } from './demo-resources.mjs';
import { verifyPackage } from './verify-package.mjs';
import { formatRegistrationCommand } from './registration-command.mjs';

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let created;
try {
  const { values } = parseArgs({ options: { host: { type: 'string' }, destination: { type: 'string' } }, strict: true });
  if (!['claude', 'codex'].includes(values.host)) throw new Error('--host must be claude or codex');
  if (values.destination && !isAbsolute(values.destination)) throw new Error('--destination must be absolute');
  const target = values.destination ?? join(homedir(), values.host === 'codex' ? '.agents' : '.claude', 'skills', 'tobub');
  if (source === target || isWithin(source, target) || isWithin(target, source)) throw new Error('Installation source and destination must not contain one another');
  await verifyPackage(source);
  await mkdir(dirname(target), { recursive: true });
  await mkdir(target); // Exclusive ownership: fail if it already exists.
  created = target;
  await cp(source, target, { recursive: true, force: false, errorOnExist: true });
  const indexPath = join(target, 'references/demos-index.json');
  const index = JSON.parse(await readFile(indexPath, 'utf8'));
  if (index.layout === 'repository') {
    const lockPath = join(target, 'references/source-lock.json');
    const lock = JSON.parse(await readFile(lockPath, 'utf8'));
    for (const demo of index.examples) {
      const bytes = await readDemo(source, index, demo);
      demo.file = `examples/${demo.source_path.slice('demos/'.length)}`;
      await mkdir(dirname(join(target, demo.file)), { recursive: true });
      await writeFile(join(target, demo.file), bytes, { flag: 'wx' });
      lock.resources.push({ path: demo.file, sha256: demo.sha256 });
    }
    index.layout = 'bundled';
    const text = `${JSON.stringify(index, null, 2)}\n`;
    await writeFile(indexPath, text);
    lock.resources.find((resource) => resource.path === 'references/demos-index.json').sha256 = createHash('sha256').update(text).digest('hex');
    lock.resources.sort((a, b) => a.path.localeCompare(b.path, 'en'));
    await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  }
  const version = await verifyPackage(target);
  created = undefined;
  const launcher = join(target, 'scripts/runtime-mcp.mjs');
  const args = values.host === 'codex' ? ['codex', 'mcp', 'add', 'tobub', '--', process.execPath, launcher]
    : ['claude', 'mcp', 'add', '--transport', 'stdio', 'tobub', '--', process.execPath, launcher];
  console.log(JSON.stringify({ installed: target, ...version, ...formatRegistrationCommand(args), credential_setup: 'Read INSTALL.md before configuring a Runtime token; this installer does not edit host configuration.' }, null, 2));
} catch (error) {
  if (created) await rm(created, { recursive: true, force: true });
  console.error(error.code === 'EEXIST' ? 'Destination already exists; inspect it before replacing the existing installation.' : error.message);
  process.exitCode = 1;
}

function isWithin(parent, child) { const path = relative(parent, child); return path !== '' && !path.startsWith('..') && !isAbsolute(path); }
