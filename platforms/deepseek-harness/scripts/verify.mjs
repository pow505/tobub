import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { verifyPackage } from '../../codex/agent-skill/scripts/verify-package.mjs';
import { assertHarnessSchema, normalizeHarnessSchema } from '../plugin/schema.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export async function verifyDeepSeekArtifacts(output, sourceRoot = repositoryRoot) {
  const pluginRoot = join(output, 'plugin');
  const packageJson = JSON.parse(await readFile(join(pluginRoot, 'package.json'), 'utf8'));
  const lock = JSON.parse(await readFile(join(pluginRoot, 'skill/references/source-lock.json'), 'utf8'));
  const toolIndex = JSON.parse(await readFile(join(pluginRoot, 'runtime-tools.json'), 'utf8'));
  const bridge = join(pluginRoot, 'runtime-mcp.mjs');
  const archive = join(output, packageJson.name + '-' + packageJson.version + '.tgz');
  const marketPath = join(output, 'market/index.json');
  const outputNames = (await readdir(output)).sort();
  const expectedNames = ['market', 'plugin', packageJson.name + '-' + packageJson.version + '.tgz'].sort();
  assert(JSON.stringify(outputNames) === JSON.stringify(expectedNames), 'Build output contains missing or unexpected files');

  assert(packageJson.name === 'dsh-plugin-tobub' && packageJson.version === '0.1.0', 'Plugin package identity/version is invalid');
  assert(packageJson.main === 'index.mjs' && packageJson.type === 'module', 'Plugin entry point is invalid');
  assert(packageJson.dsh?.bundle?.patch === './cordis.patch.yml', 'Package does not declare a Harness bundle patch');
  assert(packageJson.engines?.dsh === '>=0.2.1-rc.2 <0.3.0', 'Harness compatibility range is missing or incorrect');
  assert(packageJson.dependencies?.['@modelcontextprotocol/sdk'] === '1.32.1', 'The MCP client dependency is not pinned');
  assert(packageJson.files?.includes('runtime-mcp.mjs') && packageJson.files.includes('runtime-tools.json')
    && packageJson.files.includes('skill'), 'npm package file allowlist is incomplete');

  const patch = await readFile(join(pluginRoot, 'cordis.patch.yml'), 'utf8');
  assert(patch.includes('id: tobub') && patch.includes('name: dsh-plugin-tobub'), 'Harness profile patch does not mount the Tobub bundle');
  const source = await readFile(join(pluginRoot, 'index.mjs'), 'utf8');
  assert(source.includes("inject = ['tools', 'skills']") && source.includes('export function apply(ctx)') && source.includes('ctx.tools.register')
    && source.includes('ctx.skills.register'), 'Plugin does not register both tools and the Tobub Skill');
  assert(source.includes('runtime-mcp.mjs') && source.includes('callTool'), 'Plugin does not forward tool calls through the local MCP bridge');

  assert(lock.runtime_version && toolIndex.runtime_version === lock.runtime_version, 'Skill and tool index Runtime versions do not match');
  assert(Array.isArray(toolIndex.tools) && toolIndex.tools.length > 0, 'Runtime tool index is empty');
  const names = toolIndex.tools.map((tool) => tool.name);
  assert(new Set(names).size === names.length, 'Runtime tool index contains duplicate tool names');
  for (const tool of toolIndex.tools) {
    assert(/^tobub_[a-z0-9_]+$/.test(tool.name) && typeof tool.description === 'string', 'Invalid Tobub tool identity or description');
    const schema = normalizeHarnessSchema(tool.inputSchema);
    assert(schema.type === 'object', 'Tobub tool must have object parameters: ' + tool.name);
    assertHarnessSchema(schema, tool.name);
  }

  const schemaProbe = normalizeHarnessSchema({
    type: 'object',
    properties: {
      id: { type: ['string'], pattern: '^[a-z]+$', minLength: 3, maxLength: 24, examples: ['tobub'], default: 'tobub' },
      timeout_ms: { type: 'integer', minimum: 1 },
      nullable: { type: ['string', 'null'] },
    },
  });
  assertHarnessSchema(schemaProbe, 'schema compatibility probe');
  assert(schemaProbe.properties.id.type === 'string', 'Single-value type arrays must retain their type');
  assert(schemaProbe.properties.id.examples?.[0] === 'tobub' && schemaProbe.properties.id.default === 'tobub',
    'Harness-supported schema examples and defaults must be preserved');
  assert(schemaProbe.properties.id.description.includes('pattern \"^[a-z]+$\"')
    && schemaProbe.properties.id.description.includes('minLength 3')
    && schemaProbe.properties.id.description.includes('maxLength 24')
    && schemaProbe.properties.timeout_ms.description.includes('minimum 1'),
    'Runtime constraints outside the Harness schema subset must remain visible to the model');
  assert(schemaProbe.properties.nullable.oneOf?.length === 2, 'Nullable type arrays must remain representable');

  assert((await readFile(bridge, 'utf8')).startsWith('#!/usr/bin/env node\n'), 'Bundled MCP bridge is missing its Node shebang');
  const listing = run(process.execPath, [bridge, '--list'], {
    timeout: 10000,
    env: { TOBUB_RUNTIME_URL: 'http://127.0.0.1:8510', TOBUB_RUNTIME_TOKEN: '', TOBUB_RUNTIME_TOKEN_FILE: '' },
  });
  const bridgeTools = JSON.parse(listing.stdout).map((tool) => tool.name).sort();
  assert(JSON.stringify(bridgeTools) === JSON.stringify([...names].sort()), 'MCP bridge tool list differs from the packaged Runtime tool index');
  run(process.execPath, ['--check', join(pluginRoot, 'index.mjs')]);
  run(process.execPath, ['--check', join(pluginRoot, 'schema.mjs')]);

  const skillSummary = await verifyPackage(join(pluginRoot, 'skill'), sourceRoot);
  const skill = await readFile(join(pluginRoot, 'skill/SKILL.md'), 'utf8');
  assert(/^---\nname: tobub\n/m.test(skill) && skill.includes('DeepSeek Harness') && skill.includes('tobub_* tools'),
    'Bundled Skill is not adapted for DeepSeek Harness');
  assert(!skill.includes('Codex Agent Skill') && !skill.includes('<this-skill>'),
    'Bundled Skill contains a host-specific or unresolved instruction');
  assert(skillSummary.runtime_version === lock.runtime_version, 'Skill verification reported a different Runtime version');

  const market = JSON.parse(await readFile(marketPath, 'utf8'));
  assert(market.format === 1 && Array.isArray(market.plugins) && market.plugins.length === 1, 'Custom plugin market index is invalid');
  const listingPlugin = market.plugins[0];
  assert(listingPlugin.name === packageJson.name && listingPlugin.versions?.length === 1, 'Market entry does not match the plugin package');
  const listingVersion = listingPlugin.versions[0];
  assert(listingVersion.version === packageJson.version && listingVersion.source?.type === 'npm'
    && listingVersion.engines?.dsh === packageJson.engines.dsh, 'Market install metadata does not match package metadata');
  assert(Number.isSafeInteger(listingVersion.publishTimestamp) && listingVersion.publishTimestamp > 0, 'Market publish timestamp is invalid');

  assert((await stat(archive)).size > 0, 'npm package archive is missing or empty');
  const tarPaths = run('tar', ['-tzf', archive]).stdout.split(/\r?\n/).filter(Boolean).sort();
  const expectedTarPaths = (await filesUnder(pluginRoot)).map((path) => 'package/' + relative(pluginRoot, path).split(sep).join('/')).sort();
  assert(JSON.stringify(tarPaths) === JSON.stringify(expectedTarPaths), 'npm package archive differs from the installable plugin directory');
  return { runtime_version: lock.runtime_version, tools: names.length, ...skillSummary, package_files: tarPaths.length, market_entries: market.plugins.length };
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, ...options });
  if (result.error) throw new Error('Could not run ' + command + ': ' + result.error.message);
  if (result.status !== 0) throw new Error(command + ' failed: ' + (result.stderr || result.stdout || '').trim());
  return result;
}

async function filesUnder(root) {
  const files = [];
  for (const item of await readdir(root, { withFileTypes: true })) {
    const path = join(root, item.name);
    if (item.isSymbolicLink()) throw new Error('Package must not contain symlinks: ' + path);
    if (item.isDirectory()) files.push(...await filesUnder(path));
    else if (item.isFile()) files.push(path);
  }
  return files;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { output: { type: 'string' } }, strict: true });
    if (values.output && !isAbsolute(values.output)) throw new Error('--output must be an absolute path');
    const output = values.output ? resolve(values.output) : join(repositoryRoot, 'platforms/deepseek-harness/dist');
    console.log(JSON.stringify(await verifyDeepSeekArtifacts(output, repositoryRoot), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
