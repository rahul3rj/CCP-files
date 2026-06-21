"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlass,
  Archive,
  Globe,
  Brain,
  UploadSimple,
  X,
  ArrowRight,
} from "@phosphor-icons/react";

type Props = {
  active: string;
  onNavigate: (page: string) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
};

const NAV_ITEMS = [
  { id: "Home",      label: "Archive",   icon: Archive },
  { id: "Map",       label: "Map",       icon: Globe   },
  { id: "Knowledge", label: "Knowledge", icon: Brain   },
];

export function Navbar({ active, onNavigate, onSearch, searchQuery: externalQuery }: Props) {
  const [scrolled,  setScrolled]  = useState(false);
  const [searching, setSearching] = useState(false);
  const [query,     setQuery]     = useState(externalQuery ?? "");

  useEffect(() => {
    if (externalQuery !== undefined) setQuery(externalQuery);
  }, [externalQuery]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ════════════ TOP HEADER ════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center"
        style={{
          height: "60px",
          background: scrolled ? "rgba(5,5,5,0.96)" : "rgba(5,5,5,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
          transition: "background 0.3s ease, border-color 0.3s ease",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => onNavigate("Home")}
          className="flex items-center gap-2.5 flex-shrink-0"
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="Home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="CCP Files"
            style={{ width: "32px", height: "32px", objectFit: "contain", flexShrink: 0 }}
          />
          <div className="hidden sm:block">
            <span style={{
              fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
              fontSize: "22px",
              fontWeight: 400,
              color: "#fff",
              letterSpacing: "0.08em",
              lineHeight: 1,
              display: "block",
            }}>
              CCP Files
            </span>
          </div>
        </button>

        {/* Desktop: centered nav links */}
        <nav
          className="hidden md:flex items-center gap-1"
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
        >
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                style={{
                  padding: "6px 14px", borderRadius: "6px",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  border: "none", cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">

          {/* Search input — desktop only */}
          <div
            className="hidden md:flex items-center gap-2"
            style={{
              padding: "7px 12px", borderRadius: "7px",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${searching ? "var(--border-hover)" : "var(--border)"}`,
              width: "200px", flexShrink: 0, transition: "border-color 0.15s",
            }}
          >
            <MagnifyingGlass size={13} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => {
                const v = e.target.value;
                setQuery(v);
                setSearching(v.length > 0);
                onSearch?.(v);
                if (v && active !== "Home") onNavigate("Home");
              }}
              onFocus={() => setSearching(true)}
              onBlur={() => { if (!query) setSearching(false); }}
              placeholder="Search archive"
              style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "12px", flex: 1, minWidth: 0 }}
              onKeyDown={e => { if (e.key === "Escape") { setSearching(false); setQuery(""); onSearch?.(""); (e.target as HTMLInputElement).blur(); } }}
            />
            {query && (
              <button onClick={() => { setSearching(false); setQuery(""); onSearch?.(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, display: "flex", padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Mirror Sites button — desktop */}
          <MirrorButton className="hidden md:flex" />

          {/* Submit — desktop */}
          <button
            onClick={() => onNavigate("Upload")}
            className="hidden md:flex items-center gap-1.5"
            style={{
              padding: "7px 14px", borderRadius: "7px",
              background: "var(--accent)", color: "#fff",
              fontSize: "12px", fontWeight: 600, border: "none",
              cursor: "pointer", letterSpacing: "-0.01em",
              transition: "opacity 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <UploadSimple size={13} weight="bold" />
            Submit
          </button>

          {/* Mobile: current page title (so header isn't empty) */}
          <span
            className="md:hidden"
            style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}
          >
            {active === "Home" ? "Archive" : active}
          </span>
        </div>
      </header>

      {/* ════════════ MOBILE BOTTOM NAV ════════════ */}
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          height: "60px",
          background: "rgba(5,5,5,0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid var(--border)",
          alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {[...NAV_ITEMS, { id: "Upload", label: "Submit", icon: UploadSimple }].map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const isSubmit = id === "Upload";
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive
                  ? (isSubmit ? "var(--accent)" : "#fff")
                  : "rgba(255,255,255,0.38)",
                padding: "6px 0 4px",
                position: "relative",
                transition: "color 0.15s",
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <span style={{
                  position: "absolute",
                  top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: "24px", height: "2px",
                  borderRadius: "0 0 2px 2px",
                  background: isSubmit ? "var(--accent)" : "#fff",
                }} />
              )}
              <Icon size={19} weight={isActive ? "fill" : "regular"} />
              <span style={{
                fontSize: "9px",
                fontWeight: isActive ? 700 : 400,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                {label}
              </span>
            </button>
          );
        })}

        {/* Mirror Sites — mobile bottom nav item */}
        <MirrorBottomNavItem />
      </nav>
    </>
  );
}

/* ─────────────────────────────────────────────
   MIRROR SITES — fetched live from /api/mirrors
───────────────────────────────────────────── */
type MirrorStatus = {
  id: string;
  label: string;
  url: string;
  region: string;
  online: boolean;
  latencyMs: number | null;
};

function useMirrors() {
  const [mirrors, setMirrors] = useState<MirrorStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch("/api/mirrors", { cache: "no-store" })
      .then(r => r.json())
      .then((data: MirrorStatus[]) => setMirrors(data))
      .catch(() => setMirrors([]))
      .finally(() => setLoading(false));
  }, []);

  return { mirrors, loading, refresh };
}

/* ─────────────────────────────────────────────
   MIRROR BUTTON — desktop navbar
───────────────────────────────────────────── */
function MirrorButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { mirrors, loading, refresh } = useMirrors();

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) refresh(); // fetch status on open
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ zIndex: 60 }}>
      <button
        id="mirror-sites-btn"
        onClick={handleOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 13px",
          borderRadius: "7px",
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
          border: `1px solid ${open ? "var(--border-hover)" : "var(--border)"}`,
          color: open ? "#fff" : "rgba(255,255,255,0.45)",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "-0.01em",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="12" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Mirror Sites
      </button>

      {open && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 58 }} onClick={() => setOpen(false)} />
          <MirrorPanel mirrors={mirrors} loading={loading} onRefresh={refresh} onClose={() => setOpen(false)} align="right" />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MIRROR ITEM — mobile bottom nav
───────────────────────────────────────────── */
function MirrorBottomNavItem() {
  const [open, setOpen] = useState(false);
  const { mirrors, loading, refresh } = useMirrors();

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) refresh();
  }

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: open ? "#fff" : "rgba(255,255,255,0.38)",
          padding: "6px 0 4px",
          transition: "color 0.15s",
        }}
        aria-label="Mirror Sites"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span style={{ fontSize: "9px", fontWeight: 400, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Mirrors
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 58 }} onClick={() => setOpen(false)} />
          <MirrorPanel mirrors={mirrors} loading={loading} onRefresh={refresh} onClose={() => setOpen(false)} align="left" mobile />
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   SHARED PANEL — with live status indicators
───────────────────────────────────────────── */
function MirrorPanel({
  mirrors, loading, onRefresh, onClose, align, mobile,
}: {
  mirrors: MirrorStatus[];
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
  align: "left" | "right";
  mobile?: boolean;
}) {
  const onlineCount = mirrors.filter(m => m.online).length;

  return (
    <div
      role="dialog"
      aria-label="Mirror Sites"
      style={{
        position: "fixed",
        ...(mobile
          ? { bottom: "68px", left: "50%", transform: "translateX(-50%)", width: "calc(100vw - 32px)", maxWidth: "380px" }
          : { top: "68px", right: align === "right" ? "16px" : undefined, left: align === "left" ? "16px" : undefined, width: "340px" }),
        zIndex: 59,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        overflow: "hidden",
        animation: "noteSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px 10px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
            Mirror Sites
          </span>
          {/* Online count badge */}
          {mirrors.length > 0 && (
            <span style={{
              fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: 700,
              background: onlineCount > 0 ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)",
              border: `1px solid ${onlineCount > 0 ? "rgba(34,197,94,0.25)" : "rgba(248,113,113,0.25)"}`,
              color: onlineCount > 0 ? "#22c55e" : "#f87171",
            }}>
              {onlineCount}/{mirrors.length} online
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh mirror status"
            style={{
              background: "none", border: "none", cursor: loading ? "default" : "pointer",
              color: "rgba(255,255,255,0.35)", padding: "2px", lineHeight: 1,
              transition: "color 0.15s",
              animation: loading ? "spin 0.8s linear infinite" : "none",
              display: "flex",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            {/* Refresh icon */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: "2px", lineHeight: 1, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            aria-label="Close"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Warning note */}
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
          If this site is blocked or taken down, use a mirror below. All mirrors share the same archive data.
        </p>
      </div>

      {/* Site list */}
      <div style={{ padding: "6px 0" }}>
        {loading && mirrors.length === 0 ? (
          /* Loading skeleton */
          [1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px" }}>
              <div className="skeleton" style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "80px", height: "12px", borderRadius: "4px", marginBottom: "5px" }} />
                <div className="skeleton" style={{ width: "140px", height: "10px", borderRadius: "4px" }} />
              </div>
              <div className="skeleton" style={{ width: "48px", height: "18px", borderRadius: "4px" }} />
            </div>
          ))
        ) : mirrors.length === 0 ? (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "16px", textAlign: "center" }}>
            No mirrors configured yet
          </p>
        ) : (
          mirrors.map((mirror) => (
            <a
              key={mirror.id}
              href={mirror.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center",
                padding: "10px 16px", textDecoration: "none",
                transition: "background 0.12s", gap: "12px",
                opacity: mirror.online ? 1 : 0.55,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Status dot */}
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                background: mirror.online ? "#22c55e" : "#f87171",
                boxShadow: mirror.online ? "0 0 6px rgba(34,197,94,0.6)" : "none",
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                    {mirror.label}
                  </span>
                  <span style={{ fontSize: "9.5px", color: "var(--text-muted)", padding: "1px 5px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {mirror.region}
                  </span>
                </div>
                <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.28)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {mirror.url}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                {/* Latency / status badge */}
                <span style={{
                  fontSize: "9.5px", padding: "2px 7px", borderRadius: "4px", whiteSpace: "nowrap",
                  background: mirror.online ? "rgba(34,197,94,0.08)" : "rgba(248,113,113,0.08)",
                  border: `1px solid ${mirror.online ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`,
                  color: mirror.online ? "#22c55e" : "#f87171",
                  fontWeight: 600,
                }}>
                  {mirror.online
                    ? mirror.latencyMs !== null ? `${mirror.latencyMs}ms` : "Online"
                    : "Offline"}
                </span>
                {mirror.online && <ArrowRight size={11} style={{ color: "rgba(255,255,255,0.25)" }} />}
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 16px 12px", borderTop: "1px solid var(--border)", fontSize: "10px", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
        Bookmark all mirrors · Share with others if main site is down
      </div>
    </div>
  );
}
