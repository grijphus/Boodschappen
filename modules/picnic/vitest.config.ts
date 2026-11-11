import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/unit/**/*.test.ts"],
    setupFiles: ["test/setup.ts"],
    env: {
      CONTENTFUL_DELIVERY_ACCESS_TOKEN: "test-token",
      SPACE_ID: "test-space-id",
      ENVIRONMENT_ID: "master",
      PICNIC_USERNAME: "test-username",
      PICNIC_PASSWORD: "test-password",
    },
  },
})
