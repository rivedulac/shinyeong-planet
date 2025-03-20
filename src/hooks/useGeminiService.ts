import { useState } from "react";
import { GeminiService } from "@/services/GeminiService";

export function useGeminiService() {
  const [service] = useState(() => new GeminiService());

  const sendMessage = async (message: string) => {
    return await service.sendMessage(message);
  };

  return { sendMessage };
}
