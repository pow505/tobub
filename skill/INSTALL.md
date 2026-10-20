# Install Tobub for Claude Code and local Codex

Requirements: Tobub desktop running on this machine and Node.js >=22.18.0. The MCP bundle includes its dependencies. For installation from the repository, keep its sibling `demos/` directory: examples have a single source there. The installer produces a self-contained installed Skill; normal use needs no npm install, Cloud account, API key purchase or source checkout. A cloud-hosted agent cannot reach the user's loopback Runtime through this package.

From this folder:

```sh
node scripts/verify-package.mjs
node scripts/install.mjs --host codex
# Or:
node scripts/install.mjs --host claude
```

The installer verifies this Skill and the indexed source demos, bundles those demos into the installation, and copies this single Skill to `~/.agents/skills/tobub` for Codex or `~/.claude/skills/tobub` for Claude Code. `--destination <absolute-directory>` can select an explicit test/project installation. It refuses an existing destination; it never merges, overwrites or edits host configuration. For an upgrade, inspect/back up the old installation before replacing it. Installation prints the exact MCP command and its shell for the installed launcher (`posix` on macOS/Linux, `powershell` on Windows); register that connection once in the host. Installing the Skill directory alone does not configure MCP.

For example, substitute the absolute installed launcher path:

```sh
codex mcp add tobub -- node /absolute/path/to/tobub/scripts/runtime-mcp.mjs
claude mcp add --transport stdio tobub -- node /absolute/path/to/tobub/scripts/runtime-mcp.mjs
```

The connection defaults to `http://127.0.0.1:8510`. A custom local port can be configured through `TOBUB_RUNTIME_URL` in the MCP server environment. Only literal `127.0.0.1` or `[::1]` HTTP(S) origins are accepted; redirects and remote hosts are rejected. This bridge does not start or reconfigure the desktop Runtime.

If Tobub has an API Token configured, provide the same token through a private file. `TOBUB_RUNTIME_TOKEN_FILE` contains its absolute path; on macOS/Linux set file permissions to `0600` (for example, `chmod 600 /absolute/path/to/private-token`). Store the credential through a local editor or secret manager, and configure only the file path in the host's MCP environment. The token is read by the local process and is never returned to the model. `TOBUB_RUNTIME_TOKEN` is also supported for a host-managed secret environment; choose exactly one token source. Do not paste the token into a prompt, command argument, Skill file or repository.

To configure the token-file path, add the environment option when registering the local MCP server (replace both absolute paths; quote the `KEY=value` argument if a path contains spaces):

```sh
codex mcp add tobub --env TOBUB_RUNTIME_TOKEN_FILE=/absolute/path/to/private-token -- node /absolute/path/to/tobub/scripts/runtime-mcp.mjs
claude mcp add --env TOBUB_RUNTIME_TOKEN_FILE=/absolute/path/to/private-token --transport stdio tobub -- node /absolute/path/to/tobub/scripts/runtime-mcp.mjs
```

For a non-default local Runtime port, add a second `--env TOBUB_RUNTIME_URL=http://127.0.0.1:<port>` before `--`. Restart the Codex or Claude Code session after changing its MCP configuration. The commands configure only the MCP server process environment; they do not expose the token value to the agent. The installer never reads UI storage or changes Tobub authentication. With no configured Tobub API Token, the existing local Runtime's authentication policy remains authoritative.

CLI fallback uses the exact same bridge and checks:

```sh
node scripts/runtime-mcp.mjs --list
node scripts/runtime-mcp.mjs --call tobub_runtime_health
node scripts/runtime-mcp.mjs --call tobub_skill_check --input /absolute/path/check-arguments.json
node scripts/search-capability.mjs capabilities extractList
node scripts/search-capability.mjs demos github
```

`check-arguments.json` uses `{ "body": { "name": "Example", "code": "return true;" } }`. Tool results distinguish errors, Runtime diagnostics, and successful data. A timeout on a mutation has an unknown outcome; inspect state before retrying. Request/response limits are 2 MiB/4 MiB per call; use pagination for large datasets. Credentials and browser identity material are redacted, and account/Profile listings use restricted views. The bridge does not expose arbitrary URLs, Cloud services, direct host commands, raw cookies, reset/cleanup APIs or a second executor.

Closing MCP does not cancel already accepted Runtime tasks. Use the corresponding cancel tool and poll its terminal state before considering a requested stop complete.

Maintainers rebuild generated resources from SDK with:

```sh
pnpm skill:build --ui /path/to/tobub-ui --repository /path/to/tobub
```

The builder reads the authoritative SDK registries and reuses the UI snippet generator with a temporary output directory, indexes original repository demos without duplicating them, records partial static diagnostics, bundles the local MCP launcher and locks package resources by SHA-256. Handwritten instructions remain in this `skill/` folder; generated references should be rebuilt together. Do not copy the repository `skill/` folder alone as a portable distribution; run the installer with an explicit destination to produce that bundle. Read `references/source-lock.json` for the exact source Runtime version and hashes.

Host documentation: [Claude Code Skills](https://code.claude.com/docs/en/skills), [Claude Code MCP](https://code.claude.com/docs/en/mcp), [Codex Skills](https://developers.openai.com/codex/skills), [Codex MCP](https://developers.openai.com/codex/mcp).

The Windows registration command uses the PowerShell call operator and literal-string quoting: [call operator](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_operators#call-operator-), [quoting rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules). Run the printed command in its reported shell.
