#!/usr/bin/env node
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import { spawn } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const serverPath = resolve(__dirname, "../bin/mcp-server.js")

// start building your CLI:
const args = [
  "npx",
  "@modelcontextprotocol/inspector",
  // forward any MCP_* vars:
  ...Object.entries(process.env)
    .filter(([k]) => k.startsWith("MCP_"))
    .flatMap(([k, v]) => ["-e", `${k}=${v}`]),
  "node",
  serverPath,
]

const inspect = spawn(args[0], args.slice(1), { stdio: "inherit" })
inspect.on("error", (err) => {
  console.error("Failed to start inspector:", err)
  process.exit(1)
})
inspect.on("exit", (code) => process.exit(code || 0))
