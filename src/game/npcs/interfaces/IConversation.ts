import { INpc } from "./INpc";

/**
 * Interface for NPC conversation data
 */
export interface IConversation {
  /** Title/Name to display in the conversation modal */
  title: string;

  /** Array of messages for the conversation */
  messages: string[];

  /** Optional icon to display next to the title */
  icon?: string;
}

/**
 * Get conversation data for a specific NPC
 * @param npc The NPC to get conversation data for
 * @returns Conversation data for the NPC
 */
export function getConversationForNpc(npc: INpc): IConversation | undefined {
  // Try to get custom conversation data from the NPC
  return npc.getConversation?.();
}
