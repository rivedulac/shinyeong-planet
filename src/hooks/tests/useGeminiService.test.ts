import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGeminiService } from "../useGeminiService";
import { GeminiService } from "@/services/GeminiService";

vi.mock("@/services/GeminiService", () => {
  return {
    GeminiService: vi.fn().mockImplementation(() => ({
      sendMessage: vi.fn().mockResolvedValue("Mock Gemini AI response"),
    })),
  };
});

describe("useGeminiService Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an instance of GeminiService", () => {
    renderHook(() => useGeminiService());
    expect(GeminiService).toHaveBeenCalledTimes(1);
  });

  it("should create only one instance across multiple renders", () => {
    const { rerender } = renderHook(() => useGeminiService());
    rerender();
    rerender();
    expect(GeminiService).toHaveBeenCalledTimes(1);
  });

  it("should return a sendMessage function", () => {
    const { result } = renderHook(() => useGeminiService());
    expect(result.current.sendMessage).toBeInstanceOf(Function);
  });

  it("should call service.sendMessage when sendMessage is called", async () => {
    const { result } = renderHook(() => useGeminiService());
    const mockMessage = "Hello, AI!";

    const response = await result.current.sendMessage(mockMessage);

    // Check that the service's sendMessage was called with the correct argument
    // @ts-ignore: actual.mock.results type error
    const mockServiceInstance = GeminiService.mock.results[0].value;
    expect(mockServiceInstance.sendMessage).toHaveBeenCalledWith(mockMessage);

    // Check that the hook's sendMessage returns the service's response
    expect(response).toBe("Mock Gemini AI response");
  });

  it("should propagate errors from the service", async () => {
    // Create a new mock instance for this specific test
    const mockSendMessage = vi
      .fn()
      .mockRejectedValueOnce(new Error("API error"));
    const mockGeminiServiceInstance = {
      sendMessage: mockSendMessage,
    };

    // Update the GeminiService mock for this test
    (GeminiService as any).mockImplementationOnce(
      () => mockGeminiServiceInstance
    );

    const { result } = renderHook(() => useGeminiService());

    // Call the hook's sendMessage and expect it to reject
    await expect(result.current.sendMessage("Test message")).rejects.toThrow(
      "API error"
    );

    // Verify the service's sendMessage was called
    expect(mockSendMessage).toHaveBeenCalledWith("Test message");
  });
});
