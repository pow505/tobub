import { mkdtemp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { verifyPackage } from '../../codex/agent-skill/scripts/verify-package.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export async function verifyWorkbuddyArtifacts(output, sourceRoot = repositoryRoot) {
  const connectorRoot = join(output, 'connector');
  const packageRoot = join(output, 'mcp-package');
  const meta = JSON.parse(await readFile(join(connectorRoot, 'connector-meta.json'), 'utf8'));
  const config = JSON.parse(await readFile(join(connectorRoot, 'mcp.json'), 'utf8'));
  const token = JSON.parse(await readFile(join(connectorRoot, 'token-schema.json'), 'utf8'));
  const packageJson = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
  const runtimeVersion = JSON.parse(await readFile(join(connectorRoot, 'skills/tobub/references/source-lock.json'), 'utf8')).runtime_version;
  const outputNames = (await readdir(output)).sort();
  const expectedOutputNames = ['connector', 'connector.zip', 'mcp-package', `tobub-mcp-${runtimeVersion}.tgz`].sort();
  assert(JSON.stringify(outputNames) === JSON.stringify(expectedOutputNames), 'Build output contains missing or unexpected files');

  assert(meta.source === 'pow505-tobub' && meta.type === 'mcp' && meta.auth_mode === 'token', 'Connector identity/type/auth mode is invalid');
  assert(meta.minWorkbuddyVersion === '5.0.0', 'Connector must declare the minimum WorkBuddy version for managed Node runtime fields');
  assert(semver(meta.version) && meta.examples_zh?.length >= 2 && meta.examples_en?.length >= 2, 'Connector metadata version/examples are incomplete');
  assert(typeof meta.description_zh === 'string' && typeof meta.description_en === 'string', 'Connector descriptions must be localized');
  assert(Object.keys(config.mcpServers ?? {}).length === 1, 'WorkBuddy Connector must configure exactly one MCP server');
  const server = config.mcpServers.tobub;
  assert(server?.type === 'stdio' && server.command === 'npx', 'Connector must launch the published package through stdio');
  assert(server.args?.[0] === '--yes' && server.args?.[1] === `tobub-mcp@${runtimeVersion}`, 'Connector npm package pin must match the bundled Runtime version');
  assert(server.runtime?.type === 'node' && server.runtime.version === '22', 'Connector must request managed Node.js 22');
  assert(server.timeout === 30000, 'Unexpected MCP timeout');
  assert(packageJson.name === 'tobub-mcp' && packageJson.version === runtimeVersion, 'npm package version does not match the bundled Runtime');
  assert(packageJson.bin?.['tobub-mcp'] === './runtime-mcp.mjs' && packageJson.engines?.node === '>=22.18.0', 'npm executable or Node engine declaration is invalid');
  assert(packageJson.files?.includes('THIRD-PARTY-NOTICES.json'), 'npm package must include third-party license notices');
  assert(!packageJson.dependencies && !packageJson.devDependencies, 'MCP package should use the self-contained bridge without runtime dependencies');

  const fields = new Map((token.fields ?? []).map((field) => [field.key, field]));
  assert(fields.get('TOBUB_RUNTIME_URL')?.type === 'text' && fields.get('TOBUB_RUNTIME_URL')?.required === true
    && fields.get('TOBUB_RUNTIME_URL')?.defaultValue === 'http://127.0.0.1:8510', 'Runtime URL form is invalid');
  assert(fields.get('TOBUB_RUNTIME_TOKEN')?.type === 'password' && fields.get('TOBUB_RUNTIME_TOKEN')?.required === false, 'Runtime token must be an optional password field');
  for (const key of ['TOBUB_RUNTIME_URL', 'TOBUB_RUNTIME_TOKEN']) {
    assert(server.env?.[key] === `\u0024{${key}}` && fields.has(key), `WorkBuddy environment placeholder does not match token-schema: ${key}`);
  }
  const icon = await readFile(join(connectorRoot, 'icon.svg'), 'utf8');
  assert(icon.includes('<svg') && !/<!DOCTYPE|<script\b|(?:href|xlink:href)\s*=\s*["']https?:/i.test(icon), 'Connector icon is invalid or contains external content');

  const skillRoot = join(connectorRoot, 'skills/tobub');
  const skillSummary = await verifyPackage(skillRoot, sourceRoot);
  const skillText = await readFile(join(skillRoot, 'SKILL.md'), 'utf8');
  assert(/^---\nname: tobub\n[\s\S]*?^version: \d+\.\d+\.\d+\n/m.test(skillText), 'WorkBuddy Skill frontmatter is incomplete');
  assert(skillText.includes('@references/workbuddy-setup.md') && skillText.includes('@references/runtime-api.md'), 'WorkBuddy Skill is missing required resource references');
  assert(!skillText.includes('<this-skill>') && !skillText.includes('node scripts/search-capability.mjs'), 'WorkBuddy Skill contains an unresolved local script path');
  const referencedFiles = [...skillText.matchAll(/@((?:references|examples)\/[^\s`),]+)/g)].map((match) => match[1]);
  for (let path of referencedFiles) {
    let absolute = resolve(skillRoot, path);
    assert(isWithin(skillRoot, absolute), `Skill resource escapes package: ${path}`);
    while (true) {
      try { await stat(absolute); break; }
      catch (error) {
        if (error.code !== 'ENOENT' || !/[.,;:!?]$/.test(path)) throw new Error(`WorkBuddy Skill references a missing file: ${path}`);
        path = path.slice(0, -1);
        absolute = resolve(skillRoot, path);
      }
    }
  }
  const demoIndex = JSON.parse(await readFile(join(skillRoot, 'references/demos-index.json'), 'utf8'));
  assert(demoIndex.layout === 'workbuddy' && demoIndex.examples.every((demo) => demo.file.startsWith('references/examples/')), 'WorkBuddy demos must use documented Skill reference resources');
  const toolIndex = JSON.parse(await readFile(join(skillRoot, 'references/runtime-tools.json'), 'utf8')).tools;
  const expectedNames = toolIndex.map((tool) => tool.name);
  const executable = join(packageRoot, 'runtime-mcp.mjs');
  const canonicalNotices = await readFile(join(sourceRoot, 'platforms/codex/agent-skill/references/third-party-licenses.json'));
  const packageNotices = await readFile(join(packageRoot, 'THIRD-PARTY-NOTICES.json'));
  assert(packageNotices.equals(canonicalNotices), 'npm package third-party notices differ from bundled bridge dependency notices');
  assert((await readFile(executable, 'utf8')).startsWith('#!/usr/bin/env node\n'), 'npm executable is missing its Node shebang');
  await verifyBridgeConfiguration(executable, expectedNames);

  const tarball = join(output, `tobub-mcp-${runtimeVersion}.tgz`);
  assert((await stat(tarball)).size > 0, 'npm package tarball is missing or empty');
  const archive = join(output, 'connector.zip');
  assert((await stat(archive)).size > 0, 'WorkBuddy Connector ZIP is missing or empty');
  const zipListing = run('unzip', ['-Z1', archive]).stdout.split(/\r?\n/).filter(Boolean);
  for (const path of ['connector-meta.json', 'mcp.json', 'token-schema.json', 'icon.svg', 'skills/tobub/SKILL.md']) {
    assert(zipListing.includes(path), `Connector ZIP is missing ${path}`);
  }
  assert(!zipListing.some((path) => path.startsWith('connector/')), 'Connector ZIP must put its required files at the archive root');

  const verificationRoot = await mkdtemp(join(tmpdir(), 'tobub-workbuddy-verify-'));
  try {
    const unpackedNpm = join(verificationRoot, 'npm');
    const unpackedConnector = join(verificationRoot, 'connector');
    await mkdir(unpackedNpm);
    await mkdir(unpackedConnector);
    const tarListing = run('tar', ['-tzf', tarball]).stdout.split(/\r?\n/).filter(Boolean).sort();
    const expectedTarFiles = ['package/LICENSE', 'package/README.md', 'package/THIRD-PARTY-NOTICES.json', 'package/package.json', 'package/runtime-mcp.mjs'].sort();
    assert(JSON.stringify(tarListing) === JSON.stringify(expectedTarFiles), 'npm tarball contains missing or unexpected files');
    for (const path of expectedTarFiles) {
      assert(tarListing.includes(path), `npm tarball is missing ${path}`);
    }
    run('tar', ['-xzf', tarball, '-C', unpackedNpm]);
    const packedRoot = join(unpackedNpm, 'package');
    const packedManifest = JSON.parse(await readFile(join(packedRoot, 'package.json'), 'utf8'));
    assert(packedManifest.name === packageJson.name && packedManifest.version === packageJson.version, 'npm tarball manifest differs from the built package');
    const packedBridge = join(packedRoot, 'runtime-mcp.mjs');
    assert((await readFile(join(packedRoot, 'THIRD-PARTY-NOTICES.json'))).equals(canonicalNotices), 'npm tarball is missing bundled bridge third-party notices');
    await verifyMcp(packedBridge, expectedNames);

    run('unzip', ['-q', archive, '-d', unpackedConnector]);
    const bundledSkill = join(unpackedConnector, 'skills/tobub');
    await verifyPackage(bundledSkill, sourceRoot);
    const expectedFiles = (await filesUnder(connectorRoot)).map((path) => relative(connectorRoot, path).split(sep).join('/')).sort();
    const actualFiles = (await filesUnder(unpackedConnector)).map((path) => relative(unpackedConnector, path).split(sep).join('/')).sort();
    assert(JSON.stringify(expectedFiles) === JSON.stringify(actualFiles), 'Connector ZIP contents differ from the build directory');
    for (const path of expectedFiles) {
      const [expected, actual] = await Promise.all([readFile(join(connectorRoot, path)), readFile(join(unpackedConnector, path))]);
      assert(expected.equals(actual), `Connector ZIP resource differs from the build directory: ${path}`);
    }
  } finally {
    await rm(verificationRoot, { recursive: true, force: true });
  }
  return { package_version: runtimeVersion, tools: toolIndex.length, ...skillSummary, connector_files: zipListing.length, npm_files: 5 };
}

async function verifyBridgeConfiguration(serverPath, expectedNames) {
  const withoutToken = run(process.execPath, [serverPath, '--list'], {
    timeout: 10000,
    env: { ...process.env, TOBUB_RUNTIME_URL: 'http://127.0.0.1:8510', TOBUB_RUNTIME_TOKEN: '', TOBUB_RUNTIME_TOKEN_FILE: '' },
  });
  const listed = JSON.parse(withoutToken.stdout);
  assert(JSON.stringify(listed.map((tool) => tool.name).sort()) === JSON.stringify([...expectedNames].sort()), '--list output differs from the Runtime tool index');

  const withToken = run(process.execPath, [serverPath, '--list'], {
    timeout: 10000,
    env: { ...process.env, TOBUB_RUNTIME_URL: 'http://127.0.0.1:8510', TOBUB_RUNTIME_TOKEN: 'verification-only-token', TOBUB_RUNTIME_TOKEN_FILE: '' },
  });
  assert(!withToken.stdout.includes('verification-only-token') && !withToken.stderr.includes('verification-only-token'), 'MCP launcher exposed the configured token');

  const remote = spawnSync(process.execPath, [serverPath, '--list'], {
    encoding: 'utf8', timeout: 10000, env: { ...process.env, TOBUB_RUNTIME_URL: 'https://example.com', TOBUB_RUNTIME_TOKEN: '', TOBUB_RUNTIME_TOKEN_FILE: '' },
  });
  assert(remote.status !== 0 && `${remote.stdout}${remote.stderr}`.includes('loopback Runtime URL'), 'MCP launcher accepted a remote Runtime URL');

  const conflictingTokens = spawnSync(process.execPath, [serverPath, '--list'], {
    encoding: 'utf8', timeout: 10000, env: { ...process.env, TOBUB_RUNTIME_TOKEN: 'verification-only-token', TOBUB_RUNTIME_TOKEN_FILE: '/not-used' },
  });
  assert(conflictingTokens.status !== 0 && `${conflictingTokens.stdout}${conflictingTokens.stderr}`.includes('private token-file configuration'), 'MCP launcher accepted two token sources');
  await verifyMcp(serverPath, expectedNames);
}

async function verifyMcp(serverPath, expectedNames) {
  const input = [
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'tobub-workbuddy-verifier', version: '1.0.0' } } },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
  ].map((message) => JSON.stringify(message)).join('\n') + '\n';
  const result = run(process.execPath, [serverPath], { input, timeout: 10000, env: { ...process.env, TOBUB_RUNTIME_TOKEN: 'verification-only-token' } });
  const messages = result.stdout.split(/\r?\n/).filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { throw new Error(`MCP server wrote non-JSON data to stdout: ${line.slice(0, 160)}`); }
  });
  assert(!result.stdout.includes('verification-only-token') && !result.stderr.includes('verification-only-token'), 'MCP server leaked the test token');
  const initialized = messages.find((message) => message.id === 1);
  const listed = messages.find((message) => message.id === 2);
  assert(initialized?.result?.protocolVersion === '2024-11-05', 'MCP initialize handshake failed');
  const tools = listed?.result?.tools;
  assert(Array.isArray(tools) && tools.length > 0, 'MCP tools/list returned no tools');
  const names = tools.map((tool) => tool.name).sort();
  assert(new Set(names).size === names.length, 'MCP server returned duplicate tool names');
  assert(JSON.stringify(names) === JSON.stringify([...expectedNames].sort()), 'MCP server tools do not match the packaged Runtime tool index');
  assert(names.includes('tobub_runtime_health'), 'MCP server is missing the Runtime health tool');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, ...options });
  if (result.error) throw new Error(`Could not run ${command}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || result.stdout || '').trim()}`);
  return result;
}

async function filesUnder(root) {
  const files = [];
  for (const item of await readdir(root, { withFileTypes: true })) {
    const path = join(root, item.name);
    if (item.isSymbolicLink()) throw new Error(`Package must not contain symlinks: ${path}`);
    if (item.isDirectory()) files.push(...await filesUnder(path));
    else if (item.isFile()) files.push(path);
  }
  return files;
}

function semver(value) { return typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function isWithin(parent, child) {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { output: { type: 'string' } }, strict: true });
    if (values.output && !isAbsolute(values.output)) throw new Error('--output must be an absolute path');
    const output = values.output ? resolve(values.output) : join(repositoryRoot, 'platforms/workbuddy/dist');
    console.log(JSON.stringify(await verifyWorkbuddyArtifacts(output, repositoryRoot), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
