"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollShadow, Chip } from "@heroui/react";
import { HiPaperAirplane, HiXMark, HiSparkles, HiArrowPath } from "react-icons/hi2";
import { toast } from "sonner";
import { getChatResponse, type ChatMessage } from "@/lib/ollama";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "How to submit assignments",
  "XP system explained",
  "Study tips",
] as const;

// ── Typing indicator ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="Assistant is typing">
      <div className="bg-white dark:bg-slate-800 border border-brand-border dark:border-white/10 px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-body/50 animate-bounce"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-brand-blue text-white rounded-br-sm"
            : "bg-white dark:bg-slate-800 border border-brand-border dark:border-white/10 text-brand-dark dark:text-white rounded-bl-sm shadow-sm"
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ChatAssistant() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<{ text: string; retryMsg: string } | null>(null);

  const panelRef  = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click-outside to close
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput("");
    setIsLoading(true);
    setLastError(null);

    try {
      const reply = await getChatResponse(history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Questify Assistant", { description: msg });
      setLastError({ text: msg, retryMsg: trimmed });
      // Roll back the optimistic user message so retry makes sense
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleRetry = () => {
    if (!lastError) return;
    sendMessage(lastError.retryMsg);
  };

  // ── Closed: floating trigger ───────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Questify Assistant"
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-brand-blue hover:bg-[#004182]",
          "text-white shadow-[0_4px_24px_rgba(37,99,235,0.45)]",
          "flex items-center justify-center",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        )}
      >
        <HiSparkles size={24} aria-hidden />
      </button>
    );
  }

  // ── Open: chat panel ───────────────────────────────────────────────────────
  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Questify Assistant"
      aria-modal="false"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        // Responsive: full-width with margin on mobile, 384px on sm+
        "w-[calc(100vw-3rem)] sm:w-96",
        "flex flex-col rounded-2xl overflow-hidden",
        "bg-white dark:bg-slate-900",
        "border border-brand-border dark:border-white/10",
        "shadow-[0_8px_48px_rgba(0,0,0,0.18)]",
        "h-96 max-h-[520px]",
        "animate-in slide-in-from-bottom-4 fade-in duration-200"
      )}
    >

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-blue shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
            aria-hidden
          >
            <HiSparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white leading-tight">
              Questify Assistant
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              <p className="text-[11px] text-white/70 leading-none">Powered by Gemini</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setLastError(null); }}
              aria-label="Clear conversation"
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
            className="w-7 h-7 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <HiXMark size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <ScrollShadow
        className="flex-1 overflow-y-auto bg-brand-bg dark:bg-slate-950 min-h-0"
        aria-live="polite"
        aria-label="Conversation"
      >
        <div className="px-4 py-4 flex flex-col gap-3">

          {/* Empty / welcome state */}
          {messages.length === 0 && !lastError && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center" aria-hidden>
                <HiSparkles size={28} className="text-brand-blue" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-brand-dark dark:text-white">Hi there! 👋</p>
                <p className="text-[13px] text-brand-body dark:text-white/55 mt-0.5">
                  Ask me anything about Questify
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full" role="list" aria-label="Quick suggestions">
                {QUICK_PROMPTS.map((prompt) => (
                  <Chip
                    key={prompt}
                    size="sm"
                    variant="soft"
                    role="listitem"
                    onClick={() => sendMessage(prompt)}
                    className="cursor-pointer w-full justify-start px-3 text-[12px] text-brand-body hover:text-brand-dark hover:bg-brand-border/60 dark:text-white/55 dark:hover:text-white transition-colors"
                    aria-label={`Quick prompt: ${prompt}`}
                  >
                    {prompt}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} msg={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error state with retry */}
          {lastError && !isLoading && (
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-1.5 rounded-full text-center">
                {lastError.text}
              </span>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 text-[12px] text-brand-blue hover:underline font-medium"
                aria-label="Retry last message"
              >
                <HiArrowPath size={13} aria-hidden />
                Retry
              </button>
            </div>
          )}

          <div ref={bottomRef} aria-hidden />
        </div>
      </ScrollShadow>

      {/* ── Input bar ── */}
      <div className="px-3 py-3 border-t border-brand-border dark:border-white/10 bg-white dark:bg-slate-900 shrink-0 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask me anything…"
          aria-label="Message input"
          autoComplete="off"
          className={cn(
            "flex-1 h-9 px-3.5 rounded-full text-[13px]",
            "border border-brand-border dark:border-white/10",
            "bg-brand-bg dark:bg-slate-800",
            "text-brand-dark dark:text-white",
            "placeholder:text-brand-body/50 dark:placeholder:text-white/30",
            "focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15",
            "transition-colors disabled:opacity-60"
          )}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className={cn(
            "w-9 h-9 rounded-full shrink-0 flex items-center justify-center",
            "bg-brand-blue hover:bg-[#004182]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "text-white transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          )}
        >
          {isLoading ? (
            <span
              className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden
            />
          ) : (
            <HiPaperAirplane size={15} aria-hidden />
          )}
        </button>
      </div>

    </div>
  );
}
