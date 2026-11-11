# picnic-mcp Worker (Cloudflare)

Runs the vendored mcp-picnic server (`modules/picnic`) as a Cloudflare Worker,
serving MCP over streamable HTTP at `/mcp`. This is the alternative to the
Mistral managed app (`mistral.json` + `modules/picnic/Dockerfile`); the two are
independent.

The Worker drives the vendored tool/prompt/resource registries directly over
JSON-RPC (stateless MCP: one fresh server per request, no Durable Object), so
all 38 `picnic_*` tools work unchanged. The Picnic session token and device id
are persisted in the `PICNIC_KV` KV namespace (namespace `picnic-mcp`, id
`5b73f764a13c44e189e81a661bc20775`), via the `setKeyValueStore` hook added to
the vendored module (see `modules/picnic/VENDORED.md`).

## Setup and deploy

```bash
cd workers/picnic
npm install

npx wrangler secret put PICNIC_USERNAME     # your Picnic email
npx wrangler secret put PICNIC_PASSWORD     # your Picnic password
npx wrangler secret put HTTP_AUTH_TOKEN     # openssl rand -hex 32
# optional: npx wrangler secret put PICNIC_DEVICE_ID / PICNIC_AGENT
# PICNIC_COUNTRY_CODE defaults to NL in wrangler.jsonc vars; change there for DE/FR

npm run deploy
```

`npm run deploy` (not bare `npx wrangler deploy`) matters: the `predeploy` script
runs `npm ci` in `../../modules/picnic` first, because the Worker bundles the
vendored sources and esbuild resolves their bare imports (`zod`, `picnic-api`, …)
from `modules/picnic/node_modules`.

The Worker is then live at `https://picnic-mcp.<your-subdomain>.workers.dev/mcp`.

## Verify

```bash
# health (no auth needed)
curl https://picnic-mcp.<your-subdomain>.workers.dev/health

# MCP handshake (auth via x-mcp-token or Authorization: Bearer)
curl -X POST https://picnic-mcp.<your-subdomain>.workers.dev/mcp \
  -H 'content-type: application/json' -H 'x-mcp-token: $HTTP_AUTH_TOKEN' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}'
```

## Use from Mistral Studio

Add a custom MCP connector (protocol `mcp`) with server URL
`https://picnic-mcp.<your-subdomain>.workers.dev/mcp` and a credential header
`x-mcp-token: <HTTP_AUTH_TOKEN>` (or `Authorization: Bearer <HTTP_AUTH_TOKEN>`).
The `picnic_*` tools then show up via the connector's tool list.

## Notes

- If your Picnic account has 2FA, the first `tools/call` keeps a
  partially-authenticated client; complete login with `picnic_generate_2fa_code`
  then `picnic_verify_2fa_code`. The resulting auth key is stored in KV, so
  later requests (and new isolates) reuse it.
- Local dev: `npx wrangler dev` (put secrets in `.dev.vars`, which is
  gitignored). Validate a build without deploying: `npm run check`
  (`wrangler deploy --dry-run`).
- Workers free tier: 100k requests/day; long-running requests need the paid
  plan's higher CPU/time limits. MCP tool calls are short HTTP round trips to
  the Picnic API, so the free tier is usually enough.
