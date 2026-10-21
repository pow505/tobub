# Install Tobub for Claude Code

Requirements: Tobub desktop running on this computer and Node.js >=22.18.0. This package contains Claude Code-specific guidance and metadata. The installer creates a portable copy with indexed demos and does not edit host configuration.

From the Tobub repository root:

```sh
node platforms/claude-code/agent-skill/scripts/verify-package.mjs
node platforms/claude-code/agent-skill/scripts/install.mjs --host claude
```

Run the printed MCP registration command once, then restart Claude Code. Installing the Agent Skill directory alone does not register MCP.

The Runtime defaults to http://127.0.0.1:8510. If Tobub has an API Token configured, store it in a private file and pass its path as TOBUB_RUNTIME_TOKEN_FILE when registering the server. Do not put the token value in a prompt, command argument, Skill file, or repository. Example registration with a token-file path:

```sh
claude mcp add --env TOBUB_RUNTIME_TOKEN_FILE=/absolute/path/to/private-token --transport stdio tobub -- node /absolute/path/to/tobub/scripts/runtime-mcp.mjs
```

The bridge accepts loopback HTTP(S) origins only and does not start or reconfigure the desktop Runtime. It exposes no arbitrary URL proxy, raw cookies, direct host commands, or second executor. The host must run locally to reach Tobub's loopback Runtime.

For CLI diagnostics, run from the installed package directory:

```sh
node scripts/runtime-mcp.mjs --list
node scripts/runtime-mcp.mjs --call tobub_runtime_health
node scripts/search-capability.mjs capabilities extractList
node scripts/search-capability.mjs demos github
```

The SDK generates this host's package independently:

```sh
pnpm skill:build --platform claude-code --ui /path/to/tobub-ui --repository /path/to/tobub
```

Generated references and the MCP bridge are pinned by references/source-lock.json.
