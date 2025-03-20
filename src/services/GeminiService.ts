/**
 * Service for communicating with the Gemini AI API
 */
export class GeminiService {
  private apiEndpoint = "/api/gemini";

  constructor(endpoint?: string) {
    if (endpoint) {
      this.apiEndpoint = endpoint;
    }
  }

  /**
   * Send a message to the Gemini AI and get a response
   * @param message The user's message
   * @returns Promise with the AI's response
   */
  public async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to get response from AI");
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }
}
