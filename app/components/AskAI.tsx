"use client";

import { useState, useRef, useEffect } from "react";
import { PaperPlaneRight, ArrowCounterClockwise, Sparkle, Plus } from "@phosphor-icons/react";
import { GeminiIcon } from "./GeminiIcon";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
};

const SUGGESTED_PROMPTS = [
  { label: "Factory Life",       q: "Show me videos about factory worker conditions in China"      },
  { label: "Youth Unemployment", q: "Summarize what the archive says about youth unemployment"     },
  { label: "Housing Crisis",     q: "What evidence exists about China's housing crisis?"           },
  { label: "Censorship",         q: "How does censorship work in China according to archived videos?" },
  { label: "Hukou System",       q: "Explain the Hukou system and its impact on workers"           },
  { label: "Lying Flat",         q: "What is the 'lying flat' movement and why is it happening?"  },
];

export function AskAI() {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Placeholder response — wire up /api/chat to enable real responses
      await new Promise(r => setTimeout(r, 1100));
      const reply = "The AI research assistant isn't connected yet. To enable real responses, add your Gemini API key and wire up the `/api/chat` endpoint. Once connected, I'll be able to search the archive, summarize videos, identify key entities, and answer questions about the content.";
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: reply, timestamp: new Date() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        paddingTop: "60px",
        background: "var(--bg-primary)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GeminiIcon size={18} id="header" />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
              Archive AI
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Research assistant · Powered by Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEmpty && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                background: "transparent",
                fontSize: "11px",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <ArrowCounterClockwise size={12} />
              New chat
            </button>
          )}
          <button
            className="flex items-center gap-1.5"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              background: "transparent",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            <Plus size={12} />
            New thread
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          {/* Empty state */}
          {isEmpty && (
            <div style={{ paddingTop: "48px" }}>

              {/* Hero */}
              <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <GeminiIcon size={28} id="empty" />
                </div>
                <h2
                  style={{
                    fontSize: "clamp(1.4rem, 3vw, 2rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "#fff",
                    marginBottom: "10px",
                  }}
                >
                  Ask the Archive
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto", lineHeight: 1.6 }}>
                  Search through archived videos, get AI summaries, identify key entities,
                  and research topics in natural language.
                </p>
              </div>

              {/* Suggested prompts */}
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "14px" }}>
                  Suggested queries
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {SUGGESTED_PROMPTS.map(({ label, q }, i) => (
                    <button
                      key={label}
                      onClick={() => send(q)}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "border-color 0.15s, transform 0.15s",
                        animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "var(--border-hover)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <Sparkle size={11} color="var(--accent)" />
                        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>
                          {label}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>
                        {q}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {!isEmpty && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  style={{ animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: msg.role === "user" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <GeminiIcon size={16} id={`msg-${msg.id}`} />
                    ) : (
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>U</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                        background: msg.role === "user"
                          ? "rgba(255,255,255,0.06)"
                          : "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: msg.role === "user"
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.7)",
                        fontSize: "14px",
                        lineHeight: 1.7,
                      }}
                    >
                      {msg.text}
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", paddingLeft: "4px", paddingRight: "4px", textAlign: msg.role === "user" ? "right" : "left" }}>
                      {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="flex gap-3" style={{ animation: "fadeIn 0.2s ease both" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <GeminiIcon size={16} id="loading" />
                  </div>
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "4px 12px 12px 12px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.25)",
                          display: "inline-block",
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Input ── */}
      <div
        style={{
          padding: "16px 32px 24px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-primary)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            background: "var(--bg-card)",
            border: "1px solid var(--border-hover)",
            borderRadius: "12px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            transition: "border-color 0.2s",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about the archive…"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              color: "#fff",
              fontSize: "14px",
              lineHeight: 1.6,
              maxHeight: "120px",
              overflowY: "auto",
              fontFamily: "inherit",
            }}
            aria-label="Message input"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: input.trim() && !loading ? "#fff" : "rgba(255,255,255,0.06)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              color: input.trim() && !loading ? "#000" : "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            aria-label="Send"
          >
            <PaperPlaneRight size={15} weight="fill" />
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: "10px", color: "var(--text-muted)", marginTop: "10px" }}>
          AI responses may contain errors. Always verify with original source videos.
        </p>
      </div>
    </div>
  );
}
