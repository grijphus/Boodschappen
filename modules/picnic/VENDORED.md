# Vendored upstream source

This directory is a vendored copy of the upstream MCP server:

- Upstream: https://github.com/ivo-toby/mcp-picnic (MIT license, see `LICENSE`)
- Pinned commit: `d235da4325f94c5e9b6284dc4324281159179127`

Local modifications relative to upstream:

- `Dockerfile`: added `ENV ENABLE_HTTP_SERVER=true`, `HTTP_HOST=0.0.0.0`,
  `HTTP_PORT=3000`, `PORT=3000`, and `EXPOSE 3000` so the module serves MCP over
  streamable HTTP at `/mcp` (plus `/health` and `/sessions`) without extra flags.

To update the vendored copy, re-copy the upstream tree at a newer commit (excluding
`.git`) and re-apply the Dockerfile change above.
