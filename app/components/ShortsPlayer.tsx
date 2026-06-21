"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, ArrowDown, ArrowUp,
  Heart, ShareNetwork,
  Pause, Play, SpeakerHigh, SpeakerSlash,
  X as XIcon, Repeat, DownloadSimple, CheckCircle, MapPin,
} from "@phosphor-icons/react";
import type { Reel } from "../data/reels";
import { resolveVideoSrc } from "../data/reels";

type Props = { reels: Reel[]; startIndex: number; onClose: () => void };
type Dims  = { w: number; h: number };

function calcDisplayDims(natW: number, natH: number): Dims {
  const maxH   = window.innerHeight * 0.88;
  const reserved = 340 + 100 + 80;
  const maxW   = Math.min(window.innerWidth * 0.55, window.innerWidth - reserved);
  const ar     = natW / natH;
  let h = maxH, w = h * ar;
  if (w > maxW) { w = maxW; h = w / ar; }
  return { w: Math.round(w), h: Math.round(h) };
}

export function ShortsPlayer({ reels, startIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [liked,        setLiked]        = useState(false);
  const [loopMode,     setLoopMode]     = useState(true);
  const [naturalDims,  setNaturalDims]  = useState<Dims | null>(null);
  const [displayDims,  setDisplayDims]  = useState<Dims | null>(null);
  // Detect mobile via window width — avoids dual-render audio bug
  const [isMobile,     setIsMobile]     = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const reel = reels[currentIndex];

  useEffect(() => { setNaturalDims(null); setDisplayDims(null); }, [currentIndex]);

  useEffect(() => {
    if (!naturalDims) return;
    const onResize = () => setDisplayDims(calcDisplayDims(naturalDims.w, naturalDims.h));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [naturalDims]);

  const handleVideoDims = useCallback((w: number, h: number) => {
    setNaturalDims({ w, h });
    setDisplayDims(calcDisplayDims(w, h));
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < reels.length - 1) setCurrentIndex(i => i + 1);
  }, [currentIndex, reels.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  // Keyboard nav (desktop)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape")                     onClose();
      if (e.key === "ArrowUp"   || e.key === "k") goToPrev();
      if (e.key === "ArrowDown" || e.key === "j") goToNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goToNext, goToPrev, onClose]);

  // Desktop wheel nav
  useEffect(() => {
    if (isMobile) return;
    let lastTime = Date.now();
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-scroll-panel]")) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = Date.now();
      if (now - lastTime < 800) return;
      if (Math.abs(e.deltaY) > 30) {
        e.preventDefault();
        if (e.deltaY > 0) goToNext(); else goToPrev();
        lastTime = now;
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goToNext, goToPrev, isMobile]);

  const panelH = displayDims?.h ?? 560;

  // ── Single VideoPlayer instance — no dual audio ──
  const videoPlayer = (
    <VideoPlayer
      reel={reel}
      loopMode={loopMode}
      onEnded={loopMode ? undefined : goToNext}
      onDimsReady={handleVideoDims}
      displayDims={isMobile ? null : displayDims}
      isMobile={isMobile}
      onSwipeUp={goToNext}
      onSwipeDown={goToPrev}
    />
  );

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" style={{ background: "#000" }}>

      {/* ════════════ MOBILE LAYOUT ════════════ */}
      {isMobile ? (
        <div style={{ width: "100%", height: "100dvh", position: "relative", background: "#000" }}>

          {/* Video fills the full screen */}
          {videoPlayer}

          {/* Top bar — back + counter */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "48px 16px 16px",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
            pointerEvents: "none",
          }}>
            <button onClick={onClose} style={{
              pointerEvents: "all",
              display: "flex", alignItems: "center", gap: "7px",
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px",
              color: "#fff", cursor: "pointer", padding: "8px 14px",
              fontSize: "13px", fontWeight: 600,
            }}>
              <ArrowLeft size={14} weight="bold" /> Map
            </button>
            <span style={{
              fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)",
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              padding: "6px 12px", borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {currentIndex + 1} / {reels.length}
            </span>
          </div>

          {/* Right action strip */}
          <div style={{
            position: "absolute", right: "8px",
            bottom: "140px",
            zIndex: 30,
            width: "60px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
          }}>
            <MobileActionBtn
              icon={<Heart size={24} weight={liked ? "fill" : "regular"} />}
              label="Like" active={liked} color={liked ? "var(--accent)" : undefined}
              onClick={() => setLiked(v => !v)}
            />
            <MobileActionBtn icon={<ShareNetwork size={24} />} label="Share" onClick={() => {}} />
            <MobileActionBtn icon={<DownloadSimple size={24} />} label="Save" onClick={() => {}} />
            <MobileActionBtn
              icon={<Repeat size={24} weight={loopMode ? "fill" : "regular"} />}
              label={loopMode ? "Loop" : "Auto"} active={loopMode}
              color={loopMode ? "var(--accent)" : undefined}
              onClick={() => setLoopMode(v => !v)}
            />
          </div>

          {/* Bottom info — left of action strip */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 0,
            padding: "60px 16px 36px",
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
          }}>
            {/* Creator row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                overflow: "hidden", border: "2px solid rgba(255,255,255,0.25)",
                background: "linear-gradient(135deg,#1a1a2e,#0f3460)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700, color: "#fff",
              }}>
                {reel.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={`/api/video?url=${encodeURIComponent(reel.avatarUrl)}`}
                      alt={reel.creator} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  : reel.creator[0]?.toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>@{reel.creator}</div>
                {reel.country && (
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
                    <MapPin size={9} /> {reel.country}
                  </div>
                )}
              </div>
              {reel.verified && (
                <CheckCircle size={16} weight="fill" color="var(--accent)" style={{ marginLeft: "2px" }} />
              )}
            </div>

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

            {reel.archiveDate && (
              <p style={{ margin: "6px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                Archived {reel.archiveDate}
              </p>
            )}
          </div>
        </div>

      ) : (
        /* ════════════ DESKTOP LAYOUT ════════════ */
        <>
          {/* Close */}
          <button onClick={onClose} aria-label="Close player"
            style={{
              position: "absolute", top: "20px", right: "20px", zIndex: 20,
              width: "36px", height: "36px", borderRadius: "8px",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", cursor: "pointer", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <XIcon size={16} />
          </button>

          {/* Left info panel */}
          <div data-scroll-panel style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "340px",
            padding: "32px 28px", boxSizing: "border-box", zIndex: 10, overflowY: "auto",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <button onClick={onClose}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: "13px", fontWeight: 500, padding: 0, display: "flex", alignItems: "center", gap: "6px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
              <ArrowLeft size={15} weight="bold" /> Map
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reel.category && (
                <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)", borderRadius: "4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", width: "fit-content" }}>
                  {reel.category}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg,#1a1a2e,#0f3460)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                  {reel.avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={`/api/video?url=${encodeURIComponent(reel.avatarUrl)}`} alt={reel.creator} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    : reel.creator[0].toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>@{reel.creator}</div>
                  {reel.country && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>{reel.country}</div>}
                </div>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, margin: 0 }}>{reel.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { label: "Source",   value: reel.source },
                  { label: "Location", value: (reel as Reel & { location?: string }).location ?? reel.country },
                  { label: "Archived", value: reel.archiveDate },
                  { label: "Views",    value: reel.views && reel.views !== "—" ? reel.views : null },
                  { label: "Duration", value: reel.duration },
                ].filter(i => i.value).map(({ label, value }, idx, arr) => (
                  <div key={label} style={{ padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderBottom: idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
              {reel.verified && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={12} weight="fill" color="var(--accent)" />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>Source verified</span>
                </div>
              )}
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{currentIndex + 1} / {reels.length}</div>
            </div>
          </div>

          {/* Nav arrows (right edge) */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px", padding: "0 24px", zIndex: 10 }}>
            {[
              { label: "Previous", icon: <ArrowUp size={16} />,   fn: goToPrev, disabled: currentIndex === 0 },
              { label: "Next",     icon: <ArrowDown size={16} />, fn: goToNext, disabled: currentIndex === reels.length - 1 },
            ].map(({ label, icon, fn, disabled }) => (
              <button key={label} onClick={fn} disabled={disabled} aria-label={label}
                style={{ width: "38px", height: "38px", borderRadius: "9px", background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: disabled ? "rgba(255,255,255,0.15)" : "#fff", cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </button>
            ))}
          </div>

          {/* Center: video + action strip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}>
            <div style={{ flexShrink: 0 }}>{videoPlayer}</div>
            <div style={{ width: "76px", height: `${panelH}px`, marginLeft: "16px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "20px", paddingBottom: "4px" }}>
              <ActionBtn icon={<Heart size={20} weight={liked ? "fill" : "regular"} />} label="Like" active={liked} color={liked ? "var(--accent)" : undefined} onClick={() => setLiked(v => !v)} />
              <ActionBtn icon={<Repeat size={20} weight={loopMode ? "fill" : "regular"} />} label={loopMode ? "Loop" : "Auto"} active={loopMode} color={loopMode ? "var(--accent)" : undefined} onClick={() => setLoopMode(v => !v)} />
              <ActionBtn icon={<ShareNetwork size={20} />}   label="Share" onClick={() => {}} />
              <ActionBtn icon={<DownloadSimple size={20} />} label="Save"  onClick={() => {}} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VideoPlayer
───────────────────────────────────────────────────────────────  */
function VideoPlayer({
  reel, loopMode, onEnded, onDimsReady, displayDims, isMobile, onSwipeUp, onSwipeDown,
}: {
  reel: Reel; loopMode: boolean; onEnded?: () => void;
  onDimsReady: (w: number, h: number) => void; displayDims: Dims | null;
  isMobile: boolean; onSwipeUp?: () => void; onSwipeDown?: () => void;
}) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const tapTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ y: number; t: number } | null>(null);

  const [playing,   setPlaying]   = useState(false);
  const [muted,     setMuted]     = useState(true);
  const [progress,  setProgress]  = useState(0);
  const [showPulse, setShowPulse] = useState<"play" | "pause" | "mute" | "unmute" | null>(null);

  // Auto-play when reel changes — mute first, then try to unmute after play starts
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let alive = true;

    // Always reset
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
        .catch(() => {
          // Autoplay blocked — stay paused and muted
          if (alive) { setPlaying(false); }
        });
    };

    v.addEventListener("canplay", onCanPlay, { once: true });
    v.load();

    return () => {
      alive = false;
      v.removeEventListener("canplay", onCanPlay);
      // pause and mute on cleanup — do NOT clear src, the key prop handles remounting
      v.pause();
      v.muted = true;
    };
  }, [reel.id]);

  const pulse = (type: typeof showPulse) => {
    setShowPulse(type);
    setTimeout(() => setShowPulse(null), 650);
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (playing) {
      v.pause(); setPlaying(false); pulse("pause");
    } else {
      v.play().then(() => { setPlaying(true); pulse("play"); }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    pulse(next ? "mute" : "unmute");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  // ── Touch gestures (mobile only) ──
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

  const cw = displayDims?.w ?? 360;
  const ch = displayDims?.h ?? 640;

  const containerStyle: React.CSSProperties = isMobile
    ? { position: "absolute", inset: 0, background: "#000", overflow: "hidden" }
    : {
        position: "relative", width: `${cw}px`, height: `${ch}px`,
        borderRadius: "14px", overflow: "hidden", background: "#000",
        cursor: "pointer", flexShrink: 0,
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        transition: "width 0.2s ease, height 0.2s ease",
      };

  return (
    <div style={containerStyle}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onClick={isMobile ? undefined : togglePlay}
    >
      <video
        ref={videoRef}
        key={reel.id}
        src={resolveVideoSrc(reel.videoUrl!)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" }}
        onLoadedMetadata={() => { const v = videoRef.current; if (v) onDimsReady(v.videoWidth, v.videoHeight); }}
        onTimeUpdate={() => { const v = videoRef.current; if (v?.duration) setProgress((v.currentTime / v.duration) * 100); }}
        onEnded={onEnded}
        onError={() => setPlaying(false)}
        playsInline
        loop={loopMode}
      />

      {/* Top gradient */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)", pointerEvents: "none" }} />
      {/* Bottom gradient */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "200px",
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)", pointerEvents: "none" }} />

      {/* Desktop controls (top-right) */}
      {!isMobile && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, display: "flex", justifyContent: "flex-end", padding: "12px 14px", gap: "8px" }}
          onClick={e => e.stopPropagation()}>
          <CtrlBtn onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={14} weight="fill" color="#fff" /> : <Play size={14} weight="fill" color="#fff" />}
          </CtrlBtn>
          <CtrlBtn onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <SpeakerSlash size={14} weight="fill" color="#fff" /> : <SpeakerHigh size={14} weight="fill" color="#fff" />}
          </CtrlBtn>
        </div>
      )}

      {/* Mobile mute button — tucked top-right, below top bar */}
      {isMobile && (
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
            : <SpeakerHigh  size={18} weight="fill" color="#fff" />}
        </button>
      )}

      {/* Tap/gesture pulse feedback */}
      {showPulse && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "pulseIn 0.65s ease forwards",
          }}>
            {showPulse === "play"   && <Play         size={30} weight="fill" color="#fff" style={{ marginLeft: "3px" }} />}
            {showPulse === "pause"  && <Pause        size={30} weight="fill" color="#fff" />}
            {showPulse === "mute"   && <SpeakerSlash size={30} weight="fill" color="#fff" />}
            {showPulse === "unmute" && <SpeakerHigh  size={30} weight="fill" color="#fff" />}
          </div>
        </div>
      )}

      {/* Desktop paused overlay */}
      {!isMobile && !playing && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Play size={26} weight="fill" color="#fff" style={{ marginLeft: "3px" }} />
          </div>
        </div>
      )}

      {/* Desktop bottom info */}
      {!isMobile && (
        <div style={{ position: "absolute", bottom: "16px", left: "14px", right: "14px", pointerEvents: "none" }}>
          {reel.verified && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
              <CheckCircle size={10} weight="fill" color="var(--accent)" />
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Verified Source</span>
            </div>
          )}
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {reel.title}
          </p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
            @{reel.creator}{reel.views && reel.views !== "—" ? ` · ${reel.views} views` : ""}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px",
          background: "rgba(255,255,255,0.15)", zIndex: 10,
          cursor: isMobile ? "default" : "pointer" }}
        onClick={!isMobile ? (e => {
          const v = videoRef.current; if (!v) return;
          const rect = e.currentTarget.getBoundingClientRect();
          v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
        }) : undefined}
        onTouchMove={isMobile ? (e => {
          const v = videoRef.current; if (!v) return;
          const rect = e.currentTarget.getBoundingClientRect();
          v.currentTime = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width)) * v.duration;
        }) : undefined}
      >
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.1s linear" }} />
      </div>
    </div>
  );
}

/* ─── UI Helpers ──────────────────────────────────────────── */
function CtrlBtn({ onClick, children, "aria-label": label }: {
  onClick?: () => void; children: React.ReactNode; "aria-label"?: string;
}) {
  return (
    <button onClick={onClick} aria-label={label}
      style={{
        width: "30px", height: "30px", borderRadius: "7px",
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.45)")}
    >{children}</button>
  );
}

function ActionBtn({ icon, label, active, color, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; color?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", flexShrink: 0 }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "12px",
        background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color ?? (active ? "#fff" : "rgba(255,255,255,0.65)"),
      }}>{icon}</div>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function MobileActionBtn({ icon, label, active, color, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; color?: string; onClick: () => void;
}) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }}
      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", width: "56px" }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "50%",
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
        border: `1.5px solid ${active ? (color ?? "rgba(255,255,255,0.4)") : "rgba(255,255,255,0.2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color ?? (active ? "#fff" : "rgba(255,255,255,0.9)"),
        boxShadow: active ? `0 0 14px ${color ?? "rgba(255,255,255,0.25)"}` : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        flexShrink: 0,
      }}>{icon}</div>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.03em", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}
