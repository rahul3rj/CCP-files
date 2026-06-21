"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpenText } from "@phosphor-icons/react";
import { TopicNavigation } from "./TopicNavigation";
import { SectionHeading } from "./SectionHeading";
import { HukouDiagram } from "./HukouDiagram";
import { HierarchyDiagram } from "./HierarchyDiagram";
import { AnimatedTimeline } from "./AnimatedTimeline";
import { RelationshipGraph } from "./RelationshipGraph";
import { KnowledgeReelGrid } from "@/app/components/knowledge/KnowledgeReelGrid";import type { TopicId } from "./knowledgeData";
import { topics, tibetEvents, xinjiangEvents } from "./knowledgeData";

interface Props {
  onNavigate?: (page: string) => void;
}

export function Knowledge({ onNavigate }: Props) {
  const [activeTopicId, setActiveTopicId] = useState<TopicId>("hukou");
  const contentRef = useRef<HTMLDivElement>(null);

  function handleTopicChange(id: TopicId) {
    setActiveTopicId(id);
    if (contentRef.current) {
      const top = contentRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  const topic = topics.find(t => t.id === activeTopicId)!;

  return (
    <div style={{ flex: 1, minHeight: "100vh", paddingTop: "60px", paddingBottom: "60px", background: "var(--bg-primary)" }} className="knowledge-page">
      {/* ── Hero ── */}
      <KnowledgeHero />

      {/* ── Sticky Topic Nav ── */}
      <div
        style={{
          position: "sticky",
          top: "60px",
          zIndex: 30,
          background: "rgba(5,5,5,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          padding: "10px clamp(16px,4vw,48px)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Scrollable tab strip */}
          <div
            className="knowledge-topic-scroll"
            style={{
              overflowX: "auto",
              flex: 1,
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              padding: "3px 0",
            }}
          >
            <TopicNavigation active={activeTopicId} onChange={handleTopicChange} />
          </div>
        </div>
      </div>

      {/* ── Topic content ── */}
      <div ref={contentRef} style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTopicId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {/* Topic intro */}
            <div style={{ padding: "56px 0 48px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ maxWidth: "720px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ width: "14px", height: "1px", background: "var(--accent)" }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>
                    {topic.subtitle}
                  </span>
                </div>
                <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1, color: "#fff", marginBottom: "16px" }}>
                  {topic.label}
                </h1>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "580px" }}>
                  {topic.intro}
                </p>
              </div>
            </div>

            {/* Topic body */}
            <TopicBody topicId={activeTopicId} onNavigate={onNavigate} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Per-topic body ─────────────────────────────────────────────────────────────
function TopicBody({ topicId, onNavigate }: { topicId: TopicId; onNavigate?: (p: string) => void }) {

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* ── Interactive Diagram ── */}
      <section style={{ padding: "56px 0 48px", borderBottom: "1px solid var(--border)" }}>
        {topicId === "hukou" && (
          <>
            <SectionHeading
              label="Interactive Diagram"
              title="The Hukou Web"
              subtitle="Each node represents a domain controlled by the Hukou system. Hover to trace dependencies. Click to explore."
            />
            {/* Wrap in relative container for panel positioning */}
            <div style={{ position: "relative", padding: "0 clamp(0px,2vw,40px)" }}>
              <HukouDiagram />
            </div>
          </>
        )}
        {topicId === "hierarchy" && (
          <>
            <SectionHeading
              label="Social Hierarchy"
              title="The Four Occupations Similar to Varna system"
              subtitle="Confucian class structure that ordered Chinese society for 2,000 years. Select a tier to explore its past and present."
            />
            <HierarchyDiagram />
          </>
        )}
        {topicId === "tibet" && (
          <>
            <SectionHeading
              label="Historical Timeline"
              title="Tibet: A Record"
              subtitle="From independence to occupation to cultural erasure. Every event is a node in the evidence chain."
            />
            <AnimatedTimeline events={tibetEvents} />
          </>
        )}
        {topicId === "xinjiang" && (
          <>
            <SectionHeading
              label="Evidence Timeline"
              title="The Xinjiang Record"
              subtitle="A decade-by-decade documentation built from testimony, leaked documents, and satellite imagery."
            />
            <AnimatedTimeline events={xinjiangEvents} />
          </>
        )}
      </section>

      {/* ── Knowledge Graph ── */}
      <section style={{ padding: "56px 0 48px", borderBottom: "1px solid var(--border)" }}>
        <RelationshipGraph topicId={topicId} />
      </section>

      {/* ── Archive Videos ── */}
      <section style={{ padding: "56px 0 0" }}>
        <KnowledgeReelGrid topicId={topicId} onNavigateToArchive={() => onNavigate?.("Home")} />
      </section>
    </div>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────
function KnowledgeHero() {
  return (
    <section
      style={{
        position: "relative",
        padding: "40px clamp(16px,4vw,48px) 36px",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* Very subtle grid — pulled back compared to archive */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 100% at 20% 50%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 100% at 20% 50%, black 20%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "32px", flexWrap: "wrap" }}>
        {/* Left: compact label + title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
            <BookOpenText size={11} color="var(--accent)" />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Knowledge
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              · Interactive Learning
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#fff",
            margin: 0,
          }}>
            Understand the System
            <span style={{ color: "rgba(255,255,255,0.28)" }}> — interactively.</span>
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "460px", margin: 0 }}>
            Click nodes. Explore timelines. Connect the dots. Every diagram is a doorway into the evidence.
          </p>
        </motion.div>

        {/* Right: compact stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}
        >
          {[
            { n: "4", label: "Topics" },
            { n: "20+", label: "Nodes" },
            { n: "30+", label: "Events" },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
                {n}
              </div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "3px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

