# Tobub DeepSeek Harness plugin bundle

This npm package contributes a native DeepSeek Harness plugin. It registers the Tobub tools and the Tobub Skill, and uses the bundled standalone MCP bridge to call the Tobub desktop Runtime on the same computer.

Install it from the Tobub repository after building:

    dsh plugin --profile default add ./platforms/deepseek-harness/dist/dsh-plugin-tobub-0.1.0.tgz

The local Runtime defaults to http://127.0.0.1:8510. Configure an optional token with TOBUB_RUNTIME_TOKEN or TOBUB_RUNTIME_TOKEN_FILE in the environment of the Harness process. Do not configure both. The bridge rejects non-loopback Runtime URLs.

The complete build, verification, local setup, and optional custom-market publishing instructions are in the Tobub repository at platforms/deepseek-harness/README.md.
