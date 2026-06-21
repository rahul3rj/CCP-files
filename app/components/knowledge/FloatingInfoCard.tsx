"use client";

import { X, VideoCamera, Quotes } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

export interface FloatingCardData {
  title: string;
  summary: string;
  fact: string;
  relatedVideos: string[];
  anchorX?: number; // 0-100 percentage for positioning hint
  anchorY?: number;
}

interface Props {
  data: FloatingCardData | null;
  onClose: () => void;
  position?: "left" | "right" | "auto";
}

export function FloatingInfoCard({ data, onClose, position = "auto" }: Props) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          style={{
            position: "absolute",
            top: "50%",
            [position === "left" ? "right" : "left"]: position === "auto" ? "calc(50% + 20px)" : position === "left" ? "calc(50% + 20px)" : "calc(50% + 20px)",
            transform: "translateY(-50%)",
            width: "280px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-hover)",
            borderRadius: "12px",
            padding: "18px",
            zIndex: 20,
            pointerEvents: "all",
            boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px", gap: "8px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.015em", lineHeight: 1.3, flex: 1 }}>
              {data.title}
            </h4>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px", flexShrink: 0, display: "flex" }}
              aria-label="Close"
            >
              <X size={13} />
            </button>
          </div>

          {/* Summary */}
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>
            {data.summary}
          </p>

          {/* Fact */}
          <div style={{
            padding: "10px 12px",
            background: "rgba(200,16,46,0.06)",
            border: "1px solid rgba(200,16,46,0.15)",
            borderLeft: "2px solid var(--accent)",
            borderRadius: "6px",
            marginBottom: data.relatedVideos.length > 0 ? "12px" : "0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
              <Quotes size={10} color="var(--accent)" weight="fill" />
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>Key Fact</span>
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, margin: 0 }}>{data.fact}</p>
          </div>

          {/* Related videos */}
          {data.relatedVideos.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "7px" }}>
                <VideoCamera size={10} color="var(--text-muted)" />
                <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  Archive Videos
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {data.relatedVideos.slice(0, 3).map((v, i) => (
                  <div key={i} style={{
                    padding: "5px 9px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
