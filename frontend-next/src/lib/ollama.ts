export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const OLLAMA_URL =
  process.env.NEXT_PUBLIC_OLLAMA_API_URL || "http://localhost:11434";
const OLLAMA_MODEL =
  process.env.NEXT_PUBLIC_OLLAMA_MODEL || "mistral";

const SYSTEM_PROMPT = `You are a helpful assistant for Questify, a university LMS (Learning Management System).
Help students and faculty with: course materials, assignments, XP system, leaderboards,
attendance tracking, study tips, and platform navigation. Be friendly, concise, and encouraging.
Keep responses under 150 words unless a detailed explanation is specifically needed.
If asked something outside the scope of the LMS, politely redirect the conversation.`;

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        options: { num_predict: 500 },
      }),
    });

    if (res.status === 503) {
      return "The AI assistant is busy right now. Please try again in a moment.";
    }

    if (!res.ok) {
      throw new Error(`Ollama returned ${res.status}`);
    }

    const data = await res.json() as {
      message?: { content?: string };
      error?: string;
    };

    if (data.error) throw new Error(data.error);

    return (data.message?.content ?? "").trim() ||
      "I couldn't generate a response. Please try again.";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "The request timed out. Ollama may be loading the model — please try again.";
    }
    if (err instanceof TypeError) {
      return "Unable to reach the AI assistant. Please check your connection.";
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
