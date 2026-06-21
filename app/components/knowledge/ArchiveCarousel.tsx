"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, Play, Clock, User } from "@phosphor-icons/react";

interface ArchiveCardData {
  title: string;
  creator: string;
  duration: string;
  date: string;
  category: string;
  thumbnail: string;
}

// Placeholder archive cards — in production these would filter from real archive data
function getArchiveCards(topicId: string): ArchiveCardData[] {
  const cards: Record<string, ArchiveCardData[]> = {
    hukou: [
      { title: "Migrant Worker Denied Hospital Entry Without Urban ID", creator: "chinauncensored", duration: "3:42", date: "2024-03-15", category: "Human Rights", thumbnail: "https://picsum.photos/seed/hukou1/400/225" },
      { title: "Left-Behind Children: 69 Million Separated From Parents", creator: "nfchinese", duration: "8:12", date: "2024-01-20", category: "Society", thumbnail: "https://picsum.photos/seed/hukou2/400/225" },
      { title: "Factory Worker's Children Barred From City Schools", creator: "chinadigitaltimes", duration: "5:31", date: "2023-11-08", category: "Education", thumbnail: "https://picsum.photos/seed/hukou3/400/225" },
      { title: "Hukou Reform Announced — Again", creator: "sixthtone", duration: "4:05", date: "2023-09-22", category: "Policy", thumbnail: "https://picsum.photos/seed/hukou4/400/225" },
    ],
    hierarchy: [
      { title: "Gaokao: China's New Imperial Examination", creator: "cgtn_alt", duration: "6:55", date: "2024-06-07", category: "Education", thumbnail: "https://picsum.photos/seed/hier1/400/225" },
      { title: "Jack Ma's 'Voluntary' Disappearance Explained", creator: "nfchinese", duration: "9:20", date: "2023-12-15", category: "Economy", thumbnail: "https://picsum.photos/seed/hier2/400/225" },
      { title: "Tech Crackdown: $1 Trillion Wiped in Two Years", creator: "chinauncensored", duration: "7:40", date: "2023-10-03", category: "Technology", thumbnail: "https://picsum.photos/seed/hier3/400/225" },
      { title: "Factory Worker Conditions: Modern Gōng Class", creator: "sixthtone", duration: "11:05", date: "2024-02-14", category: "Labor", thumbnail: "https://picsum.photos/seed/hier4/400/225" },
    ],
    tibet: [
      { title: "150+ Self-Immolations: The Protest China Won't Show", creator: "rfa_tibetan", duration: "12:30", date: "2024-04-10", category: "Human Rights", thumbnail: "https://picsum.photos/seed/tibet1/400/225" },
      { title: "Sinicization: Tibetan Schools Replaced With Mandarin-Only", creator: "nfchinese", duration: "7:22", date: "2024-01-15", category: "Culture", thumbnail: "https://picsum.photos/seed/tibet2/400/225" },
      { title: "Panchen Lama: Abducted at Age 6, Not Seen Since", creator: "chinauncensored", duration: "6:08", date: "2023-11-30", category: "Human Rights", thumbnail: "https://picsum.photos/seed/tibet3/400/225" },
      { title: "Tibet's Monastery Count: From 6000 to Under 10", creator: "rfa_tibetan", duration: "8:45", date: "2023-09-18", category: "Religion", thumbnail: "https://picsum.photos/seed/tibet4/400/225" },
    ],
    xinjiang: [
      { title: "Xinjiang Police Files: Internal Evidence Released", creator: "nfchinese", duration: "15:20", date: "2024-05-22", category: "Investigation", thumbnail: "https://picsum.photos/seed/xinj1/400/225" },
      { title: "Survivor Testimony: Inside the Camps", creator: "chinadigitaltimes", duration: "18:45", date: "2024-03-08", category: "Human Rights", thumbnail: "https://picsum.photos/seed/xinj2/400/225" },
      { title: "Supply Chain: 80 Global Brands Linked to Forced Labor", creator: "rfa_uyghur", duration: "10:12", date: "2024-01-30", category: "Economy", thumbnail: "https://picsum.photos/seed/xinj3/400/225" },
      { title: "Transnational Repression: Diaspora Under Surveillance", creator: "chinauncensored", duration: "8:35", date: "2023-12-10", category: "Politics", thumbnail: "https://picsum.photos/seed/xinj4/400/225" },
    ],
  };
  return cards[topicId] ?? [];
}

interface Props {
  topicId: string;
  onNavigateToArchive?: () => void;
}

export function ArchiveCarousel({ topicId, onNavigateToArchive }: Props) {
  const cards = getArchiveCards(topicId);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "14px", height: "1px", background: "var(--accent)" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Related Archive Videos
          </span>
        </div>
        {onNavigateToArchive && (
          <button
            onClick={onNavigateToArchive}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
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
            View Full Archive <ArrowRight size={11} />
          </button>
        )}
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          paddingBottom: "8px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {cards.map((card, i) => (
          <ArchiveCard key={i} card={card} index={i} />
        ))}
      </div>
    </div>
  );
}

function ArchiveCard({ card, index }: { card: ArchiveCardData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 28 }}
      style={{ flexShrink: 0, width: "240px", cursor: "pointer" }}
      whileHover={{ y: -3 }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          overflow: "hidden",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        {/* Thumbnail */}
        <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.thumbnail}
            alt={card.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) saturate(0.75)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), filter 0.3s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.filter = "brightness(0.65) saturate(0.85)"; (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.filter = "brightness(0.5) saturate(0.75)"; (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
          />
          {/* Play overlay */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", pointerEvents: "none" }}
            className="play-overlay"
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={14} weight="fill" color="#000" />
            </div>
          </div>
          {/* Duration */}
          <div style={{ position: "absolute", bottom: "7px", right: "7px", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontFamily: "var(--font-geist-mono), monospace", color: "rgba(255,255,255,0.9)", fontWeight: 500, display: "flex", alignItems: "center", gap: "3px" }}>
            <Clock size={8} />
            {card.duration}
          </div>
          {/* Category */}
          <div style={{ position: "absolute", top: "7px", left: "7px", padding: "2px 7px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", borderRadius: "4px", fontSize: "8px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>
            {card.category}
          </div>
        </div>

        {/* Meta */}
        <div style={{ padding: "10px 12px 12px" }}>
          <p style={{ fontSize: "11.5px", fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, letterSpacing: "-0.01em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "8px" }}>
            {card.title}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <User size={9} color="var(--text-muted)" />
              <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>@{card.creator}</span>
            </div>
            <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{card.date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
