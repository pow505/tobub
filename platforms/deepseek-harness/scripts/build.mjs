import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { bundleAgentSkill } from '../../codex/agent-skill/scripts/bundle-package.mjs';
import { verifyPackage } from '../../codex/agent-skill/scripts/verify-package.mjs';
import { verifyDeepSeekArtifacts } from './verify.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const platformRoot = join(repositoryRoot, 'platforms/deepseek-harness');
const templateRoot = join(platformRoot, 'plugin');
const skillSource = join(repositoryRoot, 'platforms/codex/agent-skill');
const sourceDirectories = [templateRoot, join(platformRoot, 'scripts'), skillSource];

try {
  const { values } = parseArgs({ options: { output: { type: 'string' } }, strict: true });
  if (values.output && !isAbsolute(values.output)) throw new Error('--output must be an absolute path');
  const output = values.output ? resolve(values.output) : join(platformRoot, 'dist');
  if (output === repositoryRoot || isWithin(output, repositoryRoot)
    || sourceDirectories.some((source) => output === source || isWithin(source, output) || isWithin(output, source))) {
    throw new Error('Build output must not overwrite or contain repository source files.');
  }
  try {
    await realpath(output);
    throw new Error('Output already exists: ' + output);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const lock = JSON.parse(await readFile(join(skillSource, 'references/source-lock.json'), 'utf8'));
  const runtimeVersion = lock.runtime_version;
  if (!/^\d+\.\d+\.\d+$/.test(runtimeVersion)) throw new Error('Invalid Tobub Runtime version in source-lock.json');
  await verifyPackage(skillSource, repositoryRoot);

  await mkdir(dirname(output), { recursive: true });
  const staging = await mkdtemp(join(dirname(output), '.tobub-deepseek-harness-'));
  try {
    const plugin = join(staging, 'plugin');
    await cp(templateRoot, plugin, { recursive: true, force: false, errorOnExist: true });
    await cp(join(repositoryRoot, 'LICENSE'), join(plugin, 'LICENSE'));
    const toolIndex = JSON.parse(await readFile(join(skillSource, 'references/runtime-tools.json'), 'utf8'));
    toolIndex.runtime_version = runtimeVersion;
    await writeFile(join(plugin, 'runtime-tools.json'), JSON.stringify(toolIndex, null, 2) + '\n');
    const bridgeSource = await readFile(join(skillSource, 'scripts/runtime-mcp.mjs'), 'utf8');
    const bridge = bridgeSource.startsWith('#!/usr/bin/env node\n') ? bridgeSource : '#!/usr/bin/env node\n' + bridgeSource;
    await writeFile(join(plugin, 'runtime-mcp.mjs'), bridge, { mode: 0o755 });
    const skillRoot = join(plugin, 'skill');
    await bundleAgentSkill(skillSource, skillRoot, repositoryRoot);
    await adaptSkill(skillRoot);
    await verifyPackage(skillRoot, repositoryRoot);

    const manifest = JSON.parse(await readFile(join(plugin, 'package.json'), 'utf8'));
    const packed = run('npm', ['pack', '--json', '--pack-destination', staging], {
      cwd: plugin,
      env: { ...process.env, npm_config_cache: join(staging, 'npm-cache') },
    });
    await rm(join(staging, 'npm-cache'), { recursive: true, force: true });
    let packInfo;
    try { packInfo = JSON.parse(packed.stdout); } catch { throw new Error('npm pack returned invalid JSON'); }
    const expectedArchive = manifest.name + '-' + manifest.version + '.tgz';
    if (packInfo.length !== 1 || packInfo[0].filename !== expectedArchive) {
      throw new Error('npm pack did not create the expected DeepSeek Harness plugin package');
    }

    const marketRoot = join(staging, 'market');
    await mkdir(marketRoot);
    const market = createMarketIndex(manifest, Math.floor(Date.now() / 1000));
    await writeFile(join(marketRoot, 'index.json'), JSON.stringify(market, null, 2) + '\n');
    await verifyDeepSeekArtifacts(staging, repositoryRoot);
    await rename(staging, output);
    console.log(JSON.stringify({
      output,
      plugin_directory: join(output, 'plugin'),
      npm_package_archive: join(output, expectedArchive),
      market_index: join(output, 'market/index.json'),
      runtime_version: runtimeVersion,
      tool_count: toolIndex.tools.length,
      verified: true,
    }, null, 2));
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

function createMarketIndex(manifest, publishTimestamp) {
  return {
    format: 1,
    title: { en: 'Tobub', zh: 'Tobub 插件市场' },
    description: {
      en: 'Plugins for local Tobub browser automation.',
      zh: '用于本地 Tobub 浏览器自动化的插件。',
    },
    metadata: {
      categories: { productivity: { title: { en: 'Productivity', zh: '效率工具' } } },
      labels: { browser: { title: { en: 'Browser automation', zh: '浏览器自动化' } } },
    },
    plugins: [{
      name: manifest.name,
      title: { en: 'Tobub Browser Automation', zh: 'Tobub 浏览器自动化' },
      description: {
        en: 'Run, inspect, compose, and create reusable browser automation Skills through your local Tobub Runtime.',
        zh: '通过本机 Tobub Runtime 发现、运行、组合和创建浏览器自动化 Skill。',
      },
      author: 'Tobub',
      homepage: 'https://github.com/pow505/tobub#readme',
      repository: { url: 'https://github.com/pow505/tobub', directory: 'platforms/deepseek-harness/plugin' },
      metadata: { category: 'productivity', labels: ['browser'] },
      versions: [{
        version: manifest.version,
        publishTimestamp,
        source: { type: 'npm' },
        engines: { dsh: manifest.engines.dsh },
      }],
    }],
  };
}

async function adaptSkill(skillRoot) {
  const skillPath = join(skillRoot, 'SKILL.md');
  const original = await readFile(skillPath, 'utf8');
  if (!/^---\r?\nname: tobub\r?\n[\s\S]*?\r?\n---\r?\n/.test(original)) {
    throw new Error('The source Tobub Agent Skill frontmatter is invalid');
  }
  let adapted = original.replace(
    /^description: [^\r\n]*$/m,
    'description: Use Tobub through DeepSeek Harness to find, run, compose, create, modify, and diagnose browser automation Skills with the local desktop Runtime.',
  );
  adapted = replaceRequired(adapted,
    /This is the Codex Agent Skill for operating Tobub\./,
    'This is the Tobub Skill for operating the local Runtime through DeepSeek Harness.',
    'platform-specific Skill introduction');
  adapted = replaceRequired(adapted,
    /^Use the .*tools from the local .*MCP connection\..*$/m,
    'Use the tobub_* tools registered by the local Tobub DeepSeek Harness plugin. The plugin owns the MCP bridge; do not start a second bridge. Read INSTALL.md for local Runtime setup and credentials. Do not invent a missing tool or connection.',
    'MCP tool instructions');
  adapted = replaceRequired(adapted,
    /^3\. Read only relevant references\..*$/m,
    '3. Read only relevant references. Use the bundled capability catalog and demo index to locate exact methods, options, and examples; read the matching Runtime API contract before acting. Tool calls take path, query, and body objects. Runtime protocol fields use snake_case; schema keys and versioned nested contracts preserve their declared casing. Skill JavaScript uses public tobub.* methods and their documented casing.',
    'reference lookup instructions');
  adapted = replaceRequired(adapted,
    /Codex can generate a native Skill candidate from these contracts and examples\./,
    'DeepSeek Harness can help draft a native Tobub Skill candidate from these contracts and examples.',
    'host-specific authoring guidance');

  await writeFile(skillPath, adapted);
  await rm(join(skillRoot, 'agents'), { recursive: true, force: true });
  const install = [
    '# Install Tobub for DeepSeek Harness',
    '',
    'Requirements: Tobub desktop running on this computer, DeepSeek Harness 0.2.1-rc.2 (currently a release candidate) or a compatible later 0.2.x release, and Node.js 22.18 or later.',
    '',
    'Build the Tobub plugin package from the repository root:',
    '',
    '    node platforms/deepseek-harness/scripts/build.mjs',
    '    node platforms/deepseek-harness/scripts/verify.mjs',
    '',
    'Install the generated package tarball into the default profile (replace 0.1.0 with the built package version when it changes):',
    '',
    '    dsh plugin --profile default add ./platforms/deepseek-harness/dist/dsh-plugin-tobub-0.1.0.tgz',
    '',
    'Tobub Runtime defaults to http://127.0.0.1:8510. Configure an optional token with TOBUB_RUNTIME_TOKEN or TOBUB_RUNTIME_TOKEN_FILE in the environment of the Harness process. Do not configure both. The Runtime URL must be a loopback HTTP(S) origin.',
    '',
    'The Tobub plugin starts its local MCP bridge on the first tool call. It does not launch Tobub desktop and cannot connect to a cloud-hosted Harness process.',
    '',
  ].join('\n');
  await writeFile(join(skillRoot, 'INSTALL.md'), install);

  const lockPath = join(skillRoot, 'references/source-lock.json');
  const packageLock = JSON.parse(await readFile(lockPath, 'utf8'));
  packageLock.resources = [];
  for (const path of (await filesUnder(skillRoot)).map((file) => relative(skillRoot, file).split(sep).join('/'))
    .filter((path) => path !== 'references/source-lock.json').sort((a, b) => a.localeCompare(b, 'en'))) {
    packageLock.resources.push({
      path,
      sha256: createHash('sha256').update(await readFile(join(skillRoot, path))).digest('hex'),
    });
  }
  packageLock.resources.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  await writeFile(lockPath, JSON.stringify(packageLock, null, 2) + '\n');
}

function replaceRequired(text, pattern, replacement, label) {
  const next = text.replace(pattern, replacement);
  if (next === text) throw new Error('Could not adapt ' + label);
  return next;
}

async function filesUnder(root) {
  const files = [];
  for (const item of await readdir(root, { withFileTypes: true })) {
    const path = join(root, item.name);
    if (item.isSymbolicLink()) throw new Error('Build package must not contain symlinks: ' + path);
    if (item.isDirectory()) files.push(...await filesUnder(path));
    else if (item.isFile()) files.push(path);
    else throw new Error('Unsupported build resource: ' + path);
  }
  return files;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, ...options });
  if (result.error) throw new Error('Could not run ' + command + ': ' + result.error.message);
  if (result.status !== 0) throw new Error(command + ' failed: ' + (result.stderr || result.stdout || '').trim());
  return result;
}

function isWithin(parent, child) {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith('..' + sep) && path !== '..' && !isAbsolute(path));
}
