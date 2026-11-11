// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    // Global rules to allow certain exceptions for SDK compatibility
    rules: {
      // Allow using 'any' in rare cases when absolutely needed for SDK compatibility
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          fixToUnknown: false,
          ignoreRestArgs: true,
        },
      ],
      // Allow empty interfaces for configuration options that may be extended in the future
      "@typescript-eslint/no-empty-interface": "off",
      // Allow empty object types for configuration interfaces
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "always",
        },
      ],
    },
  },
  {
    files: ["test/**/*.ts"],
    rules: {
      // Allow 'any' types in test files
      "@typescript-eslint/no-explicit-any": "off",
      // Allow non-null assertions in test files
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    // Allow any in specific transport files that need to access private properties
    files: ["src/transports/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
)
