"use client";

import { useState, useEffect } from "react";
import { Navbar }      from "./components/Navbar";
import { Feed }        from "./components/Feed";
import { Upload }      from "./components/Upload";
import { MapView }     from "./components/MapView";
import { Knowledge }   from "./components/knowledge/Knowledge";
import { SubmitGate }  from "./components/SubmitGate";

export default function Home() {
  const [active,       setActive]       = useState("Home");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [showGate,     setShowGate]     = useState(false);

  // Live archive stats for the status bar
  const [videoCount,   setVideoCount]   = useState<number | null>(null);
  const [countryCount, setCountryCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/archive");
        if (!res.ok) return;
        const reels: { country?: string }[] = await res.json();
        setVideoCount(reels.length);
        setCountryCount(new Set(reels.map(r => r.country).filter(Boolean)).size);
      } catch {
        // silently fail — status bar just shows dashes
      }
    }
    loadStats();
    window.addEventListener("focus", loadStats);
    return () => window.removeEventListener("focus", loadStats);
  }, []);

  function navigate(page: string) {
    if (page === "Upload") {
      setShowGate(true);
      return;
    }
    setActive(page);
    if (page !== "Home") setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleGateSuccess() {
    setShowGate(false);
    setActive("Upload");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
  }

  return (
    <>
      <Navbar
        active={active}
        onNavigate={navigate}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {active === "Home"      && <Feed      onNavigate={navigate} searchQuery={searchQuery} />}
        {active === "Upload"    && <Upload    onNavigate={navigate} />}
        {active === "Map"       && <MapView />}
        {active === "Knowledge" && <Knowledge onNavigate={navigate} />}
      </main>

      {/* ── Password gate modal ── */}
      {showGate && (
        <SubmitGate
          onSuccess={handleGateSuccess}
          onClose={() => setShowGate(false)}
        />
      )}

      {/* ── Archive status bar ── */}
      <div
        className="hidden md:flex"
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 40,
          padding: "6px 24px",
          background: "rgba(5,5,5,0.90)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--border)",
          fontSize: "10px",
          color: "var(--text-muted)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="live-dot" style={{ width: "5px", height: "5px" }} />
            <span>Archive live · Updated {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <span>
            {videoCount !== null ? `${videoCount.toLocaleString()} videos preserved` : "— videos preserved"}
          </span>
          <span>
            {countryCount !== null ? `${countryCount} countries` : "— countries"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>Transparent Sources</span>
          <span>·</span>
          <span>Preserve Context</span>
          <span>·</span>
          <span>Protect Privacy</span>
        </div>
      </div>
    </>
  );
}
