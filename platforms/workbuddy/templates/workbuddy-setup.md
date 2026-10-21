# WorkBuddy connection setup

This Skill uses the `tobub` local stdio MCP Connector. It requires WorkBuddy 5.0.0 or later and the Tobub desktop app running on the same computer as WorkBuddy. The connector does not start Tobub. It connects to the local Runtime at the address configured in WorkBuddy; the default is `http://127.0.0.1:8510`.

If Tobub's Runtime requires an API Token, enter that same token in the WorkBuddy Connector settings. Leave the token blank when the Runtime does not require one. WorkBuddy keeps Connector credentials locally and injects them into the MCP process. Never put a token in a prompt, Skill, command argument, or repository file.

The URL must be a loopback HTTP(S) origin such as `http://127.0.0.1:8510` or `http://[::1]:8510`; paths, credentials, redirects, and remote hosts are rejected. If the connection fails, start Tobub, confirm its local Runtime port, and reconnect the WorkBuddy Connector. A cloud-hosted agent cannot reach a Runtime on your computer.

The published Connector starts the `tobub-mcp` npm package through WorkBuddy's managed Node.js 22 runtime. Keep the npm package version in the Connector configuration aligned with the Runtime version bundled in the Skill package (`__TOBUB_MCP_VERSION__`).
