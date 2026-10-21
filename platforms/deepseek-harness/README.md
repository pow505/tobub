# Tobub for DeepSeek Harness

[English](#english) · [简体中文](#简体中文)

## English

The DeepSeek Harness integration is a native plugin. It registers Tobub MCP tools and contributes the Tobub Skill to Harness.

## Requirements

- DeepSeek Harness 0.2.1-rc.2 (currently a release candidate) or a compatible later 0.2.x release.
- The Harness process and Tobub desktop app on the same computer.
- Node.js 22.18 or later.

## Build and install locally

From the Tobub repository root, build and verify the plugin:

    node platforms/deepseek-harness/scripts/build.mjs
    node platforms/deepseek-harness/scripts/verify.mjs

Install the generated tarball into the default Harness profile:

    dsh plugin --profile default add ./platforms/deepseek-harness/dist/dsh-plugin-tobub-0.1.0.tgz

The build refuses to overwrite an existing output directory. Use --output with an absolute path to choose a different directory. The output also includes a custom-market index; you can host it over HTTPS and add it to Harness Discover if you want others to install from a market.

## Use Tobub

Start the Tobub desktop app, then ask Harness to perform a browser task or use a relevant Tobub Skill. For example:

- Check the local Tobub connection and list relevant Skills.
- Collect current GitHub Trending projects and summarize them.
- Help me create a reusable Tobub Skill for this workflow.

Harness starts the MCP bridge when a Tobub tool is called. Tool calls require the local Tobub Runtime to be available; the desktop app does not need to be relaunched by the plugin.

The default Runtime address is http://127.0.0.1:8510. If Tobub uses a token, set exactly one of TOBUB_RUNTIME_TOKEN or TOBUB_RUNTIME_TOKEN_FILE in the environment of the Harness process. TOBUB_RUNTIME_URL can override the default, but only loopback HTTP(S) origins are accepted. A desktop app opened from the Dock may not inherit environment variables set in a shell.

## Publish and share the plugin

Publishing is optional. Check that the npm package name is available to the Tobub publisher account, then publish the generated package:

    npm publish ./platforms/deepseek-harness/dist/plugin

Host platforms/deepseek-harness/dist/market/index.json over HTTPS. Users can add the index URL in Harness Discover, then find and install Tobub from that market. A direct registry install is also available after publication:

    dsh plugin --profile default add dsh-plugin-tobub

Installing a plugin executes its code inside the local Harness process. Only install packages or markets you trust.

## Troubleshooting

If tools are unavailable, confirm the plugin is installed in the selected profile, the Harness process and Tobub run on the same computer, and the local Runtime is active. If Tobub requires authentication, check the token environment for the Harness process.

---

## 简体中文

### 在 DeepSeek Harness 中使用 Tobub

DeepSeek Harness 通过原生插件接入 Tobub。插件会注册 Tobub MCP 工具，并向 Harness 提供 Tobub Skill。

## 使用条件

- DeepSeek Harness 0.2.1-rc.2（当前为候选版本）或兼容的后续 0.2.x 版本。
- Harness 和 Tobub 桌面应用运行在同一台电脑上。
- Node.js 版本为 22.18 或更高。

## 本地构建和安装

在 Tobub 仓库根目录构建并校验插件：

    node platforms/deepseek-harness/scripts/build.mjs
    node platforms/deepseek-harness/scripts/verify.mjs

将生成的 tarball 安装到默认 Harness profile：

    dsh plugin --profile default add ./platforms/deepseek-harness/dist/dsh-plugin-tobub-0.1.0.tgz

构建脚本不会覆盖已有输出目录；可用 --output 指定绝对路径。构建产物还包含自定义市场索引，可托管到 HTTPS 地址并添加到 Harness Discover，供其他用户安装。

## 使用 Tobub

启动 Tobub 桌面应用，然后在 Harness 中描述浏览器任务或使用相关 Tobub Skill。例如：

- 检查本机 Tobub 连接，并列出相关 Skill。
- 采集当前 GitHub Trending 项目并总结。
- 帮我为这个流程创建可复用的 Tobub Skill。

Harness 会在调用 Tobub 工具时启动 MCP 桥接程序。工具调用需要本机 Tobub Runtime 正常运行；插件不会代替你启动桌面应用。

Runtime 默认地址为 http://127.0.0.1:8510。如果 Tobub 启用了 Token，请在启动 Harness 的进程环境中设置 TOBUB_RUNTIME_TOKEN 或 TOBUB_RUNTIME_TOKEN_FILE（二选一）。TOBUB_RUNTIME_URL 可覆盖默认地址，但只接受本机回环 HTTP(S) 地址。从 Dock 启动的桌面应用可能不会继承 Shell 中的环境变量。

## 发布和分享插件

发布是可选步骤。确认 Tobub 发布账号可以使用该 npm 包名后，发布构建出的插件包：

    npm publish ./platforms/deepseek-harness/dist/plugin

将 platforms/deepseek-harness/dist/market/index.json 托管在 HTTPS 地址。用户可在 Harness Discover 中添加该索引，再从市场查找和安装 Tobub。发布到 npm 后，也可以直接安装：

    dsh plugin --profile default add dsh-plugin-tobub

安装插件会在本地 Harness 进程中执行插件代码，只安装可信来源的包或市场。

## 故障排查

如果工具不可用，确认插件已安装到当前使用的 profile、Harness 和 Tobub 在同一台电脑上，并且本地 Runtime 正常运行。如果 Tobub 启用了认证，检查 Harness 进程是否拿到了对应 Token。
