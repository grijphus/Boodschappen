import { describe, it, expect, beforeEach } from "vitest"
import { promptRegistry, PromptDefinition, PromptResult } from "../../../src/prompts/registry.js"

describe("PromptRegistry", () => {
  beforeEach(() => {
    // Clear registry before each test
    promptRegistry["prompts"].clear()
  })

  describe("register", () => {
    it("should register a prompt definition", () => {
      const mockPrompt: PromptDefinition = {
        name: "test-prompt",
        description: "A test prompt",
        handler: async () => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello",
              },
            },
          ],
        }),
      }

      promptRegistry.register(mockPrompt)

      expect(promptRegistry["prompts"].has("test-prompt")).toBe(true)
      expect(promptRegistry["prompts"].get("test-prompt")).toBe(mockPrompt)
    })

    it("should register a prompt with arguments", () => {
      const mockPrompt: PromptDefinition = {
        name: "test-prompt-with-args",
        description: "A test prompt with arguments",
        arguments: [
          {
            name: "input",
            description: "Input text",
            required: true,
          },
        ],
        handler: async (args) => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Input: ${args?.input}`,
              },
            },
          ],
        }),
      }

      promptRegistry.register(mockPrompt)

      const registered = promptRegistry["prompts"].get("test-prompt-with-args")
      expect(registered).toBe(mockPrompt)
      expect(registered?.arguments).toHaveLength(1)
      expect(registered?.arguments?.[0].name).toBe("input")
    })
  })

  describe("getPromptDefinitions", () => {
    it("should return empty object when no prompts registered", () => {
      const definitions = promptRegistry.getPromptDefinitions()
      expect(definitions).toEqual({})
    })

    it("should return prompt definitions with uppercase keys", () => {
      const mockPrompt: PromptDefinition = {
        name: "test-prompt",
        description: "A test prompt",
        handler: async () => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Hello",
              },
            },
          ],
        }),
      }

      promptRegistry.register(mockPrompt)

      const definitions = promptRegistry.getPromptDefinitions()
      expect(definitions).toHaveProperty("TEST-PROMPT")
      expect(definitions["TEST-PROMPT"]).toEqual({
        name: "test-prompt",
        description: "A test prompt",
        arguments: [],
      })
    })

    it("should include arguments in definitions", () => {
      const mockPrompt: PromptDefinition = {
        name: "test-prompt",
        description: "A test prompt",
        arguments: [
          {
            name: "input",
            description: "Input text",
            required: true,
          },
        ],
        handler: async () => ({
          messages: [],
        }),
      }

      promptRegistry.register(mockPrompt)

      const definitions = promptRegistry.getPromptDefinitions()
      expect(definitions["TEST-PROMPT"]).toEqual({
        name: "test-prompt",
        description: "A test prompt",
        arguments: [
          {
            name: "input",
            description: "Input text",
            required: true,
          },
        ],
      })
    })
  })

  describe("getPromptsList", () => {
    it("should return empty array when no prompts registered", () => {
      const list = promptRegistry.getPromptsList()
      expect(list).toEqual([])
    })

    it("should return array of prompt definitions", () => {
      const mockPrompt1: PromptDefinition = {
        name: "prompt1",
        description: "First prompt",
        handler: async () => ({ messages: [] }),
      }

      const mockPrompt2: PromptDefinition = {
        name: "prompt2",
        description: "Second prompt",
        arguments: [{ name: "arg1", description: "Argument 1" }],
        handler: async () => ({ messages: [] }),
      }

      promptRegistry.register(mockPrompt1)
      promptRegistry.register(mockPrompt2)

      const list = promptRegistry.getPromptsList()
      expect(list).toHaveLength(2)
      expect(list).toContainEqual({
        name: "prompt1",
        description: "First prompt",
        arguments: [],
      })
      expect(list).toContainEqual({
        name: "prompt2",
        description: "Second prompt",
        arguments: [{ name: "arg1", description: "Argument 1" }],
      })
    })
  })

  describe("executePrompt", () => {
    it("should execute a prompt without arguments", async () => {
      const expectedResult: PromptResult = {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Hello World",
            },
          },
        ],
      }

      const mockPrompt: PromptDefinition = {
        name: "test-prompt",
        description: "A test prompt",
        handler: async () => expectedResult,
      }

      promptRegistry.register(mockPrompt)

      const result = await promptRegistry.executePrompt("test-prompt")
      expect(result).toEqual(expectedResult)
    })

    it("should execute a prompt with arguments", async () => {
      const mockPrompt: PromptDefinition = {
        name: "test-prompt",
        description: "A test prompt",
        handler: async (args) => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Hello ${args?.name}`,
              },
            },
          ],
        }),
      }

      promptRegistry.register(mockPrompt)

      const result = await promptRegistry.executePrompt("test-prompt", { name: "Alice" })
      expect(result.messages[0].content.text).toBe("Hello Alice")
    })

    it("should throw error for unknown prompt", async () => {
      await expect(promptRegistry.executePrompt("unknown-prompt")).rejects.toThrow(
        "Unknown prompt: unknown-prompt",
      )
    })

    it("should handle prompt handler errors", async () => {
      const mockPrompt: PromptDefinition = {
        name: "error-prompt",
        description: "A prompt that throws an error",
        handler: async () => {
          throw new Error("Handler error")
        },
      }

      promptRegistry.register(mockPrompt)

      await expect(promptRegistry.executePrompt("error-prompt")).rejects.toThrow("Handler error")
    })

    it("should return tools when provided", async () => {
      const expectedResult: PromptResult = {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Hello",
            },
          },
        ],
        tools: [{ name: "test-tool" }],
      }

      const mockPrompt: PromptDefinition = {
        name: "prompt-with-tools",
        description: "A prompt with tools",
        handler: async () => expectedResult,
      }

      promptRegistry.register(mockPrompt)

      const result = await promptRegistry.executePrompt("prompt-with-tools")
      expect(result.tools).toEqual([{ name: "test-tool" }])
    })
  })

  describe("multiple prompts", () => {
    it("should handle multiple registered prompts", () => {
      const prompts = [
        {
          name: "prompt1",
          description: "First prompt",
          handler: async () => ({ messages: [] }),
        },
        {
          name: "prompt2",
          description: "Second prompt",
          handler: async () => ({ messages: [] }),
        },
        {
          name: "prompt3",
          description: "Third prompt",
          handler: async () => ({ messages: [] }),
        },
      ]

      prompts.forEach((prompt) => promptRegistry.register(prompt))

      expect(promptRegistry["prompts"].size).toBe(3)
      expect(promptRegistry.getPromptsList()).toHaveLength(3)

      const definitions = promptRegistry.getPromptDefinitions()
      expect(Object.keys(definitions)).toHaveLength(3)
      expect(definitions).toHaveProperty("PROMPT1")
      expect(definitions).toHaveProperty("PROMPT2")
      expect(definitions).toHaveProperty("PROMPT3")
    })
  })
})
