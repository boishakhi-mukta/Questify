/**
 * ============================================================================
 * QUESTIFY LIBRARY: OpenAI Client Client
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Connects the chat screen to cloud OpenAI LLM models.
 * 
 * WHY IT EXISTS:
 * Provides chatbot tutor services in cloud deployments.
 * 
 * HOW IT WORKS (Technical Overview):
 * Connects user questions to chat completion endpoint services.
 * ============================================================================
 */

import OpenAI from "openai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are a helpful assistant for Questify, a university LMS (Learning Management System).
Help students and faculty with: course materials, assignments, XP system, leaderboards,
attendance tracking, study tips, and platform navigation. Be friendly, concise, and encouraging.
Keep responses under 150 words unless a detailed explanation is specifically needed.
If asked something outside the scope of the LMS, politely redirect the conversation.`;

function getClient(): OpenAI {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_OPENAI_API_KEY is not set.");
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return (
    response.choices[0]?.message?.content ??
    "I couldn't generate a response. Please try again."
  );
}
