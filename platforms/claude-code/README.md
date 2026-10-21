# Tobub for Claude Code

[English](#english) · [简体中文](#简体中文)

## English

Tobub connects to Claude Code through a Claude-specific Agent Skill and a local MCP server.

## Requirements

- Claude Code and the Tobub desktop app running on the same computer.
- Node.js 22.18 or later.
- No Tobub Cloud account is required.

## Install and connect

From the Tobub repository root, verify and install the Claude Code package:

    node platforms/claude-code/agent-skill/scripts/verify-package.mjs
    node platforms/claude-code/agent-skill/scripts/install.mjs --host claude

The installer copies the Skill and prints a Claude MCP registration command. Run that printed command, then restart Claude Code. Installing the Skill alone does not register the MCP connection.

## Use Tobub

In Claude Code, describe the browser task you want done. For example:

- Check the Tobub connection and list relevant installed Skills.
- Use a suitable Skill to collect today's GitHub Trending projects and summarize them.
- Help me create a reusable Tobub Skill for this workflow.

Claude Code uses the Tobub Skill instructions and local MCP tools. Start the Tobub desktop app before running a task. The default Runtime address is http://127.0.0.1:8510.

## Troubleshooting and credentials

If Claude cannot find Tobub tools, confirm that the MCP registration command succeeded and restart Claude Code. If a tool reports that Runtime is unavailable, open Tobub and check its local Runtime port. If Tobub requires an API Token, configure it using a private token file; see the [package installation guide](./agent-skill/INSTALL.md). Do not place tokens in prompts or repository files.

The integration requires Claude Code to run locally because it connects to the Tobub Runtime on the same computer.

## Package maintenance

The Claude Code package is independent from the Codex package. SDK maintainers rebuild it with:

    pnpm skill:build --platform claude-code --ui <tobub-ui-root> --repository <tobub-release-root>

See the [Agent Skill package](./agent-skill/).

---

## 简体中文

### 在 Claude Code 中使用 Tobub

Tobub 通过 Claude Code 专属 Agent Skill 和本地 MCP 服务接入 Claude Code。

## 使用条件

- Claude Code 和 Tobub 桌面应用运行在同一台电脑上。
- Node.js 版本为 22.18 或更高。
- 不需要 Tobub Cloud 账号。

## 安装和连接

在 Tobub 仓库根目录运行：

    node platforms/claude-code/agent-skill/scripts/verify-package.mjs
    node platforms/claude-code/agent-skill/scripts/install.mjs --host claude

安装器会复制 Skill，并打印 Claude MCP 注册命令。执行打印出的命令，再重启 Claude Code。只安装 Skill 不会注册 MCP 连接。

## 使用 Tobub

在 Claude Code 中直接描述要完成的浏览器任务，例如：

- 检查 Tobub 连接，并列出相关的已安装 Skill。
- 使用合适的 Skill 采集今天的 GitHub Trending 项目并总结。
- 帮我为这个流程创建一个可复用的 Tobub Skill。

Claude Code 会根据 Tobub Skill 说明调用本地 MCP 工具。执行任务前先启动 Tobub 桌面应用。Runtime 默认地址为 http://127.0.0.1:8510。

## 故障排查与 Token

如果 Claude 找不到 Tobub 工具，确认 MCP 注册命令已成功执行，然后重启 Claude Code。如果工具提示 Runtime 不可用，请启动 Tobub 并检查本地 Runtime 端口。如果 Tobub 启用了 API Token，请使用私有 Token 文件进行配置，详见[安装指南](./agent-skill/INSTALL.md)。不要把 Token 写进提示词或仓库文件。

由于连接的是本机 Runtime，Claude Code 也必须在同一台电脑本地运行。

## 包维护

Claude Code 包与 Codex 包相互独立。SDK 维护者使用以下命令构建：

    pnpm skill:build --platform claude-code --ui <tobub-ui-root> --repository <tobub-release-root>

查看 [Agent Skill 包](./agent-skill/)。
