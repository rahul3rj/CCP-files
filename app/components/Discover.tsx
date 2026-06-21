"use client";

import { useState, useEffect } from "react";
import { Clock, Tag, ArrowRight, ArrowLeft, BookOpen, Hash } from "@phosphor-icons/react";
import { posts as staticPosts, type Post } from "../data/posts";

type Props = {
  onNavigate?: (page: string) => void;
};

export function Discover(_props: Props) {
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeToc,  setActiveToc]  = useState<string>("");
  const [allPosts,   setAllPosts]   = useState<Post[]>(staticPosts);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetch("/api/archive")
      .then((res) => res.json())
      .then((data: unknown[]) => {
        const archived = (data as Post[]).filter(
          (entry) => (entry as { type?: string }).type === "article"
        );
        setAllPosts([...archived, ...staticPosts]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (activePost) {
    return (
      <ArticleView
        post={activePost}
        onBack={() => setActivePost(null)}
        activeToc={activeToc}
        setActiveToc={setActiveToc}
      />
    );
  }

  return <ResearchIndex posts={allPosts} loading={loading} onSelect={setActivePost} />;
}

/* ─────────────────────────────────────────────────────────────────────
   Files index
───────────────────────────────────────────────────────────────────── */
function ResearchIndex({
  posts,
  loading,
  onSelect,
}: {
  posts: Post[];
  loading?: boolean;
  onSelect: (p: Post) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const CATEGORY_COLORS: Record<string, string> = {
    Politics: "rgba(200,16,46,0.9)",
    "Human Rights": "rgba(251,146,60,0.9)",
    Geopolitics: "rgba(168,85,247,0.9)",
    Technology: "rgba(34,197,94,0.9)",
    Economy: "rgba(59,130,246,0.9)",
  };

  if (loading) {
    return (
      <div style={{ flex: 1, minHeight: "100vh", paddingTop: "60px", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>
        Loading…
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ flex: 1, minHeight: "100vh", paddingTop: "60px", background: "var(--bg-primary)" }}>
        <div style={{ padding: "64px 48px 48px", borderBottom: "1px solid var(--border)", maxWidth: "1400px", margin: "0 auto" }}>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Files</span>
          </div>
          <h1 className="text-hero" style={{ marginBottom: "16px", maxWidth: "600px" }}>Archive<br /><span style={{ color: "rgba(255,255,255,0.25)" }}>Intelligence</span></h1>
        </div>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No articles yet. Submit one via the Upload section.</p>
        </div>
      </div>
    );
  }

  const featured = posts[0];
  const rest     = posts.slice(1);

  return (
    <div style={{ flex: 1, minHeight: "100vh", paddingTop: "60px", background: "var(--bg-primary)" }}>
      {/* ── Page header ── */}
      <div style={{ padding: "64px 48px 48px", borderBottom: "1px solid var(--border)", maxWidth: "1400px", margin: "0 auto" }}>
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Files</span>
        </div>
        <h1 className="text-hero" style={{ marginBottom: "16px", maxWidth: "600px" }}>
          Archive<br /><span style={{ color: "rgba(255,255,255,0.25)" }}>Intelligence</span>
        </h1>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", maxWidth: "520px", lineHeight: 1.6 }}>
          In-depth investigative reports, analysis, and context from the archive. Every article is linked to source videos.
        </p>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px" }}>
        {/* ── Featured ── */}
        <button
          onClick={() => onSelect(featured)}
          onMouseEnter={() => setHoveredId(featured.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", width: "100%", marginBottom: "48px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${hoveredId === featured.id ? "var(--border-hover)" : "var(--border)"}`, background: "var(--bg-card)", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxShadow: hoveredId === featured.id ? "0 20px 60px rgba(0,0,0,0.5)" : "none" }}
        >
          <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.cover || "https://picsum.photos/seed/default/1200/600"} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) saturate(0.8)", transform: hoveredId === featured.id ? "scale(1.03)" : "scale(1)", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, var(--bg-card) 100%)" }} />
            <div style={{ position: "absolute", top: "16px", left: "16px", padding: "4px 10px", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", borderRadius: "5px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CATEGORY_COLORS[featured.category] ?? "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
              Featured · {featured.category}
            </div>
            {featured.id.startsWith("article-") && (
              <div style={{ position: "absolute", top: "16px", right: "16px", padding: "4px 10px", background: "rgba(59,130,246,0.2)", backdropFilter: "blur(6px)", borderRadius: "5px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(147,197,253,1)", border: "1px solid rgba(59,130,246,0.35)" }}>
                Archived
              </div>
            )}
          </div>
          <div style={{ padding: "40px 40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "14px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Latest Analysis</div>
            <h2 style={{ fontSize: "clamp(1.2rem, 2vw, 1.75rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.25, color: "#fff", marginBottom: "16px" }}>{featured.title}</h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "24px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{featured.excerpt}</p>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{featured.author}</span>
              <span style={{ margin: "0 8px", color: "var(--border)" }}>·</span>
              {featured.publishedAt}
              <span style={{ margin: "0 8px", color: "var(--border)" }}>·</span>
              <Clock size={11} style={{ display: "inline", marginRight: "4px" }} />
              {featured.readTime}
            </div>
            <div className="flex items-center gap-1 mt-5" style={{ fontSize: "12px", fontWeight: 600, color: hoveredId === featured.id ? "#fff" : "var(--text-secondary)", transition: "color 0.15s" }}>
              Read article <ArrowRight size={12} style={{ transform: hoveredId === featured.id ? "translateX(3px)" : "translateX(0)", transition: "transform 0.2s" }} />
            </div>
          </div>
        </button>

        {/* ── Grid ── */}
        <div style={{ marginBottom: "32px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>All Files — {posts.length}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {rest.map((post, i) => (
            <button
              key={post.id}
              onClick={() => onSelect(post)}
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ display: "flex", flexDirection: "column", textAlign: "left", background: "var(--bg-card)", border: `1px solid ${hoveredId === post.id ? "var(--border-hover)" : "var(--border)"}`, borderRadius: "10px", overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s ease, transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease", transform: hoveredId === post.id ? "translateY(-2px)" : "translateY(0)", boxShadow: hoveredId === post.id ? "0 12px 32px rgba(0,0,0,0.5)" : "none", animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both` }}
            >
              <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover || "https://picsum.photos/seed/default/600/340"} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.7)", transform: hoveredId === post.id ? "scale(1.04)" : "scale(1)", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", display: "block" }} />
                <span style={{ position: "absolute", top: "10px", left: "10px", padding: "3px 8px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", borderRadius: "4px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: CATEGORY_COLORS[post.category] ?? "#fff" }}>{post.category}</span>
                {post.id.startsWith("article-") && (
                  <span style={{ position: "absolute", top: "10px", right: "10px", padding: "3px 8px", background: "rgba(59,130,246,0.2)", backdropFilter: "blur(4px)", borderRadius: "4px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(147,197,253,1)", border: "1px solid rgba(59,130,246,0.35)" }}>Archived</span>
                )}
              </div>
              <div style={{ padding: "18px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.35, color: "#fff", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{post.title}</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                <div className="flex items-center gap-2" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{post.author}</span>
                  <span style={{ color: "var(--border)" }}>·</span>
                  <Clock size={9} style={{ display: "inline" }} />{post.readTime}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Article view
───────────────────────────────────────────────────────────────────── */
function ArticleView({ post, onBack, activeToc, setActiveToc }: { post: Post; onBack: () => void; activeToc: string; setActiveToc: (s: string) => void }) {
  const paragraphs = post.body.split("\n\n").filter(Boolean);

  return (
    <div style={{ flex: 1, minHeight: "100vh", paddingTop: "60px", background: "var(--bg-primary)" }}>
      <div style={{ position: "relative", width: "100%", height: "420px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover || "https://picsum.photos/seed/default/1200/600"} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35) saturate(0.7)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg-primary) 0%, rgba(5,5,5,0.6) 50%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 64px 48px", maxWidth: "900px" }}>
          <button onClick={onBack} className="flex items-center gap-2 mb-6" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.6)", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 500, backdropFilter: "blur(6px)", transition: "background 0.15s" }}>
            <ArrowLeft size={13} /> Files
          </button>
          <span style={{ display: "inline-block", padding: "3px 10px", background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)", borderRadius: "4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "14px" }}>{post.category}</span>
          <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: "#fff", maxWidth: "780px" }}>{post.title}</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "64px", maxWidth: "1200px", margin: "0 auto", padding: "48px 48px 96px" }}>
        <article>
          <div className="flex flex-wrap items-center gap-4" style={{ paddingBottom: "28px", marginBottom: "32px", borderBottom: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>
            <div>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{post.author}</span>
              <span style={{ marginLeft: "6px", color: "var(--text-muted)" }}>{post.authorRole}</span>
            </div>
            <span style={{ color: "var(--border)" }}>·</span>
            <span>{post.publishedAt}</span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span className="flex items-center gap-1.5"><Clock size={11} /> {post.readTime}</span>
          </div>
          <p style={{ fontSize: "17px", lineHeight: 1.75, color: "rgba(255,255,255,0.75)", fontWeight: 450, borderLeft: "2px solid var(--accent)", paddingLeft: "20px", marginBottom: "40px" }}>{post.excerpt}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ fontSize: "15px", lineHeight: 1.85, color: i === 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.5)" }}>{para}</p>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-14 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <Tag size={13} style={{ color: "var(--text-muted)" }} />
            {post.tags.map(tag => (
              <span key={tag} style={{ padding: "4px 10px", borderRadius: "5px", background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontSize: "11px", fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        </article>

        <aside style={{ paddingTop: "4px" }}>
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Hash size={11} /> Contents
              </div>
              {["Overview", "Background", "Evidence", "Analysis", "Implications"].map((section) => (
                <button key={section} onClick={() => setActiveToc(section)} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 0 7px 12px", background: "none", border: "none", borderLeft: `2px solid ${activeToc === section ? "var(--accent)" : "var(--border)"}`, fontSize: "12px", color: activeToc === section ? "#fff" : "var(--text-secondary)", cursor: "pointer", transition: "color 0.15s, border-color 0.15s", fontWeight: activeToc === section ? 600 : 400, marginBottom: "2px" }}>{section}</button>
              ))}
            </div>
            <div style={{ padding: "14px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>Reading Time</div>
              <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{post.readTime}</div>
            </div>
            <div style={{ padding: "14px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>Topics</div>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <span key={tag} style={{ padding: "3px 8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
