"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import type { TimelineEvent } from "./knowledgeData";
import { X, Quotes, VideoCamera, ArrowSquareOut } from "@phosphor-icons/react";

interface Props {
  events: TimelineEvent[];
  color?: string;
}

export function AnimatedTimeline({ events, color = "var(--accent)" }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.9", "end 0.5"] });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const activeEvent = events.find(e => e.id === activeId) ?? null;

  const significanceSize = (s: TimelineEvent["significance"]) =>
    s === "high" ? 10 : s === "medium" ? 8 : 6;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "flex-start" }}>
      {/* Timeline */}
      <div ref={containerRef} style={{ position: "relative", paddingLeft: "32px" }}>
        {/* Track line */}
        <div style={{ position: "absolute", left: "7px", top: "12px", bottom: "12px", width: "1px", background: "var(--border)" }}>
          <motion.div style={{ width: "100%", height: lineHeight, background: color, originY: 0 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {events.map((event, i) => {
            const isActive = activeId === event.id;
            const dotSize = significanceSize(event.significance);

            return (
              <EventNode
                key={event.id}
                event={event}
                isActive={isActive}
                dotSize={dotSize}
                color={color}
                index={i}
                onClick={() => setActiveId(isActive ? null : event.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ position: "sticky", top: "80px" }}>
        <AnimatePresence mode="wait">
          {activeEvent ? (
            <motion.div
              key={activeEvent.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-hover)",
                borderRadius: "12px",
                padding: "22px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              }}
            >
              {/* Year badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  background: "rgba(200,16,46,0.1)",
                  border: "1px solid rgba(200,16,46,0.25)",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: color,
                }}>
                  {activeEvent.year}
                </span>
                <button onClick={() => setActiveId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                  <X size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "-0.015em", lineHeight: 1.3, marginBottom: "10px" }}>
                {activeEvent.title}
              </h3>

              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "14px" }}>
                {activeEvent.summary}
              </p>

              {/* Fact */}
              <div style={{ padding: "10px 12px", background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.15)", borderLeft: "2px solid var(--accent)", borderRadius: "6px", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                  <Quotes size={9} color="var(--accent)" weight="fill" />
                  <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--accent)" }}>Key Fact</span>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>{activeEvent.fact}</p>
              </div>

              {/* Videos */}
              {activeEvent.relatedVideos.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "7px" }}>
                    <VideoCamera size={9} color="var(--text-muted)" />
                    <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)" }}>Archive Videos</span>
                  </div>
                  {activeEvent.relatedVideos.slice(0, 3).map((v, i) => (
                    <div key={i} style={{ padding: "5px 8px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px", fontSize: "10px", color: "var(--text-secondary)", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                      {v}
                    </div>
                  ))}
                </div>
              )}

              {/* External ref */}
              {activeEvent.externalRef && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", padding: "8px 10px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                  <ArrowSquareOut size={10} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5 }}>{activeEvent.externalRef}</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: "32px 24px", border: "1px solid var(--border)", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)" }}
            >
              <p style={{ fontSize: "12px", lineHeight: 1.6 }}>Select an event from the timeline to explore it in depth.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Single event node ──────────────────────────────────────────────────────────
function EventNode({ event, isActive, dotSize, color, index, onClick }: {
  event: TimelineEvent;
  isActive: boolean;
  dotSize: number;
  color: string;
  index: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -12 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: "spring", stiffness: 300, damping: 28 }}
      style={{ position: "relative", paddingBottom: "4px" }}
    >
      <button
        onClick={onClick}
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "12px 0",
        }}
      >
        {/* Dot */}
        <div style={{
          position: "absolute",
          left: `-${32 - 7}px`,
          top: "18px",
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: "50%",
          background: isActive ? color : event.significance === "high" ? "rgba(200,16,46,0.5)" : "rgba(255,255,255,0.15)",
          border: `1px solid ${isActive ? color : "rgba(255,255,255,0.15)"}`,
          transform: "translateX(-50%)",
          transition: "background 0.2s, border-color 0.2s",
          boxShadow: isActive ? `0 0 10px ${color}` : "none",
          zIndex: 2,
          flexShrink: 0,
        }} />

        <div style={{
          flex: 1,
          padding: "10px 14px",
          background: isActive ? "rgba(200,16,46,0.06)" : "transparent",
          border: `1px solid ${isActive ? "rgba(200,16,46,0.2)" : "transparent"}`,
          borderRadius: "8px",
          transition: "background 0.2s, border-color 0.2s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: color, letterSpacing: "0.06em", fontFamily: "var(--font-geist-mono), monospace" }}>
              {event.year}
            </span>
            {event.significance === "high" && (
              <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(200,16,46,0.7)", padding: "1px 6px", background: "rgba(200,16,46,0.08)", borderRadius: "3px" }}>
                Key Event
              </span>
            )}
          </div>
          <p style={{ fontSize: "13px", fontWeight: isActive ? 600 : 500, color: isActive ? "#fff" : "rgba(255,255,255,0.7)", letterSpacing: "-0.01em", lineHeight: 1.3, margin: 0 }}>
            {event.title}
          </p>
        </div>
      </button>
    </motion.div>
  );
}
