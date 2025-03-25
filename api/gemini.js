// Vercel API Endpoint for Gemini API
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises"; // Use promise-based fs
import path from "path";

// Cache the API client and model instances
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-pro-exp-02-05",
});

// Configuration constants
const GENERATION_CONFIG = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Cache conversation history with lazy loading
let conversationHistoryPromise = null;

async function loadConversationHistory() {
  if (!conversationHistoryPromise) {
    conversationHistoryPromise = (async () => {
      try {
        const historyPath = path.join(
          process.cwd(),
          "data",
          "conversation-history.json"
        );
        const data = await fs.readFile(historyPath, "utf8");
        return JSON.parse(data);
      } catch (error) {
        console.warn(
          "Could not load conversation history, using empty history:",
          error
        );
        return [];
      }
    })();
  }
  return conversationHistoryPromise;
}

export default async function handler(req, res) {
  // Early return for non-POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
  }

  try {
    const { message } = req.body;

    // Validate request body
    if (!message?.trim()) {
      return res.status(400).json({
        error: "Message is required",
        details: "Please provide a non-empty message",
      });
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API key not configured");
    }

    // Load conversation history in parallel with other operations
    const history = await loadConversationHistory();

    // Create chat session with cached config
    const chatSession = model.startChat({
      generationConfig: GENERATION_CONFIG,
      history,
    });

    // Send message and get response
    const result = await chatSession.sendMessage(message);
    const messageText = result.response.text();

    // Return successful response
    return res.status(200).json({
      message: messageText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Enhanced error handling
    console.error("Error in Gemini API handler:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Failed to process request",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
