# Tobub MCP bridge

This package starts Tobub's local stdio MCP bridge. It forwards requests to the Tobub desktop Runtime at `http://127.0.0.1:8510` by default and never starts the desktop app.

The bridge accepts `TOBUB_RUNTIME_URL` only when it is a literal loopback HTTP(S) origin. If the Runtime requires a token, set `TOBUB_RUNTIME_TOKEN`; do not put credentials in command arguments. Node.js 22.18.0 or later is required.

This package is published for use by the Tobub WorkBuddy Connector. The connector and local Runtime must run on the same computer.

The bundled MCP SDK and its dependencies are listed in THIRD-PARTY-NOTICES.json.
