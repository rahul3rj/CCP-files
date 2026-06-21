"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import type { GraphNode, TopicId } from "./knowledgeData";
import { knowledgeGraphs } from "./knowledgeData";

interface Props {
  topicId: TopicId;
}

export function RelationshipGraph({ topicId }: Props) {
  const nodes = knowledgeGraphs[topicId];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const activeId = focusedId ?? hoveredId;

  const isHighlighted = useCallback((nodeId: string): boolean => {
    if (!activeId) return false;
    if (nodeId === activeId) return true;
    const active = nodes.find(n => n.id === activeId);
    return active ? active.connections.includes(nodeId) : false;
  }, [activeId, nodes]);

  const isDimmed = useCallback((nodeId: string): boolean => {
    if (!activeId) return false;
    return !isHighlighted(nodeId);
  }, [activeId, isHighlighted]);

  // Build edge list (deduplicated)
  const edges: { a: string; b: string }[] = [];
  const seen = new Set<string>();
  nodes.forEach(n => {
    n.connections.forEach(cid => {
      const key = [n.id, cid].sort().join("-");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ a: n.id, b: cid });
      }
    });
  });

  const getNode = (id: string) => nodes.find(n => n.id === id)!;
  const activeNode = activeId ? nodes.find(n => n.id === activeId) : null;

  return (
    <div style={{ position: "relative" }}>
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <div style={{ width: "14px", height: "1px", background: "var(--border)" }} />
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Relationship Graph
        </span>
        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>· Hover or click nodes to explore</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "24px", alignItems: "center" }}>
        {/* SVG Graph */}
        <div style={{ position: "relative" }}>
          <svg
            viewBox="0 0 100 100"
            style={{ width: "100%", maxWidth: "480px", height: "auto", overflow: "visible" }}
          >
            <defs>
              <filter id="graph-glow">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Edges */}
            {edges.map(({ a, b }) => {
              const na = getNode(a);
              const nb = getNode(b);
              if (!na || !nb) return null;
              const active = activeId && isHighlighted(a) && isHighlighted(b);
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={na.x} y1={na.y}
                  x2={nb.x} y2={nb.y}
                  stroke={active ? "rgba(200,16,46,0.5)" : "rgba(255,255,255,0.07)"}
                  strokeWidth={active ? "0.4" : "0.18"}
                  strokeDasharray={active ? "1 1.5" : undefined}
                  animate={{
                    opacity: activeId ? (active ? 1 : 0.12) : 0.8,
                    strokeDashoffset: active ? [0, -5] : 0,
                  }}
                  transition={{
                    opacity: { duration: 0.25 },
                    strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" },
                  }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isCentral = !!node.isCentral;
              const isActive = activeId === node.id;
              const highlighted = isHighlighted(node.id);
              const dimmed = isDimmed(node.id);
              const r = isCentral ? 6.5 : 3.8;

              return (
                <g
                  key={node.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setFocusedId(focusedId === node.id ? null : node.id)}
                >
                  {/* Pulse ring */}
                  {(isActive || (isCentral && !activeId)) && (
                    <motion.circle
                      cx={node.x} cy={node.y} r={r + 2.5}
                      fill="none"
                      stroke="rgba(200,16,46,0.25)"
                      strokeWidth="0.4"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    />
                  )}

                  {/* Circle */}
                  <motion.circle
                    cx={node.x} cy={node.y} r={r}
                    fill={isCentral ? "var(--accent)" : isActive ? "rgba(200,16,46,0.2)" : highlighted ? "rgba(200,16,46,0.1)" : "rgba(255,255,255,0.04)"}
                    stroke={isCentral ? "transparent" : isActive ? "var(--accent)" : highlighted ? "rgba(200,16,46,0.4)" : "rgba(255,255,255,0.1)"}
                    strokeWidth="0.3"
                    animate={{ opacity: dimmed ? 0.15 : 1 }}
                    transition={{ duration: 0.2 }}
                    filter={isActive ? "url(#graph-glow)" : undefined}
                  />

                  {/* Inner dot */}
                  {!isCentral && (
                    <motion.circle
                      cx={node.x} cy={node.y} r={1}
                      fill={highlighted ? "var(--accent)" : "rgba(255,255,255,0.3)"}
                      animate={{ opacity: dimmed ? 0.15 : 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Label */}
                  <motion.text
                    x={node.x}
                    y={node.y + r + 2.8}
                    textAnchor="middle"
                    fontSize={isCentral ? "2.4" : "2"}
                    fontWeight={isCentral || isActive ? "700" : "500"}
                    fill={isCentral ? "#fff" : highlighted ? "#fff" : "rgba(255,255,255,0.45)"}
                    fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                    animate={{ opacity: dimmed ? 0.15 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ userSelect: "none", letterSpacing: "-0.01em" }}
                  >
                    {node.label}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div style={{ minHeight: "160px" }}>
          {activeNode ? (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border-hover)", borderRadius: "10px" }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", marginBottom: "6px" }}>
                {activeNode.label}
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {activeNode.summary}
              </p>
              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {activeNode.connections.map(cid => {
                  const cn = nodes.find(n => n.id === cid);
                  if (!cn) return null;
                  return (
                    <span key={cid} style={{ fontSize: "9px", padding: "2px 7px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)" }}>
                      {cn.label}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-muted)", textAlign: "center" }}>
              <p style={{ fontSize: "11px", lineHeight: 1.6 }}>Hover or click a node to see its connections and context.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
