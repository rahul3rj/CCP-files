"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, MagnifyingGlass, Funnel, ArrowsOut,
  Globe, X as XIcon, Play, Pause, ArrowLeft,
  SpeakerHigh, SpeakerSlash, ArrowUp, ArrowDown,
  CheckCircle, FilmStrip, Repeat,
} from "@phosphor-icons/react";
import type { Region } from "./BlackMarbleMap";
import { resolveVideoSrc, type Reel } from "../data/reels";
import { findCity } from "../data/chinaCities";

/* ── Fetch archive reels from server ─────────────────────────── */
async function fetchArchive(): Promise<Reel[]> {
  try {
    const res = await fetch("/api/archive");
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

/* ── Build Region list from archive + base city coordinates ─── */
function buildRegions(archiveReels: Reel[]): Region[] {
  // Group reels by normalised city name
  const byCity = new Map<string, { reels: Reel[]; cityObj: ReturnType<typeof findCity> }>();

  for (const reel of archiveReels) {
    const loc = (reel as Reel & { location?: string }).location ?? reel.country;
    if (!loc) continue;
    const city = findCity(loc);
    if (!city) continue;
    if (!byCity.has(city.name)) byCity.set(city.name, { reels: [], cityObj: city });
    byCity.get(city.name)!.reels.push(reel);
  }

  // Also include every known city that has at least one reel
  const regions: Region[] = [];
  byCity.forEach(({ reels: cityReels, cityObj }) => {
    if (!cityObj) return;
    const videoCount = cityReels.length;
    const intensity: "low" | "medium" | "high" =
      videoCount >= 5 ? "high" : videoCount >= 2 ? "medium" : "low";
    const topics = Array.from(
      new Set(cityReels.map(r => r.category).filter(Boolean))
    ).slice(0, 5) as string[];
    regions.push({
      id: cityObj.name.toLowerCase().replace(/\s+/g, "-").replace(/'/g, ""),
      name: cityObj.name,
      lat: cityObj.lat,
      lng: cityObj.lng,
      videos: videoCount,
      creators: new Set(cityReels.map(r => r.creator)).size,
      topics: topics.length > 0 ? topics : ["Uncategorised"],
      intensity,
    });
  });

  return regions;
}

/* ── Intensity legend ───────────────────────────────────────── */
const INTENSITY_COLORS = {
  high:   { dot: "rgba(200,16,46,0.95)", label: "High activity (5+ videos)"  },
  medium: { dot: "rgba(200,16,46,0.65)", label: "Medium activity (2–4 videos)" },
  low:    { dot: "rgba(200,16,46,0.35)", label: "Low activity (1 video)"     },
};

/* ── Lazy-load Leaflet (no SSR) ─────────────────────────────── */
const BlackMarbleMap = dynamic(
  () => import("./BlackMarbleMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          gap: "16px",
        }}
      >
        <Globe size={36} style={{ color: "rgba(255,255,255,0.15)", animation: "spin 2s linear infinite" }} />
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
          Loading Black Marble imagery…
        </div>
      </div>
    ),
  }
);

/* ── MapView (shell) ────────────────────────────────────────── */
export function MapView() {
  const [archiveReels,   setArchiveReels]   = useState<Reel[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [filterTopics,   setFilterTopics]   = useState<string[]>([]);
  const [search,         setSearch]         = useState("");
  const [showFilters,    setShowFilters]     = useState(false);
  const [showReels,      setShowReels]       = useState(false);
  const [reelIndex,      setReelIndex]       = useState(0);
  const [loopMode,       setLoopMode]        = useState(true); // default: loop
  // Mobile: show the ShortsPlayer overlay for city reels
  const [showMobileShortsPlayer, setShowMobileShortsPlayer] = useState(false);

  // Load archive on mount (and refresh every 30s while on the page)
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchArchive().then(data => {
        if (alive) { setArchiveReels(data); setLoading(false); }
      });
    load();
    const id = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Build regions from archive whenever archive changes
  const regions = useMemo(() => buildRegions(archiveReels), [archiveReels]);

  // Collect all unique topics across regions for the filter panel
  const allTopics = useMemo(
    () => Array.from(new Set(regions.flatMap(r => r.topics))).sort(),
    [regions]
  );

  // Reset reels drawer index when region changes (but keep drawer open)
  const prevSelectedId = useRef(selectedId);
  useEffect(() => {
    if (prevSelectedId.current !== selectedId) {
      setReelIndex(0);
      prevSelectedId.current = selectedId;
    }
  }, [selectedId]);

  const tileDate = "2016-01-01";

  const filteredIds = useMemo(() => {
    const ids = new Set<string>();
    regions.forEach(r => {
      const matchTopic  = filterTopics.length === 0 || r.topics.some(t => filterTopics.includes(t));
      const matchSearch = search.trim() === "" || r.name.toLowerCase().includes(search.toLowerCase());
      if (matchTopic && matchSearch) ids.add(r.id);
    });
    return ids;
  }, [filterTopics, search, regions]);

  const selectedRegion = regions.find(r => r.id === selectedId) ?? null;

  // Reels for the selected city — match by location field
  const regionReels = useMemo<Reel[]>(() => {
    if (!selectedRegion) return [];
    return archiveReels.filter(reel => {
      const loc = (reel as Reel & { location?: string }).location ?? reel.country ?? "";
      const city = findCity(loc);
      return city?.name === selectedRegion.name;
    });
  }, [selectedRegion, archiveReels]);

  const stats = [
    { label: "Cities with Videos", value: regions.length },
    { label: "Total Videos",       value: archiveReels.length },
    { label: "Total Creators",     value: new Set(archiveReels.map(r => r.creator)).size },
    { label: "High Activity",      value: regions.filter(r => r.intensity === "high").length },
  ];

  // Track whether we're on mobile (< 768px)
  const [isMobileMap, setIsMobileMap] = useState(false);
  useEffect(() => {
    const check = () => setIsMobileMap(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    if (id) {
      setShowReels(true);
      setReelIndex(0);
      // Mobile: do NOT auto-open — just show the floating popup
      if (isMobileMap) {
        setShowMobileShortsPlayer(false);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Map + optional side panels ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
      {/* ── Leaflet map (full area) ── */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }} className="map-leaflet-wrap">
        {regions.length === 0 && !loading ? (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", gap: "12px" }}>
            <MapPin size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              No videos with locations yet. Submit a video with a Chinese city location to see it on the map.
            </p>
          </div>
        ) : (
          <BlackMarbleMap
            regions={regions}
            filteredIds={filteredIds}
            selectedId={selectedId}
            onSelect={handleSelect}
            tileDate={tileDate}
            showPopup={!isMobileMap}
          />
        )}

        {/* ── MOBILE: compact top bar (replaces top-left + top-right split) ── */}
        <div
          className="flex md:hidden items-center gap-2"
          style={{
            position: "absolute", top: "12px", left: "12px", right: "12px", zIndex: 1000,
            background: "rgba(5,5,5,0.90)", backdropFilter: "blur(16px)",
            border: "1px solid var(--border)", borderRadius: "12px",
            padding: "8px 12px",
          }}
        >
          {/* Live dot + city count */}
          <span className="live-dot" style={{ width: "5px", height: "5px", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
            {loading ? "Loading…" : `${filteredIds.size} cities`}
          </span>
          {/* Stat pills */}
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginLeft: "4px" }}>
            {archiveReels.length} videos
          </span>
          <div style={{ flex: 1 }} />
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "rgba(255,255,255,0.06)", borderRadius: "6px", padding: "5px 8px",
            border: "1px solid var(--border)",
          }}>
            <MagnifyingGlass size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: "11px", color: "#fff",
                width: search ? "80px" : "50px",
                transition: "width 0.2s ease",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 0 }}>
                <XIcon size={10} />
              </button>
            )}
          </div>
          {/* Topics */}
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              padding: "5px 8px", borderRadius: "6px",
              background: showFilters ? "rgba(200,16,46,0.18)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${showFilters ? "rgba(200,16,46,0.4)" : "var(--border)"}`,
              color: showFilters ? "var(--accent)" : "var(--text-secondary)",
              fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            <Funnel size={11} weight={showFilters ? "fill" : "regular"} />
            {filterTopics.length > 0 && (
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: "8px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {filterTopics.length}
              </span>
            )}
          </button>
        </div>

        {/* ── DESKTOP: TOP-LEFT stats card ── */}
        <div
          className="hidden md:block"
          style={{
            position: "absolute", top: "16px", left: "16px", zIndex: 1000,
            background: "rgba(5,5,5,0.88)", backdropFilter: "blur(14px)",
            border: "1px solid var(--border)", borderRadius: "12px",
            padding: "10px 14px",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={11} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Source Map
            </span>
            {loading
              ? <span style={{ fontSize: "9px", color: "var(--text-muted)", marginLeft: "auto" }}>Loading…</span>
              : <span style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
                  <span className="live-dot" style={{ width: "4px", height: "4px" }} />
                  <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{filteredIds.size} cities</span>
                </span>
            }
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            {stats.map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP: TOP-RIGHT search + topics + fullscreen ── */}
        <div
          className="hidden md:flex items-center gap-2"
          style={{ position: "absolute", top: "16px", right: "16px", zIndex: 1000 }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(5,5,5,0.88)", backdropFilter: "blur(14px)",
            border: "1px solid var(--border)", borderRadius: "8px",
            padding: "6px 10px",
          }}>
            <MagnifyingGlass size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cities…"
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: "12px", color: "#fff",
                width: search ? "130px" : "90px",
                transition: "width 0.2s ease",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                <XIcon size={11} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              padding: "6px 10px", borderRadius: "8px",
              background: showFilters ? "rgba(200,16,46,0.18)" : "rgba(5,5,5,0.88)",
              backdropFilter: "blur(14px)",
              border: `1px solid ${showFilters ? "rgba(200,16,46,0.4)" : "var(--border)"}`,
              color: showFilters ? "var(--accent)" : "var(--text-secondary)",
              fontSize: "12px", cursor: "pointer", fontWeight: showFilters ? 700 : 400,
              display: "flex", alignItems: "center", gap: "5px",
            }}
          >
            <Funnel size={12} weight={showFilters ? "fill" : "regular"} />
            Topics
            {filterTopics.length > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "15px", height: "15px", borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: "9px", fontWeight: 700 }}>
                {filterTopics.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen?.(); }}
            style={{ width: "32px", height: "32px", background: "rgba(5,5,5,0.88)", backdropFilter: "blur(14px)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Fullscreen"
          >
            <ArrowsOut size={13} />
          </button>
        </div>

        {/* ── Topic filter dropdown ── */}
        {showFilters && allTopics.length > 0 && (
          <div
            style={{
              position: "absolute", top: "60px", right: "12px", left: "12px", zIndex: 1000,
              background: "rgba(8,8,8,0.97)", backdropFilter: "blur(16px)",
              border: "1px solid var(--border)", borderRadius: "10px",
              padding: "12px 14px",
              maxWidth: "380px",
              marginLeft: "auto",
              animation: "fadeUp 0.15s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", flexShrink: 0 }}>
                Filter by topic
              </span>
              {allTopics.map(topic => {
                const isActive = filterTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => setFilterTopics(prev => isActive ? prev.filter(t => t !== topic) : [...prev, topic])}
                    style={{
                      padding: "3px 9px", borderRadius: "5px",
                      background: isActive ? "rgba(200,16,46,0.12)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(200,16,46,0.3)" : "var(--border)"}`,
                      color: isActive ? "var(--accent)" : "var(--text-secondary)",
                      fontSize: "11px", fontWeight: isActive ? 700 : 400, cursor: "pointer",
                      whiteSpace: "nowrap", transition: "all 0.12s",
                    }}
                  >
                    {topic}
                  </button>
                );
              })}
              {filterTopics.length > 0 && (
                <button onClick={() => setFilterTopics([])} style={{ padding: "3px 9px", borderRadius: "5px", background: "transparent", border: "1px solid transparent", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  <XIcon size={10} /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Legend overlay (bottom-left, above credits) — desktop only ── */}
        <div className="hidden md:block" style={{ position: "absolute", bottom: "56px", left: "16px", zIndex: 1000, background: "rgba(5,5,5,0.88)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px 14px", pointerEvents: "none" }}>
          <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
            Archive Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {(["high", "medium", "low"] as const).map(level => (
              <div key={level} className="flex items-center gap-2">
                <div style={{ width: level === "high" ? 14 : level === "medium" ? 10 : 7, height: level === "high" ? 14 : level === "medium" ? 10 : 7, borderRadius: "50%", background: INTENSITY_COLORS[level].dot, border: "1.5px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{INTENSITY_COLORS[level].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tile credit badge ── */}
        <div style={{ position: "absolute", bottom: "16px", left: "16px", zIndex: 1000, display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(5,5,5,0.75)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "5px", pointerEvents: "none" }}>
          <Globe size={10} style={{ color: "rgba(255,255,255,0.4)" }} />
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.03em" }}>
            NASA Black Marble · VIIRS Day/Night Band
          </span>
        </div>
      </div>

        {/* ── Reels drawer — shown when a city is clicked, DESKTOP ONLY ── */}
        {selectedRegion && showReels && !isMobileMap && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "55vh",
              zIndex: 20,
              borderTop: "1px solid var(--border)",
            }}
            className="map-reels-drawer"
          >
            {/* Drawer header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "rgba(5,5,5,0.95)" }}>
              <div className="flex items-center gap-2">
                <FilmStrip size={13} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  Videos · {selectedRegion.name}
                </span>
                <span style={{ fontSize: "9px", padding: "1px 6px", background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)", borderRadius: "4px", color: "var(--accent)", fontWeight: 700 }}>
                  {regionReels.length}
                </span>
              </div>
              <button onClick={() => setShowReels(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "5px", color: "var(--text-muted)", cursor: "pointer", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close reels">
                <XIcon size={11} />
              </button>
            </div>

            {regionReels.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "32px" }}>
                <FilmStrip size={28} style={{ color: "rgba(255,255,255,0.1)" }} />
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                  No archived videos for {selectedRegion.name} yet.
                </p>
              </div>
            ) : (
              <>
                {/* Video player + nav only — reel list is in the right panel */}
                <div style={{ padding: "12px", flexShrink: 0, background: "#000" }}>
                  <MapVideoPlayer
                    reel={regionReels[reelIndex]}
                    loopMode={loopMode}
                    onEnded={loopMode ? undefined : () => setReelIndex(i => Math.min(i + 1, regionReels.length - 1))}
                  />
                  <div className="flex items-center justify-between" style={{ marginTop: "8px" }}>
                    <button onClick={() => setReelIndex(i => Math.max(i - 1, 0))} disabled={reelIndex === 0} style={{ padding: "5px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: reelIndex === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: reelIndex === 0 ? "default" : "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                      <ArrowUp size={11} /> Prev
                    </button>
                    <button
                      onClick={() => setLoopMode(v => !v)}
                      title={loopMode ? "Loop on — click to auto-advance" : "Auto-advance on — click to loop"}
                      style={{ padding: "5px 10px", borderRadius: "6px", background: loopMode ? "rgba(200,16,46,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${loopMode ? "rgba(200,16,46,0.35)" : "var(--border)"}`, color: loopMode ? "var(--accent)" : "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: loopMode ? 700 : 400, transition: "all 0.15s" }}
                    >
                      <Repeat size={11} weight={loopMode ? "fill" : "regular"} />
                      {loopMode ? "Loop" : "Auto"}
                    </button>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {reelIndex + 1} / {regionReels.length}
                    </span>
                    <button onClick={() => setReelIndex(i => Math.min(i + 1, regionReels.length - 1))} disabled={reelIndex === regionReels.length - 1} style={{ padding: "5px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: reelIndex === regionReels.length - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: reelIndex === regionReels.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                      Next <ArrowDown size={11} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Selected region info panel — DESKTOP ONLY ── */}
        {selectedRegion && !isMobileMap && (
          <div
            className="map-info-panel"
            style={{
              position: "absolute",
              bottom: showReels ? "55vh" : 0,
              left: 0,
              right: 0,
              maxHeight: "55vh",
              zIndex: 19,
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ padding: "20px" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)" }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    City Detail
                  </span>
                </div>
                <button onClick={() => { setSelectedId(null); setShowReels(false); }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "5px", color: "var(--text-muted)", cursor: "pointer", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close">
                  <XIcon size={12} />
                </button>
              </div>

              <h3 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.025em", color: "#fff", marginBottom: "6px" }}>
                {selectedRegion.name}
              </h3>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.22)", borderRadius: "4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "20px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 2s ease-in-out infinite" }} />
                {selectedRegion.intensity} activity
              </span>

              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-geist-mono), monospace", marginBottom: "16px", padding: "8px 10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                {selectedRegion.lat.toFixed(4)}°N, {selectedRegion.lng.toFixed(4)}°E
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                {[
                  { label: "Archived Videos", value: selectedRegion.videos   },
                  { label: "Unique Creators",  value: selectedRegion.creators },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "14px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.025em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>{value}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Categories */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
                  Categories
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedRegion.topics.map(t => (
                    <button key={t} onClick={() => setFilterTopics(prev => prev.includes(t) ? prev : [...prev, t])}
                      style={{ padding: "5px 10px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px", fontSize: "11px", color: "var(--text-secondary)", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Archived reels for this city */}
              {regionReels.length > 0 && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FilmStrip size={11} style={{ color: "var(--accent)" }} />
                    Archived Videos
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {regionReels.map((reel, idx) => (
                      <button
                        key={reel.id}
                        onClick={() => { setReelIndex(idx); setShowReels(true); }}
                        style={{
                          width: "100%", textAlign: "left", background: reelIndex === idx && showReels ? "rgba(200,16,46,0.07)" : "var(--bg-card)",
                          border: `1px solid ${reelIndex === idx && showReels ? "rgba(200,16,46,0.25)" : "var(--border)"}`,
                          borderRadius: "8px", padding: "10px 11px", cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = reelIndex === idx && showReels ? "rgba(200,16,46,0.25)" : "var(--border)"; }}
                      >
                        <div style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                          {/* Thumbnail */}
                          <div style={{ width: "44px", flexShrink: 0, borderRadius: "5px", overflow: "hidden", background: "#000", aspectRatio: reel.aspectRatio < 1 ? "9/16" : "16/9" }}>
                            {reel.thumbnail
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={reel.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Play size={12} weight="fill" style={{ color: "rgba(255,255,255,0.3)" }} />
                                </div>
                            }
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#fff", lineHeight: 1.4, marginBottom: "5px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {reel.title}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                              {[
                                { label: `@${reel.creator}` },
                                reel.duration !== "—" ? { label: reel.duration } : null,
                                reel.views && reel.views !== "—" ? { label: reel.views } : null,
                                reel.category ? { label: reel.category } : null,
                                reel.archiveDate ? { label: reel.archiveDate } : null,
                              ].filter(Boolean).map((item, i) => (
                                <span key={i} style={{ fontSize: "9px", color: "var(--text-muted)", padding: "1px 5px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", whiteSpace: "nowrap" }}>
                                  {(item as { label: string }).label}
                                </span>
                              ))}
                            </div>
                            {reel.verified && (
                              <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "4px" }}>
                                <CheckCircle size={9} weight="fill" style={{ color: "var(--accent)" }} />
                                <span style={{ fontSize: "9px", color: "var(--accent)", fontWeight: 600, letterSpacing: "0.03em" }}>Verified</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>{/* end map+panels row */}

      {/* ── MOBILE: Floating city popup (bottom-right, YouTube-style) ── */}
      {selectedRegion && isMobileMap && !showMobileShortsPlayer && (
        <div
          style={{
            position: "absolute",
            bottom: "76px", // above bottom nav (60px) + gap
            right: "12px",
            zIndex: 2000,
            width: "220px",
            background: "rgba(8,8,8,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(200,16,46,0.35)",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(200,16,46,0.15)",
            animation: "fadeUp 0.22s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Header */}
          <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                {selectedRegion.name}
              </span>
            </div>
            <button
              onClick={() => { setSelectedId(null); setShowReels(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "2px" }}
            >
              <XIcon size={12} />
            </button>
          </div>

          {/* Stats row */}
          <div style={{ padding: "8px 12px", display: "flex", gap: "12px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{selectedRegion.videos}</div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Videos</div>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{selectedRegion.creators}</div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Creators</div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontSize: "9px", padding: "2px 6px", background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.25)", borderRadius: "4px", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {selectedRegion.intensity}
              </span>
            </div>
          </div>

          {/* Play button */}
          {regionReels.length > 0 ? (
            <button
              onClick={() => { setShowMobileShortsPlayer(true); setReelIndex(0); }}
              style={{
                width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                background: "var(--accent)", border: "none", cursor: "pointer",
                color: "#fff", fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em",
              }}
            >
              <Play size={14} weight="fill" />
              Watch {regionReels.length} Clip{regionReels.length !== 1 ? "s" : ""}
            </button>
          ) : (
            <div style={{ padding: "12px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)" }}>
              No clips archived yet
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE: Full-screen ShortsPlayer for city reels ── */}
      {showMobileShortsPlayer && regionReels.length > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 3000 }}>
          <MapShortsPlayer
            reels={regionReels}
            startIndex={reelIndex}
            cityName={selectedRegion?.name ?? ""}
            onClose={() => setShowMobileShortsPlayer(false)}
          />
        </div>
      )}
    </div>
  );
}

/* ── MapVideoPlayer — compact inline player for the map reels drawer ── */
function MapVideoPlayer({ reel, loopMode, onEnded }: { reel: Reel; loopMode: boolean; onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(true);
  const [progress, setProgress] = useState(0);

  // Hard-stop audio on unmount (drawer close)
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v) { v.pause(); v.muted = true; }
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let alive = true;

    v.muted = true;
    setMuted(true);
    setProgress(0);
    setPlaying(false);

    const onCanPlay = () => {
      if (!alive) return;
      v.play()
        .then(() => {
          if (!alive) { v.pause(); v.muted = true; return; }
          setPlaying(true);
          v.muted = false;
          setMuted(false);
        })
        .catch(() => { if (alive) setPlaying(false); });
    };

    v.addEventListener("canplay", onCanPlay, { once: true });
    v.load();

    return () => {
      alive = false;
      v.removeEventListener("canplay", onCanPlay);
      v.pause();
      v.muted = true;
    };
  }, [reel.id]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else v.play().then(() => setPlaying(true)).catch(() => {});
  }, [playing]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(m => !m);
  }, [muted]);

  if (!reel.videoUrl) {
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", background: "#111", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>No video available</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: reel.aspectRatio < 1 ? "9/16" : "16/9",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#000",
        cursor: "pointer",
      }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        key={reel.id}
        src={resolveVideoSrc(reel.videoUrl)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onTimeUpdate={() => { const v = videoRef.current; if (v?.duration) setProgress((v.currentTime / v.duration) * 100); }}
        onEnded={onEnded}
        playsInline
        loop={loopMode}
      />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "5px", zIndex: 5 }} onClick={e => e.stopPropagation()}>
        <MiniCtrl onClick={togglePlay} label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={11} weight="fill" color="#fff" /> : <Play size={11} weight="fill" color="#fff" />}
        </MiniCtrl>
        <MiniCtrl onClick={toggleMute} label={muted ? "Unmute" : "Mute"}>
          {muted ? <SpeakerSlash size={11} weight="fill" color="#fff" /> : <SpeakerHigh size={11} weight="fill" color="#fff" />}
        </MiniCtrl>
      </div>
      {!playing && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Play size={18} weight="fill" color="#fff" />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", bottom: "8px", left: "10px", right: "10px", pointerEvents: "none" }}>
        {reel.verified && (
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle size={9} weight="fill" color="var(--accent)" />
            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Verified</span>
          </div>
        )}
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {reel.title}
        </p>
      </div>
      <div
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.12)", zIndex: 10, cursor: "pointer" }}
        onClick={e => { e.stopPropagation(); const v = videoRef.current; if (!v) return; const rect = e.currentTarget.getBoundingClientRect(); v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration; }}
      >
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.1s linear" }} />
      </div>
    </div>
  );
}

function MiniCtrl({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} style={{ width: "24px", height: "24px", borderRadius: "5px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      {children}
    </button>
  );
}

/* ── MapShortsPlayer — full-screen mobile reels player for a city ── */
function MapShortsPlayer({
  reels,
  startIndex,
  cityName,
  onClose,
}: {
  reels: Reel[];
  startIndex: number;
  cityName: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [loopMode, setLoopMode] = useState(true);

  const reel = reels[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < reels.length - 1) setCurrentIndex(i => i + 1);
  }, [currentIndex, reels.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowUp" || e.key === "k") goToPrev();
      if (e.key === "ArrowDown" || e.key === "j") goToNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goToNext, goToPrev, onClose]);

  return (
    <div style={{ width: "100%", height: "100dvh", background: "#000", position: "relative", overflow: "hidden" }}>
      {/* Video — full screen */}
      <MobileCityVideoPlayer
        reel={reel}
        loopMode={loopMode}
        onEnded={loopMode ? undefined : goToNext}
        onSwipeUp={goToNext}
        onSwipeDown={goToPrev}
      />

      {/* Top bar: Map back button + counter */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "48px 16px 16px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <button
          onClick={onClose}
          style={{
            pointerEvents: "all",
            display: "flex", alignItems: "center", gap: "7px",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px",
            color: "#fff", cursor: "pointer", padding: "8px 14px",
            fontSize: "13px", fontWeight: 600,
          }}
        >
          <ArrowLeft size={14} weight="bold" /> Map
        </button>

        <div style={{ pointerEvents: "all", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "5px 10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <MapPin size={11} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{cityName}</span>
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.4)", padding: "3px 9px", borderRadius: "10px" }}>
            {currentIndex + 1} / {reels.length}
          </span>
        </div>
      </div>

      {/* Right action strip */}
      <div
        style={{
          position: "absolute", right: "12px", bottom: "140px", zIndex: 30,
          display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
        }}
      >
        <button
          onClick={() => setLoopMode(v => !v)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
          }}
        >
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
            border: `1.5px solid ${loopMode ? "var(--accent)" : "rgba(255,255,255,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: loopMode ? "var(--accent)" : "rgba(255,255,255,0.9)",
          }}>
            <Repeat size={22} weight={loopMode ? "fill" : "regular"} />
          </div>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{loopMode ? "Loop" : "Auto"}</span>
        </button>
      </div>

      {/* Bottom info */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: "76px", zIndex: 30,
          padding: "60px 16px 80px",
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        }}
      >
        {/* Category pill */}
        {reel.category && (
          <span style={{
            display: "inline-block", marginBottom: "8px",
            padding: "3px 9px", background: "var(--accent)", borderRadius: "5px",
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#fff",
          }}>{reel.category}</span>
        )}

        {/* Title */}
        <p style={{
          margin: 0, fontSize: "14px", fontWeight: 600, color: "#fff", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}>{reel.title}</p>

        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
          @{reel.creator}
          {reel.archiveDate ? ` · ${reel.archiveDate}` : ""}
        </p>
      </div>
    </div>
  );
}

/* ── MobileCityVideoPlayer — full-screen video with swipe nav ── */
function MobileCityVideoPlayer({
  reel,
  loopMode,
  onEnded,
  onSwipeUp,
  onSwipeDown,
}: {
  reel: Reel;
  loopMode: boolean;
  onEnded?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<{ y: number; t: number } | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPulse, setShowPulse] = useState<"play" | "pause" | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let alive = true;

    v.pause();
    v.muted = true;
    setMuted(true);
    setProgress(0);
    setPlaying(false);

    const onCanPlay = () => {
      if (!alive) return;
      v.play()
        .then(() => {
          if (!alive) { v.pause(); return; }
          setPlaying(true);
          v.muted = false;
          setMuted(false);
        })
        .catch(() => { if (alive) setPlaying(false); });
    };

    v.addEventListener("canplay", onCanPlay, { once: true });
    v.load();

    return () => {
      alive = false;
      v.removeEventListener("canplay", onCanPlay);
      v.pause();
      v.muted = true;
    };
  }, [reel.id]);

  const pulse = (type: "play" | "pause") => {
    setShowPulse(type);
    setTimeout(() => setShowPulse(null), 650);
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); pulse("pause"); }
    else { v.play().then(() => { setPlaying(true); pulse("play"); }).catch(() => {}); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(m => !m);
  }, [muted]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, t: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    touchStart.current = null;

    if (Math.abs(dy) > 55 && dt < 380) {
      if (dy < 0) onSwipeUp?.(); else onSwipeDown?.();
      return;
    }
    if (Math.abs(dy) < 15 && dt < 260) {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
        toggleMute();
      } else {
        tapTimer.current = setTimeout(() => {
          tapTimer.current = null;
          togglePlay();
        }, 230);
      }
    }
  };

  if (!reel.videoUrl) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No video available</span>
      </div>
    );
  }

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "#000" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        key={reel.id}
        src={resolveVideoSrc(reel.videoUrl)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        onTimeUpdate={() => { const v = videoRef.current; if (v?.duration) setProgress((v.currentTime / v.duration) * 100); }}
        onEnded={onEnded}
        playsInline
        loop={loopMode}
      />

      {/* Gradients */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "160px", background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "240px", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)", pointerEvents: "none" }} />

      {/* Mute button */}
      <button
        onClick={e => { e.stopPropagation(); toggleMute(); }}
        style={{
          position: "absolute", top: "108px", right: "14px", zIndex: 35,
          width: "40px", height: "40px", borderRadius: "50%",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {muted
          ? <SpeakerSlash size={18} weight="fill" color="#fff" />
          : <SpeakerHigh size={18} weight="fill" color="#fff" />}
      </button>

      {/* Tap pulse feedback */}
      {showPulse && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "pulseIn 0.65s ease forwards",
          }}>
            {showPulse === "play"  && <Play  size={30} weight="fill" color="#fff" style={{ marginLeft: "3px" }} />}
            {showPulse === "pause" && <Pause size={30} weight="fill" color="#fff" />}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.15)", zIndex: 10 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.1s linear" }} />
      </div>
    </div>
  );
}

// (ArrowLeft imported at top of file)
