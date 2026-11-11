import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  ErrorCode,
  MCPError,
  TransportError,
  ToolError,
  PromptError,
  ResourceError,
  ErrorUtils,
} from "../../../src/types/errors.js"

describe("ErrorCode", () => {
  it("should have all required error codes", () => {
    expect(ErrorCode.TRANSPORT_CONNECTION_FAILED).toBe("TRANSPORT_CONNECTION_FAILED")
    expect(ErrorCode.TRANSPORT_TIMEOUT).toBe("TRANSPORT_TIMEOUT")
    expect(ErrorCode.TOOL_NOT_FOUND).toBe("TOOL_NOT_FOUND")
    expect(ErrorCode.TOOL_VALIDATION_FAILED).toBe("TOOL_VALIDATION_FAILED")
    expect(ErrorCode.PROMPT_NOT_FOUND).toBe("PROMPT_NOT_FOUND")
    expect(ErrorCode.RESOURCE_NOT_FOUND).toBe("RESOURCE_NOT_FOUND")
    expect(ErrorCode.INVALID_REQUEST).toBe("INVALID_REQUEST")
    expect(ErrorCode.INTERNAL_ERROR).toBe("INTERNAL_ERROR")
  })
})

describe("MCPError", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("constructor", () => {
    it("should create an error with required parameters", () => {
      const error = new MCPError(ErrorCode.INTERNAL_ERROR, "Test error")

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR)
      expect(error.message).toBe("Test error")
      expect(error.statusCode).toBe(500)
      expect(error.details).toBeUndefined()
      expect(error.timestamp).toBeDefined()
      expect(error.name).toBe("MCPError")
    })

    it("should create an error with custom status code", () => {
      const error = new MCPError(ErrorCode.TOOL_NOT_FOUND, "Tool not found", 404)

      expect(error.statusCode).toBe(404)
    })

    it("should create an error with details", () => {
      const details = { toolName: "test-tool", args: { input: "test" } }
      const error = new MCPError(ErrorCode.TOOL_EXECUTION_FAILED, "Execution failed", 500, details)

      expect(error.details).toEqual(details)
    })

    it("should set timestamp", () => {
      const before = Date.now()
      const error = new MCPError(ErrorCode.INTERNAL_ERROR, "Test error")
      const after = Date.now()
      const errorTime = new Date(error.timestamp).getTime()

      expect(errorTime).toBeGreaterThanOrEqual(before)
      expect(errorTime).toBeLessThanOrEqual(after)
    })
  })

  describe("toJSON", () => {
    it("should serialize error to JSON", () => {
      const details = { key: "value" }
      const error = new MCPError(ErrorCode.TOOL_NOT_FOUND, "Tool not found", 404, details)

      const json = error.toJSON()

      expect(json).toEqual({
        name: "MCPError",
        code: ErrorCode.TOOL_NOT_FOUND,
        message: "Tool not found",
        statusCode: 404,
        details,
        timestamp: error.timestamp,
        stack: error.stack,
      })
    })
  })

  describe("toMCPError", () => {
    it("should convert to MCP error format", () => {
      const details = { key: "value" }
      const error = new MCPError(ErrorCode.TOOL_NOT_FOUND, "Tool not found", 404, details)

      const mcpError = error.toMCPError()

      expect(mcpError).toEqual({
        code: -32601, // Method not found
        message: "Tool not found",
        data: {
          errorCode: ErrorCode.TOOL_NOT_FOUND,
          details,
          timestamp: error.timestamp,
        },
      })
    })

    it("should map error codes to JSON-RPC codes correctly", () => {
      const testCases = [
        { code: ErrorCode.INVALID_REQUEST, expected: -32600 },
        { code: ErrorCode.TOOL_VALIDATION_FAILED, expected: -32600 },
        { code: ErrorCode.TOOL_NOT_FOUND, expected: -32601 },
        { code: ErrorCode.PROMPT_NOT_FOUND, expected: -32601 },
        { code: ErrorCode.TOOL_EXECUTION_FAILED, expected: -32602 },
        { code: ErrorCode.TRANSPORT_TIMEOUT, expected: -32000 },
        { code: ErrorCode.INTERNAL_ERROR, expected: -32603 },
      ]

      testCases.forEach(({ code, expected }) => {
        const error = new MCPError(code, "Test message")
        expect(error.toMCPError().code).toBe(expected)
      })
    })
  })
})

describe("TransportError", () => {
  it("should create transport error with correct status codes", () => {
    const testCases = [
      { code: ErrorCode.TRANSPORT_RATE_LIMITED, expectedStatus: 429 },
      { code: ErrorCode.TRANSPORT_INVALID_SESSION, expectedStatus: 400 },
      { code: ErrorCode.TRANSPORT_TIMEOUT, expectedStatus: 408 },
      { code: ErrorCode.TRANSPORT_CONNECTION_FAILED, expectedStatus: 500 },
    ]

    testCases.forEach(({ code, expectedStatus }) => {
      const error = new TransportError(code, "Test message")
      expect(error.statusCode).toBe(expectedStatus)
      expect(error.name).toBe("TransportError")
    })
  })

  it("should include details", () => {
    const details = { sessionId: "test-session" }
    const error = new TransportError(
      ErrorCode.TRANSPORT_INVALID_SESSION,
      "Invalid session",
      details,
    )

    expect(error.details).toEqual(details)
  })
})

describe("ToolError", () => {
  it("should create tool error with correct status codes", () => {
    const testCases = [
      { code: ErrorCode.TOOL_NOT_FOUND, expectedStatus: 404 },
      { code: ErrorCode.TOOL_VALIDATION_FAILED, expectedStatus: 400 },
      { code: ErrorCode.TOOL_TIMEOUT, expectedStatus: 408 },
      { code: ErrorCode.TOOL_EXECUTION_FAILED, expectedStatus: 500 },
    ]

    testCases.forEach(({ code, expectedStatus }) => {
      const error = new ToolError(code, "Test message")
      expect(error.statusCode).toBe(expectedStatus)
      expect(error.name).toBe("ToolError")
    })
  })
})

describe("PromptError", () => {
  it("should create prompt error with correct status codes", () => {
    const testCases = [
      { code: ErrorCode.PROMPT_NOT_FOUND, expectedStatus: 404 },
      { code: ErrorCode.PROMPT_VALIDATION_FAILED, expectedStatus: 400 },
      { code: ErrorCode.PROMPT_EXECUTION_FAILED, expectedStatus: 500 },
    ]

    testCases.forEach(({ code, expectedStatus }) => {
      const error = new PromptError(code, "Test message")
      expect(error.statusCode).toBe(expectedStatus)
      expect(error.name).toBe("PromptError")
    })
  })
})

describe("ResourceError", () => {
  it("should create resource error with correct status codes", () => {
    const testCases = [
      { code: ErrorCode.RESOURCE_NOT_FOUND, expectedStatus: 404 },
      { code: ErrorCode.RESOURCE_ACCESS_DENIED, expectedStatus: 403 },
      { code: ErrorCode.RESOURCE_UNAVAILABLE, expectedStatus: 500 },
    ]

    testCases.forEach(({ code, expectedStatus }) => {
      const error = new ResourceError(code, "Test message")
      expect(error.statusCode).toBe(expectedStatus)
      expect(error.name).toBe("ResourceError")
    })
  })
})

describe("ErrorUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.error
    console.error = vi.fn()
  })

  describe("getErrorMessage", () => {
    it("should extract message from Error object", () => {
      const error = new Error("Test error message")
      expect(ErrorUtils.getErrorMessage(error)).toBe("Test error message")
    })

    it("should return string as-is", () => {
      expect(ErrorUtils.getErrorMessage("String error")).toBe("String error")
    })

    it("should handle unknown error types", () => {
      expect(ErrorUtils.getErrorMessage(null)).toBe("Unknown error occurred")
      expect(ErrorUtils.getErrorMessage(undefined)).toBe("Unknown error occurred")
      expect(ErrorUtils.getErrorMessage(123)).toBe("Unknown error occurred")
      expect(ErrorUtils.getErrorMessage({})).toBe("Unknown error occurred")
    })
  })

  describe("isMCPError", () => {
    it("should identify MCP errors", () => {
      const mcpError = new MCPError(ErrorCode.INTERNAL_ERROR, "Test")
      const toolError = new ToolError(ErrorCode.TOOL_NOT_FOUND, "Test")
      const transportError = new TransportError(ErrorCode.TRANSPORT_TIMEOUT, "Test")

      expect(ErrorUtils.isMCPError(mcpError)).toBe(true)
      expect(ErrorUtils.isMCPError(toolError)).toBe(true)
      expect(ErrorUtils.isMCPError(transportError)).toBe(true)
    })

    it("should reject non-MCP errors", () => {
      const regularError = new Error("Regular error")
      const stringError = "String error"
      const nullError = null

      expect(ErrorUtils.isMCPError(regularError)).toBe(false)
      expect(ErrorUtils.isMCPError(stringError)).toBe(false)
      expect(ErrorUtils.isMCPError(nullError)).toBe(false)
    })
  })

  describe("createSafeErrorResponse", () => {
    it("should create response from MCP error", () => {
      const mcpError = new MCPError(ErrorCode.TOOL_NOT_FOUND, "Tool not found", 404, {
        toolName: "test",
      })

      const response = ErrorUtils.createSafeErrorResponse(mcpError)

      expect(response).toEqual({
        code: -32601,
        message: "Tool not found",
        data: {
          errorCode: ErrorCode.TOOL_NOT_FOUND,
          details: { toolName: "test" },
          timestamp: mcpError.timestamp,
        },
      })
    })

    it("should create response from regular error", () => {
      const regularError = new Error("Regular error")

      const response = ErrorUtils.createSafeErrorResponse(regularError)

      expect(response.code).toBe(-32603)
      expect(response.message).toBe("Regular error")
      expect(response.data.errorCode).toBe(ErrorCode.INTERNAL_ERROR)
      expect(response.data.timestamp).toBeDefined()
    })

    it("should include stack trace when requested", () => {
      const error = new Error("Test error")
      const response = ErrorUtils.createSafeErrorResponse(error, true)

      expect(response.data).toHaveProperty("stack")
      expect((response.data as any).stack).toBeDefined()
    })

    it("should handle unknown error types", () => {
      const response = ErrorUtils.createSafeErrorResponse("String error")

      expect(response.code).toBe(-32603)
      expect(response.message).toBe("String error")
      expect(response.data.errorCode).toBe(ErrorCode.INTERNAL_ERROR)
    })
  })

  describe("logError", () => {
    it("should log MCP errors with details", () => {
      const mcpError = new MCPError(ErrorCode.TOOL_NOT_FOUND, "Tool not found", 404, {
        toolName: "test",
      })

      ErrorUtils.logError(mcpError, "Test Context")

      expect(console.error).toHaveBeenCalledWith(
        "[Test Context] MCP Error [TOOL_NOT_FOUND]:",
        "Tool not found",
        { toolName: "test" },
      )
    })

    it("should log regular errors with stack", () => {
      const regularError = new Error("Regular error")

      ErrorUtils.logError(regularError, "Test Context")

      expect(console.error).toHaveBeenCalledWith(
        "[Test Context] Error:",
        "Regular error",
        regularError.stack,
      )
    })

    it("should log unknown errors", () => {
      ErrorUtils.logError("String error", "Test Context")

      expect(console.error).toHaveBeenCalledWith("[Test Context] Unknown error:", "String error")
    })

    it("should work without context", () => {
      const error = new Error("Test error")

      ErrorUtils.logError(error)

      expect(console.error).toHaveBeenCalledWith("Error:", "Test error", error.stack)
    })
  })

  describe("withErrorHandling", () => {
    it("should execute function successfully", async () => {
      const mockFn = vi.fn().mockResolvedValue("success")
      const wrappedFn = ErrorUtils.withErrorHandling(mockFn, "Test Context")

      const result = await wrappedFn("arg1", "arg2")

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2")
      expect(console.error).not.toHaveBeenCalled()
    })

    it("should handle and log errors", async () => {
      const error = new Error("Function failed")
      const mockFn = vi.fn().mockRejectedValue(error)
      const wrappedFn = ErrorUtils.withErrorHandling(mockFn, "Test Context")

      await expect(wrappedFn()).rejects.toThrow("Function failed")
      expect(console.error).toHaveBeenCalledWith(
        "[Test Context] Error:",
        "Function failed",
        error.stack,
      )
    })
  })

  describe("withTimeout", () => {
    it("should resolve when promise completes within timeout", async () => {
      const promise = Promise.resolve("success")

      const result = await ErrorUtils.withTimeout(promise, 1000)

      expect(result).toBe("success")
    })

    it("should reject when promise times out", async () => {
      const promise = new Promise((resolve) => setTimeout(resolve, 2000))

      await expect(ErrorUtils.withTimeout(promise, 100, "Custom timeout")).rejects.toThrow(MCPError)
      await expect(ErrorUtils.withTimeout(promise, 100, "Custom timeout")).rejects.toThrow(
        "Custom timeout",
      )
    })

    it("should use default timeout message", async () => {
      const promise = new Promise((resolve) => setTimeout(resolve, 2000))

      await expect(ErrorUtils.withTimeout(promise, 100)).rejects.toThrow("Operation timed out")
    })

    it("should reject when promise rejects", async () => {
      const promise = Promise.reject(new Error("Promise failed"))

      await expect(ErrorUtils.withTimeout(promise, 1000)).rejects.toThrow("Promise failed")
    })

    it("should create timeout error with correct properties", async () => {
      const promise = new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        await ErrorUtils.withTimeout(promise, 100, "Test timeout")
      } catch (error) {
        expect(error).toBeInstanceOf(MCPError)
        expect((error as MCPError).code).toBe(ErrorCode.TRANSPORT_TIMEOUT)
        expect((error as MCPError).statusCode).toBe(408)
        expect((error as MCPError).message).toBe("Test timeout")
      }
    })
  })
})
