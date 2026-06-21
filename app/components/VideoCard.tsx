"use client";

import { useState } from "react";
import { Play, CheckCircle, MapPin, Clock } from "@phosphor-icons/react";
import { resolveVideoSrc, type Reel } from "../data/reels";

type Props = {
  reel: Reel;
  onPlay: (reel: Reel, index: number) => void;
  index: number;
};

export function VideoCard({ reel, onPlay, index }: Props) {
  const [hovered, setHovered] = useState(false);
  const [failed,  setFailed]  = useState(false);
  const [loaded,  setLoaded]  = useState(false);

  const resolved = reel.tweetId ? null : resolveVideoSrc(reel.videoUrl ?? "");
  const src      = resolved ? (resolved.includes("#") ? resolved : `${resolved}#t=0.1`) : null;
  const isTweet  = !!reel.tweetId;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(reel, index)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onPlay(reel, index)}
      aria-label={`Play: ${reel.title}`}
      style={{
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        background: "var(--bg-card)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.2s ease",
        boxShadow: hovered
          ? "0 20px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)"
          : "0 2px 10px rgba(0,0,0,0.4)",
        animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${Math.min(index * 0.04, 0.3)}s both`,
      }}
    >
      {/* ── Thumbnail ── */}
      <div style={{ position: "relative", lineHeight: 0, overflow: "hidden" }}>

        {isTweet ? (
          <div style={{ width: "100%", position: "relative", background: "#0a0a0a", lineHeight: 0 }}>
            {reel.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={reel.thumbnail}
                alt={reel.title}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "cover",
                  transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }}
                loading="lazy"
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "9/16", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>No preview</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {!loaded && !failed && (
              <div className="skeleton" style={{ width: "100%", aspectRatio: "9/16" }} />
            )}
            <video
              src={src ?? ""}
              style={{
                display: loaded ? "block" : "none",
                width: "100%",
                height: "auto",
                objectFit: "cover",
                background: "#000",
                transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                transform: hovered ? "scale(1.05)" : "scale(1)",
              }}
              preload="metadata"
              muted
              playsInline
              onLoadedMetadata={() => setLoaded(true)}
              onError={() => { setFailed(true); setLoaded(true); }}
            />
          </>
        )}

        {failed && !isTweet && (
          <div style={{ width: "100%", aspectRatio: "9/16", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>Preview unavailable</span>
          </div>
        )}

        {/* Gradient overlays */}
        {(loaded || isTweet) && !failed && (
          <>
            {/* top vignette */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.92) 100%)",
              pointerEvents: "none",
            }} />
          </>
        )}

        {/* Duration — always visible bottom-right */}
        {(loaded || isTweet) && !failed && reel.duration && (
          <div style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(6px)",
            color: "rgba(255,255,255,0.9)",
            fontSize: "10px",
            fontFamily: "var(--font-geist-mono), monospace",
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: "5px",
            letterSpacing: "0.03em",
          }}>
            <Clock size={9} weight="bold" />
            {reel.duration}
          </div>
        )}

        {/* Category tag — top-left */}
        {reel.category && (loaded || isTweet) && !failed && (
          <div style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "3px 8px",
            background: "rgba(200,16,46,0.85)",
            backdropFilter: "blur(4px)",
            borderRadius: "5px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "#fff",
          }}>
            {reel.category}
          </div>
        )}

        {/* Verified — top-right */}
        {reel.verified && (loaded || isTweet) && (
          <div style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            padding: "2px 6px",
            borderRadius: "5px",
            fontSize: "9px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            <CheckCircle size={9} weight="fill" color="var(--accent)" />
            Verified
          </div>
        )}

        {/* Play button — center on hover */}
        {(loaded || isTweet) && !failed && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
              transform: hovered ? "scale(1)" : "scale(0.8)",
              transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <Play size={18} weight="fill" color="#000" style={{ marginLeft: "2px" }} />
            </div>
          </div>
        )}

        {/* Bottom title overlay — always visible */}
        {(loaded || isTweet) && !failed && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "32px 12px 12px",
            pointerEvents: "none",
          }}>
            <p style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              letterSpacing: "-0.01em",
            }}>
              {reel.title}
            </p>
          </div>
        )}
      </div>

      {/* ── Card footer ── */}
      <div style={{ padding: "10px 12px 11px", display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Avatar */}
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
          flexShrink: 0,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 700,
          color: "#fff",
        }}>
          {reel.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/video?url=${encodeURIComponent(reel.avatarUrl)}`}
              alt={reel.creator}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            reel.creator[0]?.toUpperCase() ?? "?"
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            @{reel.creator}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            {reel.country && (
              <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "9px", color: "var(--text-muted)" }}>
                <MapPin size={8} />
                {reel.country}
              </span>
            )}
            {reel.archiveDate && (
              <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                {reel.archiveDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
