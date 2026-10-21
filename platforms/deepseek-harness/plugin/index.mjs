import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { normalizeHarnessSchema } from './schema.mjs';

export const name = 'tobub';
export const inject = ['tools', 'skills'];

const packageRoot = dirname(fileURLToPath(import.meta.url));
const toolIndex = JSON.parse(readFileSync(join(packageRoot, 'runtime-tools.json'), 'utf8'));
const tools = toolIndex.tools;
if (!Array.isArray(tools) || tools.length === 0 || new Set(tools.map((tool) => tool.name)).size !== tools.length) {
  throw new Error('The bundled Tobub Runtime tool index is invalid.');
}

const rawSkill = readFileSync(join(packageRoot, 'skill/SKILL.md'), 'utf8');
const skillMatch = rawSkill.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!skillMatch) throw new Error('The bundled Tobub Skill frontmatter is invalid.');
const skillContent = rawSkill.slice(skillMatch[0].length);

export function apply(ctx) {
  const state = { bridgePromise: undefined, disposed: false };

  ctx.skills.register({
    name: 'tobub',
    description: 'Find, run, compose, create, and diagnose browser automation Skills through the local Tobub desktop Runtime.',
    whenToUse: 'Use when a task needs Tobub browser automation, its reusable Skills, local sessions, or Runtime authoring capabilities.',
    content: skillContent,
    source: 'dsh-plugin-tobub',
    provider: 'tobub-deepseek-harness',
    resourceBase: { kind: 'directory', path: join(packageRoot, 'skill') },
    invocation: { modelInvocable: true, userInvocable: true },
    metadata: { runtimeVersion: toolIndex.runtime_version },
  });

  ctx.effect(() => () => {
    state.disposed = true;
    const pending = state.bridgePromise;
    state.bridgePromise = undefined;
    if (pending) {
      void pending.then(async (bridge) => bridge.client.close()).catch(() => undefined);
    }
  });

  for (const source of tools) {
    if (typeof source.name !== 'string' || !/^tobub_[a-z0-9_]+$/.test(source.name)
      || typeof source.description !== 'string' || !source.inputSchema) {
      throw new Error('The bundled Tobub Runtime tool index contains an invalid tool.');
    }
    const parameters = normalizeHarnessSchema(source.inputSchema);
    if (parameters.type !== 'object') throw new Error('Tobub tool parameters must have an object root: ' + source.name);

    ctx.tools.register({
      name: source.name,
      description: source.description + ' The local Tobub bridge validates the complete Runtime schema before sending the request.',
      parameters,
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) ?? 'null' }],
      },
      timeoutMs: 120000,
      async execute(args, execution) {
        if (state.disposed) throw new Error('The Tobub DeepSeek Harness plugin is shutting down.');
        const bridge = await getBridge(state);
        let result;
        try {
          result = await bridge.client.callTool(
            { name: source.name, arguments: args },
            undefined,
            execution?.signal ? { signal: execution.signal } : {},
          );
        } catch (error) {
          const active = state.bridgePromise;
          if (active) {
            state.bridgePromise = undefined;
            void active.then(async (instance) => instance.client.close()).catch(() => undefined);
          }
          throw new Error('The Tobub MCP bridge call failed: ' + safeError(error));
        }
        if (result.isError) {
          const failure = result.structuredContent?.error;
          if (failure && typeof failure.message === 'string') {
            throw new Error((typeof failure.code === 'string' ? failure.code + ': ' : '') + failure.message);
          }
          const detail = (result.content ?? []).filter((item) => item.type === 'text').map((item) => item.text).join('\n');
          throw new Error(detail || 'The Tobub Runtime rejected the request.');
        }
        if (!result.structuredContent || typeof result.structuredContent !== 'object' || Array.isArray(result.structuredContent)) {
          throw new Error('The Tobub MCP bridge returned no structured result.');
        }
        return result.structuredContent;
      },
    });
  }
}

function getBridge(state) {
  if (state.disposed) return Promise.reject(new Error('The Tobub DeepSeek Harness plugin is shutting down.'));
  if (!state.bridgePromise) {
    const attempt = startBridge(state);
    let guarded;
    guarded = attempt.catch((error) => {
      if (state.bridgePromise === guarded) state.bridgePromise = undefined;
      throw error;
    });
    state.bridgePromise = guarded;
  }
  return state.bridgePromise;
}

async function startBridge(state) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(packageRoot, 'runtime-mcp.mjs')],
    env: bridgeEnvironment(),
  });
  const client = new Client({ name: 'tobub-deepseek-harness', version: '0.1.0' });
  try {
    await client.connect(transport);
    const remote = await client.listTools();
    const expected = tools.map((tool) => tool.name).sort();
    const actual = (remote.tools ?? []).map((tool) => tool.name).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error('The installed Tobub MCP bridge tool list does not match this plugin package.');
    }
    if (state.disposed) throw new Error('The Tobub DeepSeek Harness plugin is shutting down.');
    return { client, transport };
  } catch (error) {
    try { await client.close(); } catch {}
    throw new Error('Could not start the Tobub local MCP bridge: ' + safeError(error));
  }
}

function bridgeEnvironment() {
  const env = {
    TOBUB_RUNTIME_URL: process.env.TOBUB_RUNTIME_URL?.trim() || 'http://127.0.0.1:8510',
  };
  for (const key of ['TOBUB_RUNTIME_TOKEN', 'TOBUB_RUNTIME_TOKEN_FILE']) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  return env;
}

function safeError(error) {
  return error instanceof Error ? error.message : String(error);
}
