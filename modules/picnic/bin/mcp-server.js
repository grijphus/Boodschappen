#!/usr/bin/env node
/* eslint-disable no-undef */

async function main() {
  // Find the delivery token argument
  const picnicUsername = process.argv.findIndex((arg) => arg === "--picnic-username")
  if (picnicUsername !== -1 && process.argv[picnicUsername + 1]) {
    process.env.PICNIC_USERNAME = process.argv[picnicUsername + 1]
  }

  const picnicPassword = process.argv.findIndex((arg) => arg === "--picnic-password")
  if (picnicPassword !== -1 && process.argv[picnicPassword + 1]) {
    process.env.PICNIC_PASSWORD = process.argv[picnicPassword + 1]
  }

  // Find HTTP server configuration arguments
  const enableHttpIndex = process.argv.findIndex((arg) => arg === "--enable-http")
  if (enableHttpIndex !== -1) {
    process.env.ENABLE_HTTP_SERVER = "true"
  }

  const httpPortIndex = process.argv.findIndex((arg) => arg === "--http-port")
  if (httpPortIndex !== -1 && process.argv[httpPortIndex + 1]) {
    process.env.HTTP_PORT = process.argv[httpPortIndex + 1]
  }

  const httpHostIndex = process.argv.findIndex((arg) => arg === "--http-host")
  if (httpHostIndex !== -1 && process.argv[httpHostIndex + 1]) {
    process.env.HTTP_HOST = process.argv[httpHostIndex + 1]
  }

  /**
   * Extend the configuration here
   */

  // Import and run the bundled server after env vars are set
  await import("../dist/bundle.js")
}

main().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
