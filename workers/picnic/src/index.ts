import { initializePicnicClient } from "../../../modules/picnic/src/utils/picnic-client.js"
import { setKeyValueStore } from "../../../modules/picnic/src/utils/storage.js"
import { handleMcpRpc } from "./rpc.js"

interface Env {
  HTTP_AUTH_TOKEN?: string
  PICNIC_KV: KVNamespace
}

function isAuthorized(request: Request, env: Env): boolean {
  const token = env.HTTP_AUTH_TOKEN
  if (!token) return true
  const headerToken = request.headers.get("x-mcp-token")
  const authorization = request.headers.get("authorization")
  const bearer = authorization?.toLowerCase().startsWith("bearer ")
    ? authorization.slice("bearer ".length).trim()
    : null
  return headerToken === token || bearer === token
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === "/health") {
      return Response.json({ status: "ok" })
    }
    if (url.pathname !== "/mcp") {
      return new Response("Not found", { status: 404 })
    }
    if (!isAuthorized(request, env)) {
      return Response.json({ error: "unauthorized" }, { status: 401 })
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed: stateless MCP server accepts POST only", {
        status: 405,
      })
    }

    setKeyValueStore({
      get: (key) => env.PICNIC_KV.get(key),
      set: (key, value) => env.PICNIC_KV.put(key, value),
      delete: (key) => env.PICNIC_KV.delete(key),
    })

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
        { status: 400 },
      )
    }

    const response = await handleMcpRpc(body, () => initializePicnicClient())
    if (response === null) {
      return new Response(null, { status: 202 })
    }
    return Response.json(response, { status: 200 })
  },
}
