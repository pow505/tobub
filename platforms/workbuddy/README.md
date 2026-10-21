# Tobub for WorkBuddy

[English](#english) · [简体中文](#简体中文)

## English

Tobub connects to WorkBuddy through a WorkBuddy Connector that includes a Skill and a local MCP server.

## Use Tobub in WorkBuddy

Requires WorkBuddy 5.0.0 or later. Install Tobub from the WorkBuddy Connector marketplace when the listing is available. Marketplace publication and review are a one-time release step for the Connector; end users do not submit it for review.

After installing the Connector:

1. Start the Tobub desktop app on the same computer as WorkBuddy.
2. In the Connector settings, set the Runtime URL to http://127.0.0.1:8510, or use the local loopback URL shown by Tobub.
3. If Tobub requires an API Token, enter the same token in the Connector settings. Leave it blank if no token is configured.
4. In WorkBuddy chat, describe the browser task you want done. For example, ask it to collect current GitHub Trending projects or use an installed Tobub Skill to research local businesses.

WorkBuddy runs the MCP connector locally with its managed Node.js 22 runtime. The Tobub desktop app must remain available while tools are running. Cloud-hosted agents cannot reach a Tobub Runtime on your computer. The Connector accepts only local loopback HTTP(S) Runtime addresses.

If the Connector is not yet listed in your market, it must first be published and approved by WorkBuddy; see the maintainer steps below.

## Build and verify (maintainers)

Requirements: Node.js 22.18 or later, npm, and zip, unzip, and tar commands.

From the Tobub repository root:

    node platforms/workbuddy/scripts/build.mjs
    node platforms/workbuddy/scripts/verify.mjs

The build writes to platforms/workbuddy/dist/ by default and refuses to overwrite existing output. It creates connector.zip, a matching versioned tobub-mcp npm tarball, and unpacked copies for inspection. Use --output with an absolute path to choose another output directory.

## Publish the Connector (maintainers)

Check that the unscoped npm name tobub-mcp is available to the Tobub publisher account. Publish the exact generated tarball first, then submit connector.zip through the WorkBuddy open platform for review. The Connector source identifier is pow505-tobub; confirm it is available before submission. Increment connector-meta.json version for every Connector update. These commands and scripts do not publish or submit artifacts automatically.

The Connector requires WorkBuddy 5.0.0 or later. The Tobub Runtime URL must be a loopback HTTP(S) origin. The optional API Token should match Tobub's configured token and must not be included in repository files or Skills.

---

## 简体中文

### 在 WorkBuddy 中使用 Tobub

Tobub 通过 WorkBuddy Connector 接入。Connector 包含 Tobub Skill 和本地 MCP 服务。

## 使用 Tobub

需要 WorkBuddy 5.0.0 或更高版本。Connector 上架后，可从 WorkBuddy Connector 市场安装。市场发布和审核是 Connector 发布者的一次性流程；普通用户安装使用时不需要审核。

安装 Connector 后：

1. 在 WorkBuddy 同一台电脑上启动 Tobub 桌面应用。
2. 在 Connector 设置中，将 Runtime URL 配置为 http://127.0.0.1:8510，或填写 Tobub 显示的本机回环地址。
3. 如果 Tobub 启用了 API Token，在 Connector 设置中填写相同 Token；未启用则留空。
4. 在 WorkBuddy 对话中描述浏览器任务，例如采集当前 GitHub Trending 项目，或使用已安装的 Tobub Skill 调研本地商家。

WorkBuddy 使用托管的 Node.js 22 在本机启动 MCP Connector。执行工具时需要 Tobub 桌面应用可用；云端 Agent 无法连接你电脑上的 Tobub Runtime。Connector 只接受本机回环 HTTP(S) Runtime 地址。

如果市场中还没有 Tobub Connector，需要发布者先提交并通过 WorkBuddy 审核，详见下面的维护者步骤。

## 构建和校验（维护者）

需要 Node.js 22.18 或更高版本、npm，以及 zip、unzip 和 tar 命令。

在 Tobub 仓库根目录运行：

    node platforms/workbuddy/scripts/build.mjs
    node platforms/workbuddy/scripts/verify.mjs

默认输出到 platforms/workbuddy/dist/，已有输出目录不会被覆盖。构建会生成 connector.zip、匹配版本的 tobub-mcp npm tarball，以及供检查的解包目录。可用 --output 指定其他绝对输出目录。

## 发布 Connector（维护者）

确认 Tobub 发布账号可以使用非 scope 的 npm 包名 tobub-mcp。先发布构建出的对应 tarball，再通过 WorkBuddy 开放平台提交 connector.zip 审核。Connector source 标识为 pow505-tobub，提交前确认该标识仍可用。每次更新 Connector 都要增加 connector-meta.json 版本号。脚本不会自动发布或提交产物。

Connector 要求 WorkBuddy 5.0.0 或更高版本。Runtime URL 必须是本机回环 HTTP(S) 地址。可选 API Token 必须与 Tobub 中配置的 Token 一致；不要把 Token 放进仓库或 Skill。
