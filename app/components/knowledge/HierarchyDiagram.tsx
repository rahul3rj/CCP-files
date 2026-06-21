"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { hierarchyLevels } from "./knowledgeData";
import { X, Quotes, VideoCamera, ArrowDown } from "@phosphor-icons/react";

export function HierarchyDiagram() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeLevel = hierarchyLevels.find(l => l.id === activeId) ?? null;

  return (
    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
      {/* Left: Hierarchy stack */}
      <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {/* Society label */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}
        >
          Society
        </motion.div>

        {hierarchyLevels.map((level, i) => {
          const isActive = activeId === level.id;
          const isHovered = hoveredId === level.id;
          const widthPct = 100 - i * 12;

          return (
            <div key={level.id} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Connector arrow */}
              {i > 0 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: i * 0.08 + 0.1, duration: 0.4 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "2px 0" }}
                >
                  <div style={{ width: "1px", height: "14px", background: "var(--border)" }} />
                  <ArrowDown size={10} color="var(--text-muted)" />
                </motion.div>
              )}

              {/* Tier card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 28 }}
                onClick={() => setActiveId(isActive ? null : level.id)}
                onMouseEnter={() => setHoveredId(level.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  width: `${widthPct}%`,
                  padding: "14px 20px",
                  background: isActive
                    ? "rgba(200,16,46,0.08)"
                    : isHovered ? "rgba(255,255,255,0.04)" : "var(--bg-card)",
                  border: `1px solid ${isActive ? "rgba(200,16,46,0.3)" : isHovered ? "var(--border-hover)" : "var(--border)"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s, border-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: level.color, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    {level.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", letterSpacing: "0.04em" }}>
                    {level.subtitle}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isActive ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ color: "var(--text-muted)", flexShrink: 0 }}
                >
                  <div style={{ width: "10px", height: "10px", position: "relative" }}>
                    <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "currentColor", transform: "translateY(-50%)" }} />
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "currentColor", transform: "translateX(-50%)" }} />
                  </div>
                </motion.div>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Right: Detail panel */}
      <div style={{ flex: 1, minHeight: "320px", position: "relative" }}>
        <AnimatePresence mode="wait">
          {activeLevel ? (
            <motion.div
              key={activeLevel.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-hover)",
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: activeLevel.color, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "3px" }}>
                    {activeLevel.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {activeLevel.subtitle}
                  </div>
                </div>
                <button onClick={() => setActiveId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                  <X size={14} />
                </button>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "-0.015em", marginBottom: "10px" }}>
                {activeLevel.title}
              </h3>

              {/* Summary */}
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "16px" }}>
                {activeLevel.summary}
              </p>

              {/* Fact */}
              <div style={{ padding: "11px 13px", background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.15)", borderLeft: "2px solid var(--accent)", borderRadius: "6px", marginBottom: activeLevel.relatedVideos.length > 0 ? "14px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                  <Quotes size={10} color="var(--accent)" weight="fill" />
                  <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--accent)" }}>Key Fact</span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>{activeLevel.fact}</p>
              </div>

              {/* Videos */}
              {activeLevel.relatedVideos.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                    <VideoCamera size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)" }}>Archive Videos</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {activeLevel.relatedVideos.map((v, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ padding: "6px 10px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px", fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "7px" }}
                      >
                        <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                        {v}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "280px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                textAlign: "center",
                padding: "32px",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>←</div>
              <p style={{ fontSize: "13px", lineHeight: 1.5 }}>
                Select a tier to explore its historical and contemporary significance.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
