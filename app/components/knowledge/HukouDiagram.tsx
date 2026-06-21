"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { hukouNodes } from "./knowledgeData";
import type { HukouNodeData } from "./knowledgeData";
import { X, Quotes, VideoCamera } from "@phosphor-icons/react";

// SVG viewBox is 0 0 100 100 — nodes use % coords
const VIEWBOX = "0 0 100 100";

export function HukouDiagram() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<HukouNodeData | null>(null);

  const isConnected = useCallback((nodeId: string): boolean => {
    if (!hoveredId) return false;
    if (nodeId === hoveredId) return true;
    const hov = hukouNodes.find(n => n.id === hoveredId);
    return hov ? hov.connections.includes(nodeId) : false;
  }, [hoveredId]);

  const isDimmed = useCallback((nodeId: string): boolean => {
    if (!hoveredId) return false;
    return !isConnected(nodeId);
  }, [hoveredId, isConnected]);

  // Build all edges from connections (deduplicated)
  const edges: { a: string; b: string }[] = [];
  const seen = new Set<string>();
  hukouNodes.forEach(n => {
    n.connections.forEach(cid => {
      const key = [n.id, cid].sort().join("-");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ a: n.id, b: cid });
      }
    });
  });

  const getNode = (id: string) => hukouNodes.find(n => n.id === id)!;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "680px", margin: "0 auto" }}>
      {/* SVG Diagram */}
      <svg
        viewBox={VIEWBOX}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
        aria-label="Hukou System interactive diagram"
      >
        <defs>
          {/* Animated dash for highlighted edges */}
          <filter id="glow-accent">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-node">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges */}
        {edges.map(({ a, b }) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          const active = hoveredId && (isConnected(a) && isConnected(b));
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke={active ? "rgba(200,16,46,0.6)" : "rgba(255,255,255,0.08)"}
              strokeWidth={active ? "0.35" : "0.2"}
              strokeDasharray={active ? "1 1.5" : "none"}
              animate={{
                strokeDashoffset: active ? [0, -6] : 0,
                opacity: hoveredId ? (active ? 1 : 0.15) : 0.7,
              }}
              transition={{
                strokeDashoffset: { repeat: Infinity, duration: 1.2, ease: "linear" },
                opacity: { duration: 0.2 },
                stroke: { duration: 0.2 },
                strokeWidth: { duration: 0.2 },
              }}
              filter={active ? "url(#glow-accent)" : undefined}
            />
          );
        })}

        {/* Nodes */}
        {hukouNodes.map((node) => {
          const isCenter = node.id === "center";
          const hovered = hoveredId === node.id;
          const connected = isConnected(node.id);
          const dimmed = isDimmed(node.id);
          const r = isCenter ? 7 : 4.5;

          return (
            <g
              key={node.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setActiveNode(node)}
              role="button"
              aria-label={node.title}
            >
              {/* Outer pulse ring */}
              {(hovered || (isCenter && !hoveredId)) && (
                <motion.circle
                  cx={node.x} cy={node.y} r={r + 2}
                  fill="none"
                  stroke="rgba(200,16,46,0.3)"
                  strokeWidth="0.5"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
              )}

              {/* Main circle */}
              <motion.circle
                cx={node.x} cy={node.y} r={r}
                fill={isCenter ? "var(--accent)" : hovered || connected ? "rgba(200,16,46,0.25)" : "rgba(255,255,255,0.06)"}
                stroke={isCenter ? "var(--accent)" : hovered ? "rgba(200,16,46,0.8)" : connected ? "rgba(200,16,46,0.4)" : "rgba(255,255,255,0.12)"}
                strokeWidth={isCenter ? "0" : "0.3"}
                animate={{ opacity: dimmed ? 0.2 : 1 }}
                transition={{ duration: 0.2 }}
                filter={hovered ? "url(#glow-node)" : undefined}
              />

              {/* Inner dot for non-center */}
              {!isCenter && (
                <motion.circle
                  cx={node.x} cy={node.y} r={1.2}
                  fill={hovered || connected ? "var(--accent)" : "rgba(255,255,255,0.35)"}
                  animate={{ opacity: dimmed ? 0.2 : 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Label */}
              {node.label.split("\n").map((line, li) => (
                <motion.text
                  key={li}
                  x={node.x}
                  y={node.y + r + 2.5 + li * 3.5}
                  textAnchor="middle"
                  fontSize={isCenter ? "2.6" : "2.2"}
                  fontWeight={isCenter ? "700" : hovered ? "600" : "500"}
                  fill={isCenter ? "#fff" : hovered || connected ? "#fff" : "rgba(255,255,255,0.55)"}
                  fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                  animate={{ opacity: dimmed ? 0.2 : 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ userSelect: "none", letterSpacing: "-0.02em" }}
                >
                  {line}
                </motion.text>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Floating info panel */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            key="hukou-panel"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "absolute",
              top: "0",
              right: "-300px",
              width: "272px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-hover)",
              borderRadius: "12px",
              padding: "18px",
              zIndex: 30,
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "8px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.015em", lineHeight: 1.3 }}>
                {activeNode.title}
              </h4>
              <button onClick={() => setActiveNode(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, display: "flex" }}>
                <X size={13} />
              </button>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "12px" }}>
              {activeNode.summary}
            </p>
            <div style={{ padding: "9px 11px", background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.15)", borderLeft: "2px solid var(--accent)", borderRadius: "6px", marginBottom: activeNode.relatedVideos.length > 0 ? "12px" : "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                <Quotes size={9} color="var(--accent)" weight="fill" />
                <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--accent)" }}>Key Fact</span>
              </div>
              <p style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.55, margin: 0 }}>{activeNode.fact}</p>
            </div>
            {activeNode.relatedVideos.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "7px" }}>
                  <VideoCamera size={9} color="var(--text-muted)" />
                  <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)" }}>Archive Videos</span>
                </div>
                {activeNode.relatedVideos.slice(0, 3).map((v, i) => (
                  <div key={i} style={{ padding: "5px 8px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px", fontSize: "10px", color: "var(--text-secondary)", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                    {v}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
