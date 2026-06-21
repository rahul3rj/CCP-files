"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, VideoCamera } from "@phosphor-icons/react";
import { VideoCard } from "../VideoCard";
import { ShortsPlayer } from "../ShortsPlayer";
import type { Reel } from "../../data/reels";

// ── Topic → category filter map ───────────────────────────────────────────────
// Maps each knowledge topic to the category IDs that are relevant.
// Falls back to a keyword search on title/description if no category matches.
const TOPIC_CATEGORIES: Record<string, string[]> = {
  hukou:     ["housing", "rural", "education", "healthcare", "factory", "society"],
  hierarchy: ["factory", "education", "economy", "society", "youth"],
  tibet:     ["protest", "censorship", "society"],
  xinjiang:  ["protest", "censorship", "society"],
};

// Keyword fallback — if the archive is sparse, we also search titles
const TOPIC_KEYWORDS: Record<string, string[]> = {
  hukou:     ["hukou", "migrant", "rural", "registration", "left-behind"],
  hierarchy: ["factory", "gaokao", "class", "merchant", "jack ma", "crackdown"],
  tibet:     ["tibet", "tibetan", "dalai", "lama", "monastery", "xinjiang"],
  xinjiang:  ["xinjiang", "uyghur", "uighur", "camp", "detention", "muslim"],
};

interface Props {
  topicId: string;
  onNavigateToArchive?: () => void;
}

export function KnowledgeReelGrid({ topicId, onNavigateToArchive }: Props) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState(4);

  // Fetch + filter
  useEffect(() => {
    setLoading(true);
    fetch("/api/archive")
      .then(r => r.ok ? r.json() : [])
      .then((data: Reel[]) => {
        const cats = TOPIC_CATEGORIES[topicId] ?? [];
        const keywords = (TOPIC_KEYWORDS[topicId] ?? []).map(k => k.toLowerCase());

        const filtered = data.filter(reel => {
          // Skip article-type entries
          if ((reel as unknown as { type?: string }).type === "article") return false;
          // Category match
          if (cats.includes(reel.category?.toLowerCase() ?? "")) return true;
          // Keyword match on title or description
          const haystack = `${reel.title} ${reel.description ?? ""}`.toLowerCase();
          return keywords.some(kw => haystack.includes(kw));
        });

        setReels(filtered);
      })
      .catch(() => setReels([]))
      .finally(() => setLoading(false));
  }, [topicId]);

  // Responsive columns — same breakpoints as main Feed
  const updateColumns = useCallback(() => {
    const w = window.innerWidth;
    if      (w >= 1600) setColumns(5);
    else if (w >= 1200) setColumns(4);
    else if (w >= 900)  setColumns(3);
    else if (w >= 600)  setColumns(2);
    else                setColumns(1);
  }, []);

  useEffect(() => {
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [updateColumns]);

  return (
    <div style={{ paddingBottom: "48px" }}>
      {/* ── Section header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "14px", height: "1px", background: "var(--accent)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <VideoCamera size={13} color="var(--text-muted)" />
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Related Archive Videos
            </span>
          </div>
          {!loading && reels.length > 0 && (
            <span style={{
              fontSize: "10px",
              padding: "2px 7px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-muted)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {reels.length}
            </span>
          )}
        </div>

        {onNavigateToArchive && (
          <button
            onClick={onNavigateToArchive}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              color: "var(--text-muted)",
              transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            View Full Archive <ArrowRight size={10} style={{ marginLeft: "2px" }} />
          </button>
        )}
      </div>

      {/* ── States ── */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}
          >
            Loading archive…
          </motion.div>
        )}

        {!loading && reels.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: "48px 24px",
              textAlign: "center",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontSize: "13px", marginBottom: "6px", color: "var(--text-secondary)" }}>
              No archived videos for this topic yet.
            </p>
            <p style={{ fontSize: "11px" }}>
              Submit relevant footage via the Upload section.
            </p>
          </motion.div>
        )}

        {!loading && reels.length > 0 && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReelMasonryGrid reels={reels} columns={columns} onPlay={setPlayerIndex} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Shorts player overlay ── */}
      {playerIndex !== null && (
        <ShortsPlayer
          reels={reels}
          startIndex={playerIndex}
          onClose={() => setPlayerIndex(null)}
        />
      )}
    </div>
  );
}

// ── Masonry grid — identical layout to the main Feed ─────────────────────────
function ReelMasonryGrid({
  reels,
  columns,
  onPlay,
}: {
  reels: Reel[];
  columns: number;
  onPlay: (index: number) => void;
}) {
  // Distribute reels into columns (top-to-bottom fill, same as MasonryGrid)
  const cols: Reel[][] = Array.from({ length: columns }, () => []);
  reels.forEach((reel, i) => {
    cols[i % columns].push(reel);
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "12px",
        alignItems: "start",
      }}
    >
      {cols.map((col, ci) => (
        <div key={ci} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {col.map((reel) => {
            const globalIndex = reels.indexOf(reel);
            return (
              <VideoCard
                key={reel.id}
                reel={reel}
                index={globalIndex}
                onPlay={(r, idx) => onPlay(idx)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
