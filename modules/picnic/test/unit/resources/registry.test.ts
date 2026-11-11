import { describe, it, expect, beforeEach } from "vitest"
import { z } from "zod"
import {
  resourceRegistry,
  ResourceDefinition,
  ResourceContent,
} from "../../../src/resources/registry.js"

describe("ResourceRegistry", () => {
  beforeEach(() => {
    // Clear registry before each test
    resourceRegistry["resources"].clear()
  })

  describe("register", () => {
    it("should register a resource definition", () => {
      const mockResource: ResourceDefinition = {
        uri: "test://resource",
        name: "Test Resource",
        description: "A test resource",
        mimeType: "text/plain",
        handler: async () => ({
          contents: [
            {
              uri: "test://resource",
              mimeType: "text/plain",
              text: "Hello World",
            },
          ],
        }),
      }

      resourceRegistry.register(mockResource)

      expect(resourceRegistry["resources"].has("test://resource")).toBe(true)
      expect(resourceRegistry["resources"].get("test://resource")?.name).toBe("Test Resource")
    })

    it("should register a resource with args schema", () => {
      const mockResource: ResourceDefinition<{ filter: string }> = {
        uri: "test://filtered-resource",
        name: "Filtered Resource",
        argsSchema: z.object({ filter: z.string() }),
        handler: async (args) => ({
          contents: [
            {
              uri: "test://filtered-resource",
              text: `Filtered: ${args?.filter}`,
            },
          ],
        }),
      }

      resourceRegistry.register(mockResource)

      const registered = resourceRegistry["resources"].get("test://filtered-resource")
      expect(registered?.argsSchema).toBeDefined()
    })

    it("should register a resource without optional fields", () => {
      const mockResource: ResourceDefinition = {
        uri: "test://minimal-resource",
        name: "Minimal Resource",
        handler: async () => ({
          contents: [
            {
              uri: "test://minimal-resource",
              text: "Minimal content",
            },
          ],
        }),
      }

      resourceRegistry.register(mockResource)

      const registered = resourceRegistry["resources"].get("test://minimal-resource")
      expect(registered?.description).toBeUndefined()
      expect(registered?.mimeType).toBeUndefined()
      expect(registered?.argsSchema).toBeUndefined()
    })
  })

  describe("getResourceDefinitions", () => {
    it("should return empty object when no resources registered", () => {
      const definitions = resourceRegistry.getResourceDefinitions()
      expect(definitions).toEqual({})
    })

    it("should return resource definitions with normalized keys", () => {
      const mockResource: ResourceDefinition = {
        uri: "test://my-resource",
        name: "My Resource",
        description: "A test resource",
        mimeType: "application/json",
        handler: async () => ({ contents: [] }),
      }

      resourceRegistry.register(mockResource)

      const definitions = resourceRegistry.getResourceDefinitions()
      expect(definitions).toHaveProperty("TEST___MY_RESOURCE")
      expect(definitions["TEST___MY_RESOURCE"]).toEqual({
        uri: "test://my-resource",
        name: "My Resource",
        description: "A test resource",
        mimeType: "application/json",
      })
    })

    it("should handle special characters in URI", () => {
      const mockResource: ResourceDefinition = {
        uri: "file:///path/to/file.txt",
        name: "File Resource",
        handler: async () => ({ contents: [] }),
      }

      resourceRegistry.register(mockResource)

      const definitions = resourceRegistry.getResourceDefinitions()
      expect(definitions).toHaveProperty("FILE____PATH_TO_FILE_TXT")
    })
  })

  describe("getResourcesList", () => {
    it("should return empty array when no resources registered", () => {
      const list = resourceRegistry.getResourcesList()
      expect(list).toEqual([])
    })

    it("should return array of resource definitions", () => {
      const mockResource1: ResourceDefinition = {
        uri: "test://resource1",
        name: "Resource 1",
        description: "First resource",
        handler: async () => ({ contents: [] }),
      }

      const mockResource2: ResourceDefinition = {
        uri: "test://resource2",
        name: "Resource 2",
        mimeType: "text/plain",
        handler: async () => ({ contents: [] }),
      }

      resourceRegistry.register(mockResource1)
      resourceRegistry.register(mockResource2)

      const list = resourceRegistry.getResourcesList()
      expect(list).toHaveLength(2)
      expect(list).toContainEqual({
        uri: "test://resource1",
        name: "Resource 1",
        description: "First resource",
        mimeType: undefined,
      })
      expect(list).toContainEqual({
        uri: "test://resource2",
        name: "Resource 2",
        description: undefined,
        mimeType: "text/plain",
      })
    })
  })

  describe("readResource", () => {
    it("should read a resource without arguments", async () => {
      const expectedContent: ResourceContent = {
        contents: [
          {
            uri: "test://simple-resource",
            mimeType: "text/plain",
            text: "Simple content",
          },
        ],
      }

      const mockResource: ResourceDefinition = {
        uri: "test://simple-resource",
        name: "Simple Resource",
        handler: async () => expectedContent,
      }

      resourceRegistry.register(mockResource)

      const result = await resourceRegistry.readResource("test://simple-resource")
      expect(result).toEqual(expectedContent)
    })

    it("should read a resource with arguments", async () => {
      const mockResource: ResourceDefinition<{ count: number }> = {
        uri: "test://parameterized-resource",
        name: "Parameterized Resource",
        argsSchema: z.object({ count: z.number() }),
        handler: async (args) => ({
          contents: [
            {
              uri: "test://parameterized-resource",
              text: `Count: ${args?.count}`,
            },
          ],
        }),
      }

      resourceRegistry.register(mockResource)

      const result = await resourceRegistry.readResource("test://parameterized-resource", {
        count: 5,
      })
      expect(result.contents[0].text).toBe("Count: 5")
    })

    it("should throw error for unknown resource", async () => {
      await expect(resourceRegistry.readResource("test://unknown")).rejects.toThrow(
        "Unknown resource: test://unknown",
      )
    })

    it("should validate arguments with schema", async () => {
      const mockResource: ResourceDefinition<{ required: string }> = {
        uri: "test://validated-resource",
        name: "Validated Resource",
        argsSchema: z.object({ required: z.string() }),
        handler: async (args) => ({
          contents: [
            {
              uri: "test://validated-resource",
              text: args?.required || "",
            },
          ],
        }),
      }

      resourceRegistry.register(mockResource)

      await expect(
        resourceRegistry.readResource("test://validated-resource", { required: 123 }),
      ).rejects.toThrow("Invalid arguments")
    })

    it("should handle handler errors", async () => {
      const mockResource: ResourceDefinition = {
        uri: "test://error-resource",
        name: "Error Resource",
        handler: async () => {
          throw new Error("Handler failed")
        },
      }

      resourceRegistry.register(mockResource)

      await expect(resourceRegistry.readResource("test://error-resource")).rejects.toThrow(
        "Handler failed",
      )
    })

    it("should work without arguments when no schema provided", async () => {
      const mockResource: ResourceDefinition = {
        uri: "test://no-args-resource",
        name: "No Args Resource",
        handler: async () => ({
          contents: [
            {
              uri: "test://no-args-resource",
              text: "No arguments needed",
            },
          ],
        }),
      }

      resourceRegistry.register(mockResource)

      const result = await resourceRegistry.readResource("test://no-args-resource")
      expect(result.contents[0].text).toBe("No arguments needed")
    })

    it("should handle complex validation errors", async () => {
      const mockResource: ResourceDefinition<{ email: string; count: number }> = {
        uri: "test://complex-validation",
        name: "Complex Validation Resource",
        argsSchema: z.object({
          email: z.string().email(),
          count: z.number().positive(),
        }),
        handler: async () => ({ contents: [] }),
      }

      resourceRegistry.register(mockResource)

      await expect(
        resourceRegistry.readResource("test://complex-validation", {
          email: "invalid-email",
          count: -1,
        }),
      ).rejects.toThrow("Invalid arguments")
    })

    it("should return multiple content items", async () => {
      const mockResource: ResourceDefinition = {
        uri: "test://multi-content",
        name: "Multi Content Resource",
        handler: async () => ({
          contents: [
            {
              uri: "test://multi-content/1",
              text: "First item",
            },
            {
              uri: "test://multi-content/2",
              text: "Second item",
              mimeType: "text/plain",
            },
            {
              uri: "test://multi-content/3",
              blob: "base64encodeddata",
              mimeType: "image/png",
            },
          ],
        }),
      }

      resourceRegistry.register(mockResource)

      const result = await resourceRegistry.readResource("test://multi-content")
      expect(result.contents).toHaveLength(3)
      expect(result.contents[0].text).toBe("First item")
      expect(result.contents[1].mimeType).toBe("text/plain")
      expect(result.contents[2].blob).toBe("base64encodeddata")
    })
  })

  describe("hasResource", () => {
    it("should return false for non-existent resource", () => {
      expect(resourceRegistry.hasResource("test://non-existent")).toBe(false)
    })

    it("should return true for existing resource", () => {
      const mockResource: ResourceDefinition = {
        uri: "test://existing-resource",
        name: "Existing Resource",
        handler: async () => ({ contents: [] }),
      }

      resourceRegistry.register(mockResource)

      expect(resourceRegistry.hasResource("test://existing-resource")).toBe(true)
    })
  })

  describe("getResourceUris", () => {
    it("should return empty array when no resources registered", () => {
      const uris = resourceRegistry.getResourceUris()
      expect(uris).toEqual([])
    })

    it("should return array of resource URIs", () => {
      const resources = [
        {
          uri: "test://resource1",
          name: "Resource 1",
          handler: async () => ({ contents: [] }),
        },
        {
          uri: "test://resource2",
          name: "Resource 2",
          handler: async () => ({ contents: [] }),
        },
        {
          uri: "file:///path/to/file",
          name: "File Resource",
          handler: async () => ({ contents: [] }),
        },
      ]

      resources.forEach((resource) => resourceRegistry.register(resource))

      const uris = resourceRegistry.getResourceUris()
      expect(uris).toHaveLength(3)
      expect(uris).toContain("test://resource1")
      expect(uris).toContain("test://resource2")
      expect(uris).toContain("file:///path/to/file")
    })
  })

  describe("edge cases", () => {
    it("should handle resources with same name but different URIs", () => {
      const resource1: ResourceDefinition = {
        uri: "test://resource1",
        name: "Same Name",
        handler: async () => ({ contents: [] }),
      }

      const resource2: ResourceDefinition = {
        uri: "test://resource2",
        name: "Same Name",
        handler: async () => ({ contents: [] }),
      }

      resourceRegistry.register(resource1)
      resourceRegistry.register(resource2)

      expect(resourceRegistry.hasResource("test://resource1")).toBe(true)
      expect(resourceRegistry.hasResource("test://resource2")).toBe(true)
      expect(resourceRegistry.getResourceUris()).toHaveLength(2)
    })

    it("should overwrite resource with same URI", () => {
      const resource1: ResourceDefinition = {
        uri: "test://same-uri",
        name: "First Resource",
        handler: async () => ({ contents: [{ uri: "test://same-uri", text: "First" }] }),
      }

      const resource2: ResourceDefinition = {
        uri: "test://same-uri",
        name: "Second Resource",
        handler: async () => ({ contents: [{ uri: "test://same-uri", text: "Second" }] }),
      }

      resourceRegistry.register(resource1)
      resourceRegistry.register(resource2)

      expect(resourceRegistry["resources"].get("test://same-uri")?.name).toBe("Second Resource")
    })
  })
})
