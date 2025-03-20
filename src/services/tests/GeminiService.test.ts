import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GeminiService } from "../GeminiService";

describe("GeminiService", () => {
  // Mock fetch
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should use the default API endpoint if none provided", () => {
    const service = new GeminiService();
    expect((service as any).apiEndpoint).toBe("/api/gemini");
  });

  it("should use the provided API endpoint if specified", () => {
    const customEndpoint = "/api/custom-endpoint";
    const service = new GeminiService(customEndpoint);
    expect((service as any).apiEndpoint).toBe(customEndpoint);
  });

  it("should send a POST request with the correct message", async () => {
    // Set up mock response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "AI response" }),
    });

    const service = new GeminiService();
    const testMessage = "Hello, AI!";
    await service.sendMessage(testMessage);

    // Verify fetch was called correctly
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: testMessage }),
    });
  });

  it("should return the AI message from the response", async () => {
    // Set up mock response
    const expectedResponse = "AI response message";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: expectedResponse }),
    });

    const service = new GeminiService();
    const response = await service.sendMessage("Test message");

    // Verify response
    expect(response).toBe(expectedResponse);
  });

  it("should throw an error when the response is not ok", async () => {
    // Set up mock error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "API error" }),
    });

    const service = new GeminiService();

    // Expect the service to throw an error
    await expect(service.sendMessage("Test message")).rejects.toThrow(
      "API error"
    );
  });

  it("should handle JSON parsing errors in error responses", async () => {
    // Set up mock error response with JSON parsing error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const service = new GeminiService();

    // Expect the service to throw an error with the default message
    await expect(service.sendMessage("Test message")).rejects.toThrow(
      "Unknown error"
    );
  });

  it("should throw a general error if fetch fails", async () => {
    // Set up mock network failure
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const service = new GeminiService();

    // Expect the service to throw the network error
    await expect(service.sendMessage("Test message")).rejects.toThrow(
      "Network error"
    );
  });

  it("should log errors to console.error", async () => {
    // Spy on console.error
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Set up mock network failure
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const service = new GeminiService();

    // Call service and expect it to reject
    await expect(service.sendMessage("Test message")).rejects.toThrow();

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error calling Gemini API:",
      expect.any(Error)
    );
  });
});
