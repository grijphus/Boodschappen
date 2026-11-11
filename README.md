# Boodschappen — Picnic MCP app for Mistral Studio

A Mistral App whose only module is a vendored copy of
[mcp-picnic](https://github.com/ivo-toby/mcp-picnic) (pinned commit
`d235da4325f94c5e9b6284dc4324281159179127`, see `modules/picnic/VENDORED.md`),
serving MCP over streamable HTTP at `/mcp`. Deployed, the app's gateway exposes
an MCP server URL that you register in Studio as a custom MCP connector, making
the 30+ `picnic_*` tools (search, cart, delivery slots, 2FA, …) available to
agents, workflows, and Le Chat conversations.

## Layout

- `apps.json` — app manifest; one module `picnic` (`type: app`, `serve: server`,
  routes `/mcp` with `mcp: true` and `/health`, port 3000, runtime node).
- `modules/picnic/` — vendored mcp-picnic source with its own `Dockerfile`
  (HTTP mode enabled by default). Self-contained: own `npm ci`, own Docker build
  context; not part of the root Bun workspaces.
- `.env.example` — names of the env vars the app reads. Values never committed.

## Configuration (secrets)

Set these in `.env` locally and in the **Secrets** tab of the app in Studio when
deployed (per module `picnic`):

| Variable | Required | Notes |
| --- | --- | --- |
| `PICNIC_USERNAME` | yes | Picnic account email |
| `PICNIC_PASSWORD` | yes | never stored on disk by the server; only the session token is |
| `PICNIC_COUNTRY_CODE` | no | `NL` (default), `DE`, or `FR`; must match the account country |
| `HTTP_AUTH_TOKEN` | recommended | shared token required on all endpoints except `/health`, sent as `x-mcp-token` header or `Authorization: Bearer` |

If the Picnic account has 2FA, the first tool calls go through
`picnic_generate_2fa_code` → `picnic_verify_2fa_code`. The session token is
persisted at `PICNIC_SESSION_FILE` (default `/app/data/picnic-session.json` in
the image). On the managed platform `/app/data` may not survive restarts; if
the session is lost the server re-authenticates from the credentials above and
2FA is needed again.

## Run locally

```bash
cp .env.example .env   # then fill in PICNIC_USERNAME / PICNIC_PASSWORD / HTTP_AUTH_TOKEN
mistral dev --filter picnic --no-open
```

Then test the module directly:

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/mcp -H 'Content-Type: application/json' \
  -H 'x-mcp-token: $HTTP_AUTH_TOKEN' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}'
```

## Deploy and connect in Studio

1. Commit and push to `origin` (`mistral deploy` builds the pushed commit).
2. `mistral deploy` — the report prints the app URL and its MCP server URL(s).
3. In Studio: **Connectors → + Add connector → custom MCP**, protocol `mcp`,
   server = the app's MCP URL; credential header `x-mcp-token: <HTTP_AUTH_TOKEN>`
   (or `Authorization: Bearer <HTTP_AUTH_TOKEN>`).
4. The `picnic_*` tools are now callable via `list_connector_tools` /
   `test_connector_http_call` and usable by agents and workflows that name the
   connector.
