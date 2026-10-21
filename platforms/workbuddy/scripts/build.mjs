import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { bundleAgentSkill } from '../../codex/agent-skill/scripts/bundle-package.mjs';
import { verifyPackage } from '../../codex/agent-skill/scripts/verify-package.mjs';
import { verifyWorkbuddyArtifacts } from './verify.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const templateRoot = join(repositoryRoot, 'platforms/workbuddy');

try {
  const { values } = parseArgs({ options: { output: { type: 'string' } }, strict: true });
  if (values.output && !isAbsolute(values.output)) throw new Error('--output must be an absolute path');
  const output = values.output ? resolve(values.output) : join(templateRoot, 'dist');
  const sourceDirectories = [
    join(repositoryRoot, 'platforms/codex/agent-skill'),
    join(templateRoot, 'connector'),
    join(templateRoot, 'mcp-package'),
    join(templateRoot, 'templates'),
    join(templateRoot, 'scripts'),
  ];
  if (output === repositoryRoot || isWithin(output, repositoryRoot)
    || sourceDirectories.some((source) => output === source || isWithin(source, output) || isWithin(output, source))) {
    throw new Error('Build output must not overwrite or contain repository source files.');
  }
  try { await realpath(output); throw new Error(`Output already exists: ${output}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }

  const lock = JSON.parse(await readFile(join(repositoryRoot, 'platforms/codex/agent-skill/references/source-lock.json'), 'utf8'));
  const version = lock.runtime_version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid Runtime version in source-lock.json');
  await verifyPackage(join(repositoryRoot, 'platforms/codex/agent-skill'), repositoryRoot);
  await mkdir(dirname(output), { recursive: true });
  const staging = await mkdtemp(join(dirname(output), '.tobub-workbuddy-'));
  try {
    const connector = join(staging, 'connector');
    const skill = join(connector, 'skills/tobub');
    const mcpPackage = join(staging, 'mcp-package');
    await mkdir(connector, { recursive: true });
    await mkdir(skill, { recursive: true });
    await mkdir(mcpPackage, { recursive: true });
    await cp(join(templateRoot, 'connector'), connector, { recursive: true, force: false, errorOnExist: true });
    await bundleAgentSkill(join(repositoryRoot, 'platforms/codex/agent-skill'), skill, repositoryRoot);
    await prepareSkill(skill, version);
    await writeFile(join(connector, 'icon.svg'), sanitizeIcon(await readFile(join(repositoryRoot, 'public/tobub.svg'), 'utf8')));

    const mcpConfigPath = join(connector, 'mcp.json');
    const mcpConfig = JSON.parse(await readFile(mcpConfigPath, 'utf8'));
    const server = mcpConfig.mcpServers?.tobub;
    if (!server || server.args?.length !== 2 || server.args[1] !== 'tobub-mcp@__TOBUB_MCP_VERSION__') throw new Error('Invalid WorkBuddy MCP template');
    server.args[1] = `tobub-mcp@${version}`;
    await writeFile(mcpConfigPath, `${JSON.stringify(mcpConfig, null, 2)}\n`);

    const packageJson = JSON.parse(await readFile(join(templateRoot, 'mcp-package/package.json'), 'utf8'));
    if (packageJson.name !== 'tobub-mcp' || packageJson.version !== '__TOBUB_MCP_VERSION__') throw new Error('Invalid MCP package template');
    packageJson.version = version;
    await writeFile(join(mcpPackage, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
    await cp(join(templateRoot, 'mcp-package/README.md'), join(mcpPackage, 'README.md'));
    await cp(join(repositoryRoot, 'LICENSE'), join(mcpPackage, 'LICENSE'));
    await cp(join(repositoryRoot, 'platforms/codex/agent-skill/references/third-party-licenses.json'), join(mcpPackage, 'THIRD-PARTY-NOTICES.json'));
    const bridge = await readFile(join(repositoryRoot, 'platforms/codex/agent-skill/scripts/runtime-mcp.mjs'), 'utf8');
    await writeFile(join(mcpPackage, 'runtime-mcp.mjs'), `#!/usr/bin/env node\n${bridge}`, { mode: 0o755 });

    const packed = run('npm', ['pack', '--json', '--pack-destination', staging], {
      cwd: mcpPackage,
      env: { ...process.env, npm_config_cache: join(staging, 'npm-cache') },
    });
    await rm(join(staging, 'npm-cache'), { recursive: true, force: true });
    let packInfo;
    try { packInfo = JSON.parse(packed.stdout); } catch { throw new Error('npm pack returned invalid JSON'); }
    const expectedArchive = `tobub-mcp-${version}.tgz`;
    if (packInfo.length !== 1 || packInfo[0].filename !== expectedArchive
      || !packInfo[0].files?.some((file) => file.path === 'runtime-mcp.mjs')
      || !packInfo[0].files?.some((file) => file.path === 'package.json')) {
      throw new Error('npm pack did not include the expected MCP executable and manifest');
    }
    await createZip(connector, join(staging, 'connector.zip'));
    await verifyWorkbuddyArtifacts(staging, repositoryRoot);
    await rename(staging, output);
    console.log(JSON.stringify({
      output,
      connector_archive: join(output, 'connector.zip'),
      npm_package_archive: join(output, expectedArchive),
      package_name: packageJson.name,
      package_version: version,
      minimum_workbuddy_version: '5.0.0',
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

async function prepareSkill(skillRoot, version) {
  await relocateWorkBuddyExamples(skillRoot);
  const frontmatter = `---\nname: tobub\ndescription: Use Tobub through its local desktop Runtime to run, inspect, compose, create, and diagnose browser automation Skills.\ndisplay_name: Tobub 浏览器自动化\ndisplay_name_en: Tobub Browser Automation\ndescription_zh: 通过本机 Tobub Runtime 发现、运行、组合、创建和诊断浏览器自动化 Skill。\ndescription_en: Discover, run, compose, create, and diagnose browser automation Skills through the local Tobub Runtime.\nversion: ${version}\nauthor: Tobub\n---\n\n`;
  const skillPath = join(skillRoot, 'SKILL.md');
  const original = await readFile(skillPath, 'utf8');
  const body = original.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  let adapted = body.replace(
    'Use the `tobub_*` tools from the local `tobub` MCP connection. If that connection is unavailable but local shell execution is available, use the same implementation through `node <this-skill>/scripts/runtime-mcp.mjs --call <tool-name> --input <arguments.json>`. Read [INSTALL.md](INSTALL.md) for setup and credentials. Do not invent a missing tool or connection.',
    'Use the `tobub_*` tools from this WorkBuddy Connector\'s local MCP server. Tobub desktop must be running on the same computer. Read the WorkBuddy setup and credential guidance in `@references/workbuddy-setup.md`. If the MCP connection is unavailable, ask the user to reconnect the Connector; do not start a second bridge process.'
  );
  adapted = adapted.replace(
    'Use `node <this-skill>/scripts/search-capability.mjs capabilities <query>` for exact SDK syntax, options and examples; use `... demos <query>` for relevant demo metadata.',
    'Use live `tobub_runtime_capabilities` for exact method contracts. Read only the relevant entries in the capability catalog and Runtime API references for syntax and options; use the demo index to locate matching examples.'
  );
  adapted = adapted.replace(
    'Codex can generate a native Skill candidate from these contracts and examples.',
    'WorkBuddy can generate a candidate from the bundled contracts and examples.'
  );
  adapted = adapted.replace(
    'In the repository they point to the single canonical `../demos/` tree; the installer bundles them under `examples/` for independent use. Original package bytes are preserved.',
    'This WorkBuddy Connector bundles the indexed demo files under `references/examples/`; original package bytes are preserved.'
  );
  adapted = adapted.replace(
    'Open the relevant `file` paths returned by the index, relative to this Skill directory.',
    'Read relevant demo files from the Skill package using the index entry\'s `file` value (for example, `@references/examples/github/GithubTrendingScraping-1.skill.json`).'
  );
  if (adapted === body) throw new Error('WorkBuddy Skill adaptation did not match the canonical instructions');
  await writeFile(skillPath, frontmatter + 'Respond in the user\'s language; keep Tobub tool names, API fields, and code identifiers unchanged.\n\n' + await convertMarkdownLinks(adapted, 'SKILL.md'));
  await rm(join(skillRoot, 'agents'), { recursive: true, force: true });

  const setup = (await readFile(join(templateRoot, 'templates/workbuddy-setup.md'), 'utf8')).replaceAll('__TOBUB_MCP_VERSION__', version);
  await writeFile(join(skillRoot, 'references/workbuddy-setup.md'), setup);
  await writeFile(join(skillRoot, 'INSTALL.md'), `# WorkBuddy Connector setup\n\nThis Skill is distributed inside the Tobub WorkBuddy Connector. Read @references/workbuddy-setup.md for the local Runtime, address, and optional Token requirements. Install the Connector through WorkBuddy after its npm MCP package has been published and the Connector has passed WorkBuddy review.\n`);

  for (const path of await filesUnder(join(skillRoot, 'references'))) {
    if (!path.endsWith('.md') || path.endsWith('workbuddy-setup.md')) continue;
    const relativePath = relative(skillRoot, path).split(sep).join('/');
    const source = await readFile(path, 'utf8');
    await writeFile(path, await convertMarkdownLinks(source, relativePath));
  }
  const lockPath = join(skillRoot, 'references/source-lock.json');
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  const files = (await filesUnder(skillRoot)).map((path) => relative(skillRoot, path).split(sep).join('/'))
    .filter((path) => path !== 'references/source-lock.json').sort((a, b) => a.localeCompare(b, 'en'));
  lock.resources = [];
  for (const path of files) {
    lock.resources.push({ path, sha256: createHash('sha256').update(await readFile(join(skillRoot, path))).digest('hex') });
  }
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}


async function relocateWorkBuddyExamples(skillRoot) {
  const indexPath = join(skillRoot, 'references/demos-index.json');
  const lockPath = join(skillRoot, 'references/source-lock.json');
  const index = JSON.parse(await readFile(indexPath, 'utf8'));
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  if (index.layout !== 'bundled') throw new Error('Expected the shared Skill bundler to produce bundled demos');
  for (const demo of index.examples) {
    const previous = demo.file;
    const next = `references/${previous}`;
    const resource = lock.resources.find((item) => item.path === previous);
    if (!resource) throw new Error(`Bundled demo is missing from the resource lock: ${previous}`);
    const destination = join(skillRoot, next);
    await mkdir(dirname(destination), { recursive: true });
    await rename(join(skillRoot, previous), destination);
    resource.path = next;
    demo.file = next;
  }
  index.layout = 'workbuddy';
  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  await rm(join(skillRoot, 'examples'), { recursive: true, force: true });
}

async function convertMarkdownLinks(markdown, sourcePath) {
  return markdown.replace(/(!?\[[^\]]*\])\(([^)]+)\)/g, (match, label, target) => {
    if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('#')) return match;
    const path = target.split('#', 1)[0];
    if (!path) return match;
    const resolved = posix.normalize(posix.join(posix.dirname(sourcePath.split(sep).join('/')), path));
    if (resolved === '..' || resolved.startsWith('../') || resolved.startsWith('/')) throw new Error(`WorkBuddy Skill reference escapes package: ${target}`);
    return `@${resolved}`;
  });
}

function sanitizeIcon(svg) {
  const clean = svg.replace(/^\s*<\?xml[^>]*\?>\s*/i, '').replace(/<!DOCTYPE[\s\S]*?>\s*/i, '');
  if (!/<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(clean) || /<script\b|(?:href|xlink:href)\s*=\s*["']https?:/i.test(clean)) {
    throw new Error('Tobub icon is not a self-contained, safe SVG');
  }
  return clean;
}

async function filesUnder(root) {
  const files = [];
  for (const item of await readdir(root, { withFileTypes: true })) {
    const path = join(root, item.name);
    if (item.isSymbolicLink()) throw new Error(`Build package must not contain symlinks: ${path}`);
    if (item.isDirectory()) files.push(...await filesUnder(path));
    else if (item.isFile()) files.push(path);
    else throw new Error(`Unsupported build resource: ${path}`);
  }
  return files;
}

function createZip(connector, archive) {
  run('zip', ['-X', '-qr', archive, '.'], { cwd: connector });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, ...options });
  if (result.error) throw new Error(`Could not run ${command}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || result.stdout || '').trim()}`);
  return result;
}

function isWithin(parent, child) {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}
