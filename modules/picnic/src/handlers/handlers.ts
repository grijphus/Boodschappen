import { toolRegistry } from "../tools/index.js"

export async function executeToolHandler(name: string, args: Record<string, unknown>) {
  return await toolRegistry.executeTool(name, args)
}
