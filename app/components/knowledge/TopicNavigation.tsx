"use client";

import { motion } from "motion/react";
import type { TopicId } from "./knowledgeData";
import { topics } from "./knowledgeData";

interface Props {
  active: TopicId;
  onChange: (id: TopicId) => void;
}

export function TopicNavigation({ active, onChange }: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        position: "relative",
        minWidth: "max-content",
      }}
    >
      {topics.map((topic) => {
        const isActive = active === topic.id;
        return (
          <button
            key={topic.id}
            onClick={() => onChange(topic.id)}
            style={{
              position: "relative",
              padding: "8px 16px",
              borderRadius: "7px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
              transition: "color 0.2s",
              letterSpacing: "-0.01em",
              zIndex: 1,
              whiteSpace: "nowrap",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="topic-pill"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "7px",
                  border: "1px solid var(--border-hover)",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {topic.label}
          </button>
        );
      })}
    </div>
  );
}
