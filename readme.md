<p align="center">
  <a href="https://tobub.com"><img src="./public/tobub.svg" width="96" alt="Tobub logo"></a>
</p>

<h1 align="center">Tobub: Desktop Browser Automation for AI Agents</h1>

<p align="center"><strong>A desktop app that lets AI agents run reusable website workflows in your local browser and saves the results for review.</strong></p>

<p align="center">
  <a href="https://tobub.com">Website</a> ·
  <a href="https://github.com/pow505/tobub/releases/latest">Download Tobub</a> ·
  <a href="./demos/">Skill examples</a> ·
  <a href="readme.zh-CN.md">中文</a>
</p>

## What is Tobub?

Tobub is a desktop app for automating website tasks with AI agents. You can run a Skill yourself or let an agent choose one; Tobub operates the browser on your computer and saves each run and its results in a Session—a work record you can review or continue later.

A Skill is a saved, reusable workflow for one task, such as collecting recent Reddit posts or YouTube comments.

This repository contains Skill definitions as JSON files, examples, and an Agent Skill for Claude Code and local Codex to connect to Tobub. The desktop app is distributed separately; you need it to run these workflows.

## Product demo

![Tobub product Show](./public/tobub.gif)

## Why use Tobub for browser automation?

| | What it means |
| --- | --- |
| **Digital Employees** | AI Agents with specialized roles that plan work, coordinate Skills, and carry multi-step tasks forward. |
| **Automation Skills** | Reusable JSON workflows that connect Agents to supported platforms and tools for research, analysis, and action. |
| **Work Sessions** | Persistent records of plans, sources, progress, results, and context, ready for review or follow-up. |

```mermaid
flowchart LR
    A[Your goal] --> B[Digital Employee]
    B --> C[Plan the work]
    C --> D[Compose Skills]
    D --> E[Run through Tobub Runtime]
    E --> F[Useful result]
    F --> G[Saved Session]
    G --> B
```

## How automation Skills work

A Skill is a saved workflow that tells Tobub how to carry out a task on a supported website—for example, collecting Reddit posts or YouTube comments. A typical Skill works in four stages:

1. **Collect** information from supported websites and services.
2. **Organize** results into structured, reusable work material.
3. **Analyze** trends, customer activity, competitors, and market signals.
4. **Execute** the requested next step and return a clear result.

Skills become more useful when combined. For example, a Research Analyst can connect Search, Web Crawler, RSS, GitHub, and community Skills into one repeatable market-intelligence workflow.

## Digital employee roles

Tobub currently presents these Agent roles:

- Operations Specialist
- Data Engineer
- Research Analyst
- Content Strategist
- Social Media Manager
- Market Intelligence Analyst
- SEO Specialist
- Customer Insights Analyst
- Product Analyst
- News Desk Editor
- Sales Researcher
- Knowledge Curator

Each role turns a professional method into a reusable workflow. The Agent coordinates Skills, keeps context, tracks progress, and leaves work that people can review and continue.

## Current automation Skills

- **Research:** Google Search, Web Crawler, RSS & Feeds, Reddit
- **Social intelligence:** YouTube, Facebook, TikTok, Instagram, X / Twitter
- **Business and market:** LinkedIn, Shopify / Amazon
- **Developer intelligence:** GitHub

Use these Skills for market research, trend discovery, social listening, customer insight, competitor monitoring, news monitoring, SEO research, and structured web extraction.

## Typical workflow

1. Give Tobub a concrete outcome.
2. The digital employee confirms the goal and creates a step-by-step work plan.
3. It selects the Skills needed for the task.
4. Skills run through the Tobub Runtime against supported platforms.
5. Tobub keeps progress, sources, supporting evidence, and intermediate results visible in the Session.
6. The Agent delivers the result and saves a Session for follow-up work.

## Use Tobub with Claude Code or local Codex

The two “Skill” terms mean different things:

- **Tobub Agent Skill** ([`skill/`](./skill/)) is installed into Claude Code or local Codex. It provides instructions and references for finding, running, combining, creating, and editing Tobub Skills.
- **Tobub Skill** (`.skill.json`) is a reusable automation workflow executed by the Tobub desktop app. The app saves each run and its results in a Session.

The bundled MCP bridge is a local Node.js connector that forwards requests from the coding agent to the Tobub desktop Runtime; it does not launch the app. No Tobub Cloud account is needed. The agent must run locally; a cloud-hosted agent cannot reach your desktop Runtime.

To install and connect:

1. Start Tobub and install Node.js 22.18 or later on the same computer as Claude Code or local Codex.
2. From the repository root, run:

   ```sh
   cd skill
   node scripts/install.mjs --host claude
   ```

   For local Codex, replace `claude` with `codex`. The installer validates the package, installs the Agent Skill with its examples, and prints the MCP registration command.
3. Run that command once, then restart Claude Code or Codex. Installing the Agent Skill alone does not register the connection.

See the [installation guide](./skill/INSTALL.md) for token setup and other details.

## Open-source Skills for Tobub. Runtime distributed separately.

This repository publishes Tobub’s open **Skill layer**: reusable JSON definitions that compatible Tobub software can install and execute. A Skill is an automation workflow, not a standalone browser automation application.

The Tobub desktop application and Runtime implementation are proprietary products distributed separately. Cloning this repository alone does **not** provide the app, platform adapters, authentication, account management, or complete execution environment.

| Open in this repository | Not included here |
| --- | --- |
| Native JSON Skill definitions | Tobub desktop application |
| Skill documentation and examples | Tobub Runtime implementation |
| Agent Skill for Claude Code and Codex | Platform adapters and authentication |
| Community review and improvements | Desktop installers and commercial distribution |

This separation lets the community review and extend automation workflows while Tobub supplies the local execution environment and product experience.

## Running a Skill

To run a Skill in Tobub:

1. Install Tobub for Windows, macOS, or Linux.
2. Import or install a Skill from this repository.
3. Configure the platform account and runtime resources required by that Skill.
4. Run it directly or let a digital employee select it.
5. Review the result and execution history in the Session.

The Tobub application also supports Docker and self-hosted deployment, local data control, and OpenAPI integration. These product capabilities are provided by the separately distributed application and Runtime.

## Contributing a Skill

Make every Skill contribution easy to understand, review, and run safely:

- explain the problem and workflow it improves;
- state the platform, inputs, outputs, side effects, and required permissions;
- include the JSON definition and a realistic example;
- document rate limits, platform restrictions, and failure behavior;
- test it inside compatible Tobub software before opening a pull request;
- never commit credentials, cookies, access tokens, private data, or unauthorized content.

## Compatibility and safety

Skills interact with third-party platforms. Their terms, APIs, rate limits, privacy requirements, robots rules, and local laws still apply. Use test accounts and minimum permissions when validating a Skill. A Skill should fail closed when authentication, required input, or platform state is uncertain.

## Product access

- [Download Tobub](https://github.com/pow505/tobub/releases/latest)
- [Tobub website](https://tobub.com)
- [中文 README](readme.zh-CN.md)
- MIT

The desktop application is distributed separately from this open Skill repository.
