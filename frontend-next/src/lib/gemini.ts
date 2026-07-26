/**
 * ============================================================================
 * QUESTIFY LIBRARY: AI Chat Client
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * Sends the chat widget's conversation to our own server, which passes it on
 * to Google's Gemini AI model and returns the reply.
 *
 * WHY IT EXISTS:
 * Gives the AI Tutor chat widget a simple function to call, without it
 * needing to know anything about Gemini or hold an API key itself.
 *
 * HOW IT WORKS (Technical Overview):
 * Posts the message history to our /api/chat route (see app/api/chat/route.ts),
 * which is the part that actually calls the Gemini API server-side.
 * ============================================================================
 */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Sends the chat conversation so far to our own server, which forwards it to
// Google's Gemini AI model, and returns the AI's reply as plain text.
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
