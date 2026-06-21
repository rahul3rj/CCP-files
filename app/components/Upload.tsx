"use client";

import { useState, useEffect } from "react";
import {
  Link as LinkIcon,
  CheckCircle,
  Trash,
  ArrowRight,
  X as XIcon,
  WarningCircle,
  UploadSimple,
  Archive,
  Shield,
  Eye,
  ArrowLeft,
  MapPin,
  Tag,
  VideoCamera,
  Plus,
} from "@phosphor-icons/react";
import { extractTweetId, categories, trendingTopics, type Reel } from "../data/reels";
import { suggestCities, type ChinaCity } from "../data/chinaCities";

/* ── Helpers ───────────────────────────────────────────────── */
function isTwimgMp4(url: string): boolean {
  try {
    const u = new URL(url);
    return (u.hostname === "video.twimg.com" || u.hostname === "pbs.twimg.com")
      && u.pathname.endsWith(".mp4");
  } catch { return false; }
}

type Resolved = {
  videoUrl: string;
  thumbnail: string | null;
  author: string;
  avatarUrl: string | null;
  tweetText: string;
  durationMs: number;
  aspectRatio: number;
};

/* ── All predefined tags (categories + trending topics) ────── */
const ALL_TAGS = [
  ...categories.filter(c => c.id !== "all").map(c => ({ id: c.id, label: c.label, group: "category" as const })),
  ...trendingTopics.map(t => ({ id: `trend-${t.id}`, label: t.label, group: "trending" as const })),
];

/* ── API helpers ───────────────────────────────────────────── */
async function fetchArchive(): Promise<Reel[]> {
  try {
    const res = await fetch("/api/archive");
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function saveToArchive(reel: Reel): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reel),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Save failed" };
    return { ok: true };
  } catch { return { ok: false, error: "Network error" }; }
}

async function deleteFromArchive(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/archive?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? `Server error ${res.status}` };
    return { ok: true };
  } catch { return { ok: false, error: "Network error" }; }
}

type Props = { onNavigate: (page: string) => void };

export function Upload({ onNavigate }: Props) {
  // ── Video form state ─────────────────────────────────────────
  const [url,            setUrl]            = useState("");
  const [title,          setTitle]          = useState("");
  const [category,       setCategory]       = useState("factory");
  const [tags,           setTags]           = useState<string[]>([]);
  const [location,       setLocation]       = useState("");
  const [citySuggestions, setCitySuggestions] = useState<ChinaCity[]>([]);
  const [showSuggestions,  setShowSuggestions]  = useState(false);
  const [resolving,      setResolving]      = useState(false);
  const [resolved,       setResolved]       = useState<Resolved | null>(null);
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState("");
  const [saved,          setSaved]          = useState<Reel[]>([]);
  const [saving,         setSaving]         = useState(false);
  const [deleting,       setDeleting]       = useState<string | null>(null); // id being deleted
  const [deleteError,    setDeleteError]    = useState("");
  const [activeStep,     setActiveStep]     = useState<1 | 2 | 3>(1);
  const [showVideoUrl,   setShowVideoUrl]   = useState(false);
  const [manualVideoUrl, setManualVideoUrl] = useState("");

  // Load from server on mount
  useEffect(() => {
    fetchArchive().then(setSaved); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // Auto-resolve URL
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolved(null);
    setError("");
    setSuccess("");
    if (!url.trim()) return;

    if (isTwimgMp4(url.trim())) {
      const resMatch = url.match(/\/(\d+)x(\d+)\//);
      const w = resMatch ? Number(resMatch[1]) : 16;
      const h = resMatch ? Number(resMatch[2]) : 9;
      setResolved({ videoUrl: url.trim(), thumbnail: null, author: "unknown", avatarUrl: null, tweetText: "", durationMs: 0, aspectRatio: w / h });
      setActiveStep(2);
      return;
    }

    const resolvedUrl = url.trim()
      .replace(/^https?:\/\/(www\.)?twitter\.com\//, "https://xcancel.com/")
      .replace(/^https?:\/\/(www\.)?x\.com\//, "https://xcancel.com/");

    if (resolvedUrl !== url.trim()) { setUrl(resolvedUrl); return; }

    const tweetId = extractTweetId(resolvedUrl);
    if (!tweetId) return;

    setResolving(true);
    fetch(`/api/resolve-tweet?url=${encodeURIComponent(resolvedUrl)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setResolved(data as Resolved);
        // Auto-fill title from tweet text; fall back to @author
        if (!title) {
          const text = (data.tweetText ?? "").trim();
          setTitle(text || (data.author ? `@${data.author}` : "Untitled"));
        }
        setActiveStep(2);
      })
      .catch(e => setError(e.message ?? "Could not resolve video"))
      .finally(() => setResolving(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function toggleTag(id: string) {
    setTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  async function addReel() {
    if (!resolved) { setError("Paste a valid X post URL or direct video.twimg.com URL"); return; }
    if (!title.trim()) { setError("Add a title"); return; }

    const isDirect = isTwimgMp4(url.trim());
    const tweetId  = isDirect ? null : extractTweetId(url);
    const reelId   = isDirect ? `direct-${Date.now()}` : `tweet-${tweetId}`;

    if (saved.find(r => r.id === reelId)) {
      setError("This post is already in the archive");
      return;
    }

    const ms  = resolved.durationMs;
    const sec = Math.round(ms / 1000);
    const duration = sec > 0
      ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`
      : "—";

    // Prefer manually entered video URL over the auto-resolved one
    const finalVideoUrl = manualVideoUrl.trim() || resolved.videoUrl;

    const newReel: Reel & { location?: string; tags?: string[] } = {
      id:          reelId,
      tweetUrl:    isDirect ? undefined : url,
      tweetId:     tweetId ?? undefined,
      videoUrl:    finalVideoUrl,
      thumbnail:   resolved.thumbnail ?? undefined,
      avatarUrl:   resolved.avatarUrl ?? undefined,
      title:       title.trim(),
      creator:     resolved.author || "unknown",
      views:       "—",
      duration,
      category,
      aspectRatio: resolved.aspectRatio || 1.77,
      archiveDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      country:     location.trim() || undefined,
      // store tags as a custom field — Reel type is extended server-side
      ...(tags.length > 0 ? { tags } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
    };

    setSaving(true);
    const result = await saveToArchive(newReel as Reel);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not save to archive");
      return;
    }

    setSaved(prev => [newReel as Reel, ...prev]);
    setSuccess("Archived successfully");
    setUrl(""); setTitle(""); setResolved(null); setError("");
    setTags([]); setLocation(""); setCategory("factory");
    setManualVideoUrl(""); setShowVideoUrl(false);
    setCitySuggestions([]); setShowSuggestions(false);
    setActiveStep(3);
  }

  async function deleteReel(id: string) {
    setDeleting(id);
    setDeleteError("");
    const result = await deleteFromArchive(id);
    setDeleting(null);
    if (result.ok) {
      setSaved(prev => prev.filter(r => r.id !== id));
    } else {
      setDeleteError(result.error ?? "Could not delete");
    }
  }

  const canSubmit = !!resolved && title.trim().length > 0 && !resolving && !saving;
  const inputCategories = categories.filter(c => c.id !== "all");
  const trendingTagItems = ALL_TAGS.filter(t => t.group === "trending");

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        paddingTop: "60px",
        background: "var(--bg-primary)",
      }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          padding: "36px clamp(16px,4vw,48px) 32px",
          borderBottom: "1px solid var(--border)",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => onNavigate("Home")}
          className="flex items-center gap-2 mb-6"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "12px", padding: 0, transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={13} /> Back to Archive
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Archive size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Archive Submission
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#fff", marginBottom: "10px" }}>
              Submit Evidence
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "480px", lineHeight: 1.6 }}>
              Paste an X post URL to extract and archive the video. All submissions are saved to the server archive.
            </p>
          </div>

          <div className="hidden md:flex flex-col gap-2">
            {[
              { icon: Shield,  text: "Source preserved"    },
              { icon: Eye,     text: "Publicly accessible" },
              { icon: Archive, text: "Permanently archived" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={12} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div
        className="upload-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          gap: "32px",
          padding: "clamp(20px,4vw,40px) clamp(16px,4vw,48px) 80px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── Left: form ── */}
        <div>
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[{ n: 1, label: "Paste URL" }, { n: 2, label: "Edit details" }, { n: 3, label: "Archived" }].map(({ n, label }, i) => {
              const isDone   = activeStep > n;
              const isActive = activeStep === n;
              return (
                <div key={n} className="flex items-center gap-2">
                  <div
                    style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: isDone ? "var(--accent)" : isActive ? "#fff" : "var(--bg-card)",
                      border: isDone || isActive ? "none" : "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 700,
                      color: isDone ? "#fff" : isActive ? "#000" : "var(--text-muted)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isDone ? <CheckCircle size={14} weight="fill" /> : n}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "var(--text-muted)", transition: "color 0.2s" }}>
                    {label}
                  </span>
                  {i < 2 && (
                    <div style={{ width: "32px", height: "1px", background: isDone ? "var(--accent)" : "var(--border)", marginLeft: "4px", transition: "background 0.3s" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Success state */}
          {activeStep === 3 && success ? (
            <div style={{ padding: "32px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", textAlign: "center", animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
              <CheckCircle size={40} weight="fill" color="#22c55e" style={{ marginBottom: "16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Video Archived</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                The video has been successfully saved to the server archive.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="btn-primary" onClick={() => { setActiveStep(1); setSuccess(""); }}>Archive Another</button>
                <button className="btn-secondary" onClick={() => onNavigate("Home")}>View Archive</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* URL input */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Source URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowVideoUrl(v => !v)}
                    className="flex items-center gap-1.5"
                    style={{
                      padding: "3px 9px",
                      borderRadius: "5px",
                      background: showVideoUrl ? "rgba(200,16,46,0.1)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${showVideoUrl ? "rgba(200,16,46,0.3)" : "var(--border)"}`,
                      color: showVideoUrl ? "var(--accent)" : "var(--text-muted)",
                      fontSize: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {showVideoUrl
                      ? <><XIcon size={9} /> Remove video URL</>
                      : <><Plus size={9} /> Add video URL</>
                    }
                  </button>
                </div>

                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 14px", borderRadius: "8px",
                    border: `1px solid ${resolved ? "rgba(34,197,94,0.3)" : error ? "rgba(248,113,113,0.3)" : "var(--border-hover)"}`,
                    background: "var(--bg-card)", transition: "border-color 0.2s",
                  }}
                >
                  <LinkIcon size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://x.com/user/status/… or video.twimg.com/…"
                    className="input-base"
                    style={{ flex: 1, background: "transparent", border: "none", fontSize: "13px", padding: 0 }}
                    autoFocus
                  />
                  {resolving && <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />}
                  {!resolving && resolved && <CheckCircle size={16} weight="fill" color="#22c55e" style={{ flexShrink: 0 }} />}
                  {!resolving && error && url && <WarningCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />}
                  {url && (
                    <button onClick={() => { setUrl(""); setResolved(null); setError(""); setActiveStep(1); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>
                      <XIcon size={13} />
                    </button>
                  )}
                </div>

                {/* Manual video URL override */}
                {showVideoUrl && (
                  <div style={{ marginTop: "10px", animation: "fadeUp 0.18s cubic-bezier(0.16,1,0.3,1) both" }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "11px 14px", borderRadius: "8px",
                        border: `1px solid ${manualVideoUrl.trim() ? "rgba(200,16,46,0.3)" : "var(--border)"}`,
                        background: "var(--bg-card)",
                      }}
                    >
                      <VideoCamera size={14} style={{ color: manualVideoUrl.trim() ? "var(--accent)" : "var(--text-muted)", flexShrink: 0 }} />
                      <input
                        type="url"
                        value={manualVideoUrl}
                        onChange={e => setManualVideoUrl(e.target.value)}
                        placeholder="Direct video URL (optional — overrides auto-resolved)"
                        className="input-base"
                        style={{ flex: 1, background: "transparent", border: "none", fontSize: "13px", padding: 0 }}
                        autoFocus
                      />
                      {manualVideoUrl && (
                        <button onClick={() => setManualVideoUrl("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>
                          <XIcon size={12} />
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "5px" }}>
                      Paste a direct .mp4 URL to use instead of the auto-resolved one. The X.com link is still used to pull the tweet text and creator.
                    </p>
                  </div>
                )}

                {resolved && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px", padding: "12px 14px", borderRadius: "8px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", animation: "fadeUp 0.25s cubic-bezier(0.16,1,0.3,1) both" }}>
                    {resolved.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolved.thumbnail} alt="" style={{ width: "56px", height: "40px", objectFit: "cover", borderRadius: "5px", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e", marginBottom: "2px" }}>
                        ✓ {manualVideoUrl.trim() ? "Tweet fetched · custom video URL will be used" : "Video found"}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        @{resolved.author} · {resolved.aspectRatio.toFixed(2)} AR
                        {resolved.durationMs > 0 && ` · ${Math.round(resolved.durationMs / 1000)}s`}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="flex items-center gap-1.5 mt-2" style={{ fontSize: "12px", color: "#f87171" }}>
                    <WarningCircle size={13} /> {error}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Title
                  </label>
                  {resolved?.tweetText && title === resolved.tweetText && (
                    <span style={{ fontSize: "10px", color: "rgba(34,197,94,0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={10} weight="fill" /> Auto-filled from tweet
                    </span>
                  )}
                </div>
                <textarea
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Descriptive title for this archived video…"
                  className="input-base"
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", fontSize: "13px", resize: "vertical", lineHeight: 1.5 }}
                />
                {resolved?.author && (
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                    Creator: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>@{resolved.author}</span>
                  </p>
                )}
              </div>

              {/* Location with city autocomplete */}
              <div style={{ position: "relative" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  <MapPin size={11} style={{ display: "inline", marginRight: "5px", verticalAlign: "middle" }} />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => {
                    const val = e.target.value;
                    setLocation(val);
                    const suggestions = suggestCities(val);
                    setCitySuggestions(suggestions);
                    setShowSuggestions(suggestions.length > 0 && val.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (location.trim()) {
                      const suggestions = suggestCities(location);
                      setCitySuggestions(suggestions);
                      setShowSuggestions(suggestions.length > 0);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="e.g. Beijing, Shenzhen, Hong Kong…"
                  className="input-base"
                  style={{ width: "100%", padding: "12px 14px", fontSize: "13px" }}
                  autoComplete="off"
                />

                {/* Autocomplete dropdown */}
                {showSuggestions && citySuggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      marginTop: "4px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-hover)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      animation: "fadeUp 0.12s cubic-bezier(0.16,1,0.3,1) both",
                    }}
                  >
                    {citySuggestions.map(city => (
                      <button
                        key={city.name}
                        type="button"
                        onMouseDown={() => {
                          setLocation(city.name);
                          setShowSuggestions(false);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 14px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          borderBottom: "1px solid var(--border)",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <MapPin size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>
                            {city.name}
                          </span>
                          {city.nameCN && (
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>
                              {city.nameCN}
                            </span>
                          )}
                        </div>
                        {city.province && (
                          <span style={{ fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>
                            {city.province}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "5px" }}>
                  Start typing a Chinese city — suggestions will appear
                </p>
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {inputCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`category-pill ${category === cat.id ? "active" : ""}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  <Tag size={11} style={{ display: "inline", marginRight: "5px", verticalAlign: "middle" }} />
                  Tags
                  {tags.length > 0 && (
                    <span style={{ marginLeft: "6px", padding: "1px 6px", background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)", borderRadius: "4px", color: "var(--accent)", fontSize: "9px", fontWeight: 700 }}>
                      {tags.length} selected
                    </span>
                  )}
                </label>

                {/* Trending tags */}
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                    Trending Topics
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trendingTagItems.map(tag => {
                      const active = tags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          style={{
                            padding: "4px 11px",
                            borderRadius: "5px",
                            background: active ? "rgba(200,16,46,0.12)" : "transparent",
                            border: `1px solid ${active ? "rgba(200,16,46,0.35)" : "var(--border)"}`,
                            color: active ? "var(--accent)" : "var(--text-secondary)",
                            fontSize: "11px",
                            fontWeight: active ? 700 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {active && <XIcon size={9} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />}
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {tags.length > 0 && (
                  <button
                    onClick={() => setTags([])}
                    style={{ fontSize: "11px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <XIcon size={10} /> Clear all tags
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={addReel}
                  disabled={!canSubmit}
                  className="flex items-center gap-2"
                  style={{
                    padding: "11px 22px", borderRadius: "8px",
                    background: canSubmit ? "#fff" : "rgba(255,255,255,0.07)",
                    color: canSubmit ? "#000" : "rgba(255,255,255,0.2)",
                    fontWeight: 600, fontSize: "13px", border: "none",
                    cursor: canSubmit ? "pointer" : "default",
                    transition: "background 0.15s", letterSpacing: "-0.01em",
                  }}
                >
                  {saving
                    ? <><div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", animation: "spin 0.7s linear infinite" }} /> Saving…</>
                    : <><Archive size={14} /> Archive Video</>
                  }
                </button>
                <button
                  onClick={() => onNavigate("Home")}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "13px", padding: "8px", transition: "color 0.15s" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
      </div>

        {/* ── Right: submission list ── */}
        <div>
          <div style={{ padding: "20px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Submitted Videos</h3>
              <span style={{ fontSize: "11px", padding: "2px 8px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)" }}>
                {saved.length}
              </span>
            </div>

            {saved.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center" }}>
                <UploadSimple size={24} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No submissions yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "420px", overflowY: "auto" }}>
                {deleteError && (
                  <p style={{ fontSize: "11px", color: "#f87171", padding: "6px 10px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "6px", margin: "0 0 4px" }}>
                    ✕ {deleteError}
                  </p>
                )}
                {saved.map(r => {
                  const rWithMeta = r as Reel & { location?: string; tags?: string[] };
                  const isDeleting = deleting === r.id;
                  return (
                    <div
                      key={r.id}
                      className="flex items-start gap-3"
                      style={{
                        padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: "8px", animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
                        opacity: isDeleting ? 0.5 : 1, transition: "opacity 0.2s",
                      }}
                    >
                      {r.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.thumbnail} alt="" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "5px", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "5px", background: "var(--bg-elevated)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Archive size={14} style={{ color: "var(--text-muted)" }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.title}
                        </p>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                          @{r.creator} · {r.category} · {r.duration}
                        </p>
                        {(rWithMeta.location || (rWithMeta.tags && rWithMeta.tags.length > 0)) && (
                          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "4px" }}>
                            {rWithMeta.location && (
                              <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "2px" }}>
                                <MapPin size={9} /> {rWithMeta.location}
                              </span>
                            )}
                            {rWithMeta.tags?.slice(0, 2).map(tag => (
                              <span key={tag} style={{ fontSize: "9px", padding: "1px 5px", background: "rgba(200,16,46,0.08)", border: "1px solid rgba(200,16,46,0.18)", borderRadius: "3px", color: "var(--accent)", fontWeight: 600 }}>
                                {ALL_TAGS.find(t => t.id === tag)?.label ?? tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteReel(r.id)}
                        disabled={deleting !== null}
                        style={{
                          background: "none", border: "none",
                          cursor: deleting !== null ? "default" : "pointer",
                          color: "var(--text-muted)", flexShrink: 0, padding: "4px",
                          transition: "color 0.15s", marginTop: "1px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                        aria-label="Remove"
                        onMouseEnter={e => { if (!deleting) e.currentTarget.style.color = "#f87171"; }}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        {isDeleting
                          ? <div style={{ width: "13px", height: "13px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "#f87171", animation: "spin 0.7s linear infinite" }} />
                          : <Trash size={13} />
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {saved.length > 0 && (
              <button className="btn-secondary w-full justify-center mt-3" style={{ width: "100%", marginTop: "12px" }} onClick={() => onNavigate("Home")}>
                View in Archive <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* Guidelines */}
          <div style={{ marginTop: "16px", padding: "16px", background: "rgba(200,16,46,0.04)", border: "1px solid rgba(200,16,46,0.12)", borderRadius: "10px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "10px" }}>
              Submission Guidelines
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                "Only public X posts are accepted",
                "Do not submit private or stolen content",
                "Preserve original source attribution",
                "Add accurate category, location and title",
                "Report inaccuracies via email",
              ].map(text => (
                <li key={text} className="flex items-start gap-2" style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--accent)", marginTop: "2px", flexShrink: 0 }}>·</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
