"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  SlidersHorizontal,
  ArrowRight,
  TrendUp,
  ClockCounterClockwise,
  Fire,
  CaretDown,
  Funnel,
  X,
} from "@phosphor-icons/react";
import { MasonryGrid } from "./MasonryGrid";
import { ShortsPlayer } from "./ShortsPlayer";
import { categories, trendingTopics, type Reel } from "../data/reels";

const SORT_OPTIONS = [
  { id: "latest",   label: "Latest Added",  icon: ClockCounterClockwise },
  { id: "popular",  label: "Most Viewed",   icon: Fire                  },
  { id: "shortest", label: "Shortest",      icon: TrendUp               },
];

type Props = { onNavigate: (page: string) => void; searchQuery?: string };

/* ── Stat counter (animated) ── */
function StatCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setShow(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        display: "inline-block",
      }}
    >
      {value}
      {suffix}
    </span>
  );
}

export function Feed({ onNavigate, searchQuery: externalQuery }: Props) {
  const [playerIndex,     setPlayerIndex]     = useState<number | null>(null);
  const [activeCategory,  setActiveCategory]  = useState("all");
  const [searchQuery,     setSearchQuery]     = useState(externalQuery ?? "");
  const [activeTag,       setActiveTag]       = useState<string | null>(null);
  const [sortBy,          setSortBy]          = useState("latest");
  const [showSortMenu,    setShowSortMenu]     = useState(false);
  const [showFilters,     setShowFilters]      = useState(false);
  const [verifiedOnly,    setVerifiedOnly]     = useState(false);
  const [dateRange,       setDateRange]        = useState("all");
  const [allReels,        setAllReels]         = useState<Reel[]>([]);
  const [columns,         setColumns]          = useState(4);
  const [heroVisible,     setHeroVisible]      = useState(false);
  const [showNote,        setShowNote]         = useState(true);

  // Sync when navbar search changes
  useEffect(() => {
    if (externalQuery !== undefined) setSearchQuery(externalQuery);
  }, [externalQuery]);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Load only real archived reels from the server — no seed data mixed in
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/archive");
        const archived: Reel[] = res.ok ? await res.json() : [];
        setAllReels(prev => {
          // Only shuffle on first load (when prev is empty).
          // On focus re-fetches, merge in any new reels at the end to avoid
          // reshuffling and disrupting the currently-playing video.
          if (prev.length === 0) {
            // Fisher-Yates shuffle — randomise order on first load
            for (let i = archived.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [archived[i], archived[j]] = [archived[j], archived[i]];
            }
            return archived;
          }
          // On subsequent fetches, append only truly new reels (by id) to the end
          const existingIds = new Set(prev.map(r => r.id));
          const newReels = archived.filter(r => !existingIds.has(r.id));
          return newReels.length > 0 ? [...prev, ...newReels] : prev;
        });
      } catch {
        setAllReels(prev => prev.length > 0 ? prev : []);
      }
    }
    load();
    // Re-fetch when the window regains focus (e.g. user submitted from Upload tab)
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  // Responsive columns
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if      (w >= 1600) setColumns(5);
      else if (w >= 1200) setColumns(4);
      else if (w >= 900)  setColumns(3);
      else if (w >= 600)  setColumns(2);
      else                setColumns(1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = allReels.filter((r) => {
      const matchCat    = activeCategory === "all" || r.category === activeCategory;
      const matchTag    = !activeTag || (r.tags ?? []).includes(activeTag);
      const matchSearch = !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.tags ?? []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchVerified = !verifiedOnly || r.verified === true;
      let matchDate = true;
      if (dateRange !== "all" && r.archiveDate) {
        const archived = new Date(r.archiveDate);
        const diffDays = (now.getTime() - archived.getTime()) / 86400000;
        if (dateRange === "week")  matchDate = diffDays <= 7;
        if (dateRange === "month") matchDate = diffDays <= 30;
        if (dateRange === "year")  matchDate = diffDays <= 365;
      }
      return matchCat && matchTag && matchSearch && matchVerified && matchDate;
    });
    if (sortBy === "popular")  list = [...list].sort((a, b) => parseViews(b.views) - parseViews(a.views));
    if (sortBy === "shortest") list = [...list].sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    // default "latest": keep archive order (already newest-first from API)
    return list;
  }, [allReels, activeCategory, activeTag, searchQuery, sortBy, verifiedOnly, dateRange]);

  const currentSort = SORT_OPTIONS.find(o => o.id === sortBy) ?? SORT_OPTIONS[0];

  // Compute live stats from actual archive data
  const totalVideos  = allReels.length;
  const totalViews   = allReels.reduce((sum, r) => sum + parseViews(r.views), 0);
  const totalCreators = new Set(allReels.map(r => r.creator)).size;
  const totalCountries = new Set(allReels.map(r => r.country).filter(Boolean)).size;

  function formatViews(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
    return n > 0 ? n.toString() : "—";
  }

  const archiveStats = [
    { label: "Videos Archived", value: totalVideos > 0 ? totalVideos.toLocaleString() : "—" },
    { label: "Combined Views",  value: "1.4M+"                                                },
    { label: "Creators",        value: totalCreators > 0 ? totalCreators.toString() : "—"   },
    { label: "Countries",       value: totalCountries > 0 ? totalCountries.toString() : "—" },
  ];

  return (
    <div
      className="flex flex-col"
      style={{ background: "var(--bg-primary)", minHeight: "100vh", paddingTop: "60px" }}
    >
      {/* ════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "clamp(40px,6vw,80px) clamp(16px,4vw,48px) clamp(36px,5vw,72px)",
          borderBottom: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* ── Background image ── */}
        <div
        className="-scale-x-100"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/header.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            filter: "saturate(0.6) brightness(0.45)",
          }}
        />

        {/* ── Gradient overlays: bottom fade to black + left fade for text legibility ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(to bottom,
                rgba(5,5,5,0.55) 0%,
                rgba(5,5,5,0.25) 30%,
                rgba(5,5,5,0.55) 65%,
                rgba(5,5,5,0.95) 100%
              ),
              linear-gradient(to right,
                rgba(5,5,5,0.85) 0%,
                rgba(5,5,5,0.4)  40%,
                transparent      70%
              )
            `,
            pointerEvents: "none",
          }}
        />

        {/* Background grid */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Accent glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-40%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(200,16,46,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: "1400px", margin: "0 auto" }}>
          {/* Label */}
          <div
            className="fade-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              background: "rgba(200,16,46,0.08)",
              border: "1px solid rgba(200,16,46,0.2)",
              borderRadius: "100px",
              marginBottom: "28px",
              opacity: heroVisible ? undefined : 0,
            }}
          >
            <span className="live-dot" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(200,16,46,0.9)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Live Archive · Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-display fade-up delay-1"
            style={{
              maxWidth: "900px",
              marginBottom: "20px",
              opacity: heroVisible ? undefined : 0,
            }}
          >
            The Great Firewall of
            <br />
            <span style={{ color: "#AB0F28" }}>China</span>
          </h1>

          {/* Subheadline */}
          <p
            className="fade-up delay-2"
            style={{
              fontSize: "clamp(14px, 1.4vw, 17px)",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              lineHeight: 1.65,
              marginBottom: "40px",
              opacity: heroVisible ? undefined : 0,
            }}
          >
            A public archive of short videos collected from X documenting
            reality behind China&apos;s censorship apparatus.
            Search. Research. Investigate.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center gap-3 fade-up delay-3"
            style={{ marginBottom: "60px", opacity: heroVisible ? undefined : 0 }}
          >
            <button className="btn-primary" onClick={() => onNavigate("Knowledge")}>
              Know the Truth
              <ArrowRight size={14} weight="bold" />
            </button>
            <button className="btn-secondary" onClick={() => onNavigate("Map")}>
              View World Map
            </button>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap gap-6 fade-up delay-4"
            style={{ opacity: heroVisible ? undefined : 0 }}
          >
            {archiveStats.map(({ label, value }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  <StatCounter value={value} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", letterSpacing: "0.02em" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          TRENDING TOPICS
      ════════════════════════════════════ */}
      <section style={{ padding: "clamp(20px,4vw,32px) clamp(16px,4vw,48px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <TrendUp size={16} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Trending Topics
              </span>
            </div>
            {activeTag && (
              <button
                className="btn-ghost"
                style={{ fontSize: "12px", color: "var(--text-muted)" }}
                onClick={() => setActiveTag(null)}
              >
                <X size={11} style={{ display: "inline", marginRight: "3px" }} /> Clear filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {trendingTopics.map((topic, i) => {
              const isActive = activeTag === topic.tag;
              const count = allReels.filter(r => (r.tags ?? []).includes(topic.tag)).length;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTag(isActive ? null : topic.tag)}
                  className="flex-shrink-0"
                  style={{
                    padding: "10px 16px",
                    background: isActive ? "rgba(200,16,46,0.12)" : "var(--bg-card)",
                    border: `1px solid ${isActive ? "rgba(200,16,46,0.4)" : "var(--border)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.15s, transform 0.15s, background 0.15s",
                    animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both`,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.borderColor = "var(--border-hover)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, color: isActive ? "var(--accent)" : "#fff", marginBottom: "4px", whiteSpace: "nowrap" }}>
                    {topic.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {count} video{count !== 1 ? "s" : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FILTER BAR
      ════════════════════════════════════ */}
      <div
        className="sticky z-20"
        style={{
          top: "60px",
          padding: "12px clamp(16px,4vw,48px)",
          background: "rgba(5,5,5,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Category pills */}
          <div
            className="flex items-center gap-2 flex-1 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "20px", background: "var(--border)", flexShrink: 0 }} />

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowSortMenu(v => !v)}
              className="flex items-center gap-1.5"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "rgba(255,255,255,0.55)",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <currentSort.icon size={12} />
              <span style={{ color: "#fff", fontWeight: 600 }}>{currentSort.label}</span>
              <CaretDown size={10} style={{ opacity: 0.5 }} />
            </button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowSortMenu(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1.5 z-40"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    minWidth: "160px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                    overflow: "hidden",
                  }}
                >
                  {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { setSortBy(id); setShowSortMenu(false); }}
                      className="flex items-center gap-2 w-full text-left"
                      style={{
                        padding: "10px 14px",
                        background: sortBy === id ? "rgba(255,255,255,0.05)" : "transparent",
                        color: sortBy === id ? "#fff" : "var(--text-secondary)",
                        fontWeight: sortBy === id ? 600 : 400,
                        fontSize: "12px",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => { if (sortBy !== id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={e => { if (sortBy !== id) e.currentTarget.style.background = "transparent"; }}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${showFilters ? "var(--border-hover)" : "var(--border)"}`,
              background: showFilters ? "rgba(255,255,255,0.05)" : "transparent",
              color: showFilters ? "#fff" : "rgba(255,255,255,0.45)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <Funnel size={12} weight={showFilters ? "fill" : "regular"} />
            <span className="hidden sm:block">Filters</span>
          </button>

          {/* Count */}
          <span
            className="flex-shrink-0"
            style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}
          >
            {filtered.length.toLocaleString()} videos
          </span>
        </div>
      </div>

      {/* ── Advanced filters panel ── */}
      {showFilters && (
        <div
          style={{
            padding: "16px clamp(16px,4vw,48px)",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Verified toggle */}
            <div className="flex items-center gap-2">
              <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Verified Only
              </label>
              <button
                onClick={() => setVerifiedOnly(v => !v)}
                style={{
                  width: "32px", height: "18px", borderRadius: "9px",
                  background: verifiedOnly ? "var(--accent)" : "var(--bg-card)",
                  border: `1px solid ${verifiedOnly ? "var(--accent)" : "var(--border)"}`,
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s, border-color 0.2s",
                  flexShrink: 0,
                }}
                aria-label="Toggle verified only"
              >
                <span style={{
                  position: "absolute",
                  top: "2px",
                  left: verifiedOnly ? "16px" : "2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Date Range
              </label>
              <select
                className="input-base"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                style={{ padding: "4px 10px", fontSize: "12px", color: "var(--text-secondary)" }}
              >
                <option value="all">All time</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            <button
              onClick={() => {
                setActiveCategory("all");
                setActiveTag(null);
                setSearchQuery("");
                setVerifiedOnly(false);
                setDateRange("all");
                setShowFilters(false);
              }}
              className="flex items-center gap-1.5"
              style={{ fontSize: "11px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}
            >
              <X size={12} /> Clear all
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          MASONRY GRID
      ════════════════════════════════════ */}
      <div style={{ padding: "clamp(20px,4vw,32px) clamp(16px,4vw,48px) 80px", flex: 1 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          {/* Section heading */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {activeTag
                  ? trendingTopics.find(t => t.tag === activeTag)?.label ?? "Filtered"
                  : activeCategory === "all"
                    ? "Latest Additions"
                    : categories.find(c => c.id === activeCategory)?.label}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {filtered.length.toLocaleString()}
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{ padding: "80px 0", color: "var(--text-muted)" }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <SlidersHorizontal size={20} style={{ color: "var(--text-muted)" }} />
              </div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                No videos found
              </p>
              <p style={{ fontSize: "13px" }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <MasonryGrid
              reels={filtered}
              onPlay={(_, idx) => setPlayerIndex(idx)}
              columns={columns}
            />
          )}
        </div>
      </div>

      {/* ── Shorts player overlay ── */}
      {playerIndex !== null && (
        <ShortsPlayer
          reels={filtered}
          startIndex={playerIndex}
          onClose={() => setPlayerIndex(null)}
        />
      )}

      {/* ── NOTE toast (bottom-right) ── */}
      {showNote && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            maxWidth: "340px",
            width: "calc(100vw - 48px)",
            background: "linear-gradient(135deg, rgba(30,6,6,0.97) 0%, rgba(50,8,8,0.97) 100%)",
            border: "1px solid rgba(200,16,46,0.45)",
            borderRadius: "12px",
            padding: "16px 18px",
            boxShadow: "0 8px 32px rgba(200,16,46,0.18), 0 2px 8px rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            animation: "noteSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "rgba(200,16,46,1)",
                  boxShadow: "0 0 6px rgba(200,16,46,0.8)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(200,16,46,0.95)",
                }}
              >
                NOTE — To Non Indians
              </span>
            </div>
            <button
              onClick={() => setShowNote(false)}
              aria-label="Dismiss note"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1,
                flexShrink: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              <X size={14} weight="bold" />
            </button>
          </div>

          {/* Body */}
          <p
            style={{
              fontSize: "12.5px",
              lineHeight: 1.65,
              color: "rgba(255,220,220,0.82)",
              margin: 0,
            }}
          >
            The disturbing videos of India currently circulating online are part of a coordinated bot campaign designed to damage our reputation. Just as it is unfair to judge the people of China based on the disturbing videos that come from there, please don't let cherry-picked negativity manipulate you into generalizing 1.4 billion Indians. Every country has its bad sides, but those worst moments do not define an entire nation.
          </p>
        </div>
      )}
    </div>
  );
}

function parseViews(v: string): number {
  if (v.endsWith("M")) return parseFloat(v) * 1_000_000;
  if (v.endsWith("K")) return parseFloat(v) * 1_000;
  return parseFloat(v) || 0;
}
function parseDuration(d: string): number {
  const parts = d.split(":").map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
}
