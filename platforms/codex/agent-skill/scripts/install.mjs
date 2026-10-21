import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve, join, isAbsolute, relative } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { bundleAgentSkill } from './bundle-package.mjs';
import { formatRegistrationCommand } from './registration-command.mjs';

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let created;
try {
  const { values } = parseArgs({ options: { host: { type: 'string' }, destination: { type: 'string' }, repository: { type: 'string' } }, strict: true });
  if (!['claude', 'codex'].includes(values.host)) throw new Error('--host must be claude or codex');
  if (values.destination && !isAbsolute(values.destination)) throw new Error('--destination must be absolute');
  if (values.repository && !isAbsolute(values.repository)) throw new Error('--repository must be absolute');
  const target = values.destination ?? join(homedir(), values.host === 'codex' ? '.agents' : '.claude', 'skills', 'tobub');
  if (source === target || isWithin(source, target) || isWithin(target, source)) throw new Error('Installation source and destination must not contain one another');
  await mkdir(dirname(target), { recursive: true });
  await mkdir(target); // Exclusive ownership: fail if it already exists.
  created = target;
  const version = await bundleAgentSkill(source, target, values.repository ? resolve(values.repository) : undefined);
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
