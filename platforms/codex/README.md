# Tobub for Codex

[English](#english) · [简体中文](#简体中文)

## English

Tobub currently distributes a Codex-specific Agent Skill plus a local MCP server; it is not yet packaged as a Codex marketplace plugin. Install both as described below.

## Requirements

- Codex and the Tobub desktop app running on the same computer.
- Node.js 22.18 or later.
- No Tobub Cloud account is required.

## Install and connect

From the Tobub repository root, verify and install the Codex package:

    node platforms/codex/agent-skill/scripts/verify-package.mjs
    node platforms/codex/agent-skill/scripts/install.mjs --host codex

The installer copies the Skill and prints a Codex MCP registration command. Run that printed command, then restart Codex. The installer does not edit Codex configuration by itself.

Confirm registration with:

    codex mcp list

The list should include an enabled server named tobub.

## Use Tobub

In Codex, describe the browser task you want done. For example:

- Check the Tobub Runtime connection and list relevant installed Skills.
- Use an appropriate Skill to collect today's GitHub Trending projects and summarize them.
- Help me create a reusable Tobub Skill for this workflow.

Codex follows the Tobub Skill instructions and calls the local MCP tools. Start the Tobub desktop app before running a task. The default Runtime address is http://127.0.0.1:8510.

## Troubleshooting and credentials

If Codex does not show Tobub tools, check that the MCP command was run and that codex mcp list shows tobub as enabled; then restart Codex. If a tool reports that Runtime is unavailable, open Tobub and check its local Runtime port. If Tobub requires an API Token, configure it using a private token file; see the [package installation guide](./agent-skill/INSTALL.md). Never place tokens in prompts or repository files.

Codex must run locally to reach the Tobub Runtime on the same computer.

## Package maintenance

The Codex Agent Skill is independent from the Claude Code package. SDK maintainers rebuild it with:

    pnpm skill:build --platform codex --ui <tobub-ui-root> --repository <tobub-release-root>

See the [Agent Skill package](./agent-skill/).

---

## 简体中文

### 在 Codex 中使用 Tobub

Tobub 当前通过 Codex 专属 Agent Skill 和本地 MCP 服务接入，尚未打包为 Codex 插件市场包。请按下文分别安装 Skill 和 MCP。

## 使用条件

- Codex 和 Tobub 桌面应用运行在同一台电脑上。
- Node.js 版本为 22.18 或更高。
- 不需要 Tobub Cloud 账号。

## 安装和连接

在 Tobub 仓库根目录运行：

    node platforms/codex/agent-skill/scripts/verify-package.mjs
    node platforms/codex/agent-skill/scripts/install.mjs --host codex

安装器会复制 Skill，并打印 Codex MCP 注册命令。执行打印出的命令，再重启 Codex。安装器本身不会修改 Codex 配置。

运行以下命令确认 MCP 已注册：

    codex mcp list

列表中应包含名为 tobub 且状态为 enabled 的服务。

## 使用 Tobub

在 Codex 中直接描述要完成的浏览器任务，例如：

- 检查 Tobub Runtime 连接，并列出相关的已安装 Skill。
- 使用合适的 Skill 采集今天的 GitHub Trending 项目并总结。
- 帮我为这个流程创建一个可复用的 Tobub Skill。

Codex 会根据 Tobub Skill 说明调用本地 MCP 工具。执行任务前先启动 Tobub 桌面应用。Runtime 默认地址为 http://127.0.0.1:8510。

## 故障排查与 Token

如果 Codex 没有显示 Tobub 工具，确认 MCP 注册命令已执行，且 codex mcp list 显示 tobub 已启用，然后重启 Codex。如果工具提示 Runtime 不可用，请启动 Tobub 并检查本地 Runtime 端口。如果 Tobub 启用了 API Token，请使用私有 Token 文件进行配置，详见[安装指南](./agent-skill/INSTALL.md)。不要把 Token 写进提示词或仓库文件。

Codex 必须在 Tobub 所在电脑本地运行，才能连接本机 Runtime。

## 包维护

Codex Agent Skill 包与 Claude Code 包相互独立。SDK 维护者使用以下命令构建：

    pnpm skill:build --platform codex --ui <tobub-ui-root> --repository <tobub-release-root>

查看 [Agent Skill 包](./agent-skill/)。
