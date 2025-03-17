// tests/gemini-api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "../gemini";

// Mock the NextApiRequest and NextApiResponse
const mockReq = () => {
  return {
    method: "POST",
    body: {
      message: "What is Shinyeong's background?",
      npcId: "test-npc",
    },
  };
};

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// Mock the fs module
vi.mock("fs", () => ({
  readFileSync: vi.fn().mockReturnValue(
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

// Mock the GoogleGenerativeAI class
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

// Set environment variable for the test
process.env.GEMINI_API_KEY = "test-api-key";

describe("Gemini API Handler", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    vi.clearAllMocks();
  });

  it("should return 405 for non-POST requests", async () => {
    req.method = "GET";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
  });

  it("should return 400 if message is missing", async () => {
    req.body = {};
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Message is required" });
  });

  it("should call the Gemini API and return the response", async () => {
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "This is a test response from the Gemini API",
    });
  });
});
