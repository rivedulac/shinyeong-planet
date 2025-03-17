// Vercel API Endpoint for Gemini API
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

let conversationHistory;
try {
  const historyPath = path.join(
    process.cwd(),
    "data",
    "conversation-history.json"
  );
  conversationHistory = JSON.parse(fs.readFileSync(historyPath, "utf8"));
} catch (error) {
  console.warn(
    "Could not load conversation history, using empty history",
    error
  );
  conversationHistory = [];
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    console.log("Method not allowed");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      console.log("Message is required");
      return res.status(400).json({ error: "Message is required" });
    }

    // Initialize the API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Start chat with history
    const chatSession = model.startChat({
      generationConfig,
      history: conversationHistory,
    });

    // Send the message and get the response
    const result = await chatSession.sendMessage(message);
    const messageText = result.response.text();

    // Return the response
    res.status(200).json({ message: messageText });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({
      error: error.message || "Failed to process request",
      details: error.toString(),
    });
  }
}
