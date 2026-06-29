export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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
