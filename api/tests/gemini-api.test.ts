// tests/gemini-api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "../gemini";

// Mock the fs/promises module
vi.mock("fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue(
    JSON.stringify([
      {
        role: "user",
        parts: [{ text: "Test question" }],
      },
      {
        role: "model",
        parts: [{ text: "Test response" }],
      },
    ])
  ),
}));

// Mock the path module
vi.mock("path", () => ({
  join: vi.fn((...args) => args.join("/")),
}));

// Mock the GoogleGenerativeAI module
vi.mock("@google/generative-ai", () => {
  const mockSendMessage = vi.fn().mockResolvedValue({
    response: {
      text: () => "This is a test response from the Gemini API",
    },
  });

  const mockStartChat = vi.fn().mockReturnValue({
    sendMessage: mockSendMessage,
  });

  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    startChat: mockStartChat,
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

// Mock the NextApiRequest and NextApiResponse
const mockReq = () => {
  return {
    method: "POST",
    body: {
      message: "What is Shinyeong's background?",
    },
  };
};

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// Set environment variable for the test
process.env.GEMINI_API_KEY = "test-api-key";

describe("Gemini API Handler", () => {
  let req: any;
  let res: any;
  let fsModule: any;
  let googleAIModule: any;

  beforeEach(async () => {
    req = mockReq();
    res = mockRes();
    vi.clearAllMocks();

    // Import the mocked modules to access their spy functions
    fsModule = await import("fs/promises");
    googleAIModule = await import("@google/generative-ai");
  });

  it("should return 405 for non-POST requests", async () => {
    req.method = "GET";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Method not allowed",
        allowedMethods: ["POST"],
      })
    );
  });

  it("should return 400 if message is missing", async () => {
    req.body = {};
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Message is required",
      })
    );
  });

  it("should return 400 if message is empty", async () => {
    req.body = { message: "   " };
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Message is required",
      })
    );
  });

  it("should call the Gemini API and return the response with timestamp", async () => {
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "This is a test response from the Gemini API",
      timestamp: expect.any(String),
    });
  });

  it.todo("should load conversation history from file system");

  it("should handle missing API key", async () => {
    // Temporarily remove API key
    const originalApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Failed to process request",
        message: "API key not configured",
      })
    );

    // Restore API key
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  it("should handle conversation history loading errors", async () => {
    // Make the readFile mock reject for this test only
    const originalReadFile = fsModule.readFile;
    fsModule.readFile.mockRejectedValueOnce(new Error("File not found"));

    // Should still complete successfully as it'll use an empty history
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    // Restore the original mock
    fsModule.readFile = originalReadFile;
  });

  it.todo("should handle API errors gracefully");
});
