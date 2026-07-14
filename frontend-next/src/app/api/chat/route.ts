/**
 * ============================================================================
 * QUESTIFY API ROUTE: AI Tutor Chat API
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Gateway forwarding chat inquiries to our local/remote AI model.
 * 
 * WHY IT EXISTS:
 * Powers the interactive AI teaching assistant.
 * 
 * HOW IT WORKS (Technical Overview):
 * Next.js API routing handler using model prompts to parse replies.
 * ============================================================================
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful assistant for Questify, a university LMS (Learning Management System).
Help students and faculty with: course materials, assignments, XP system, leaderboards,
attendance tracking, study tips, and platform navigation. Be friendly, concise, and encouraging.
Keep responses under 150 words unless a detailed explanation is specifically needed.
If asked something outside the scope of the LMS, politely redirect the conversation.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI assistant is not configured. Please add GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json() as {
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
    };
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[/api/chat] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
