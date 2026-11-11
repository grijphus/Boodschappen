import { toolRegistry } from "../../../modules/picnic/src/tools/index.js"
import { promptRegistry } from "../../../modules/picnic/src/prompts/index.js"
import { resourceRegistry } from "../../../modules/picnic/src/resources/index.js"
import packageJson from "../../../modules/picnic/package.json"

const PROTOCOL_VERSION = "2025-06-18"

interface JsonRpcMessage {
  jsonrpc: "2.0"
  id?: string | number | null
  method?: string
  params?: Record<string, unknown>
}

function result(id: string | number | null, value: unknown) {
  return { jsonrpc: "2.0", id, result: value }
}

function failure(id: string | number | null, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } }
}

function textOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function handleMcpRpc(
  body: unknown,
  ensureClient: () => Promise<void>,
): Promise<unknown> {
  if (Array.isArray(body)) {
    const responses = []
    for (const message of body) {
      const response = await handleMessage(message, ensureClient)
      if (response !== null) responses.push(response)
    }
    return responses.length > 0 ? responses : null
  }
  return handleMessage(body, ensureClient)
}

async function handleMessage(
  message: unknown,
  ensureClient: () => Promise<void>,
): Promise<unknown | null> {
  if (!message || typeof message !== "object") {
    return failure(null, -32600, "Invalid Request")
  }
  const req = message as JsonRpcMessage
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return failure(req.id ?? null, -32600, "Invalid Request")
  }
  const isNotification = req.id === undefined
  const id = req.id ?? null

  switch (req.method) {
    case "initialize":
      return result(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false },
          prompts: { listChanged: false },
          resources: { listChanged: false },
        },
        serverInfo: { name: packageJson.name, version: packageJson.version },
      })
    case "ping":
      return result(id, {})
    case "tools/list":
      return result(id, { tools: toolRegistry.getToolsList() })
    case "tools/call": {
      const params = (req.params ?? {}) as { name?: string; arguments?: Record<string, unknown> }
      if (!params.name) return failure(id, -32602, "tools/call requires params.name")
      try {
        await ensureClient()
      } catch (error) {
        return result(id, {
          content: [{ type: "text", text: `Picnic client init failed: ${textOf(error)}` }],
          isError: true,
        })
      }
      try {
        const toolResult = await toolRegistry.executeTool(params.name, params.arguments ?? {})
        return result(id, {
          content: toolResult.content,
          ...(toolResult.isError ? { isError: true } : {}),
        })
      } catch (error) {
        return result(id, {
          content: [{ type: "text", text: textOf(error) }],
          isError: true,
        })
      }
    }
    case "prompts/list":
      return result(id, { prompts: promptRegistry.getPromptsList() })
    case "prompts/get": {
      const params = (req.params ?? {}) as { name?: string; arguments?: Record<string, unknown> }
      if (!params.name) return failure(id, -32602, "prompts/get requires params.name")
      try {
        const prompt = await promptRegistry.executePrompt(params.name, params.arguments)
        return result(id, {
          messages: prompt.messages,
          ...(prompt.tools ? { tools: prompt.tools } : {}),
        })
      } catch (error) {
        return failure(id, -32602, textOf(error))
      }
    }
    case "resources/list":
      return result(id, { resources: resourceRegistry.getResourcesList() })
    case "resources/read": {
      const params = (req.params ?? {}) as { uri?: string }
      if (!params.uri) return failure(id, -32602, "resources/read requires params.uri")
      try {
        const resource = await resourceRegistry.readResource(params.uri)
        return result(id, { contents: resource.contents })
      } catch (error) {
        return failure(id, -32602, textOf(error))
      }
    }
    default:
      if (isNotification) return null
      return failure(id, -32601, `Method not found: ${req.method}`)
  }
}
