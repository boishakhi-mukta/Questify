/**
 * ============================================================================
 * QUESTIFY LIBRARY: Ollama Client Client
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Connects the chat screen to a locally hosted Ollama AI model.
 * 
 * WHY IT EXISTS:
 * Allows running and testing chat helpers locally.
 * 
 * HOW IT WORKS (Technical Overview):
 * Connects prompts to local server API urls.
 * ============================================================================
 */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Sends the chat conversation so far to our own server, which forwards it to
// the local Ollama AI model, and returns the AI's reply as plain text.
export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Request failed with status ${res.status}`);
  }

  const data = await res.json() as { reply?: string };
  return data.reply?.trim() || "I couldn't generate a response. Please try again.";
}
