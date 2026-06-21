"use client";

import { ArrowLeft, Clock, Tag } from "@phosphor-icons/react";
import type { Post } from "../data/posts";

type Props = {
  post: Post;
  onBack: () => void;
};

export function PostView({ post, onBack }: Props) {
  const paragraphs = post.body.split("\n\n").filter(Boolean);

  return (
    <div className="flex-1 min-w-0 min-h-screen mt-12 md:mt-0">
      {/* Back button */}
      <div
        className="px-6 md:px-10 pt-6 pb-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70 active:scale-95"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} />
          Back to Discover
        </button>
      </div>

      {/* Hero cover */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "340px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.4)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8">
          <span
            className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono mb-4"
            style={{
              borderRadius: "3px",
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {post.category}
          </span>
          <h1
            className="font-bold leading-tight"
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
              color: "#fff",
              maxWidth: "700px",
            }}
          >
            {post.title}
          </h1>
        </div>
      </div>

      {/* Article content */}
      <div className="px-6 md:px-10 py-8 max-w-3xl">
        {/* Meta row */}
        <div
          className="flex flex-wrap items-center gap-4 pb-6 mb-8 text-xs"
          style={{
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "13px" }}>
              {post.author}
            </span>
            <span>{post.authorRole}</span>
          </div>
          <span style={{ color: "var(--border)" }}>|</span>
          <span>{post.publishedAt}</span>
          <span style={{ color: "var(--border)" }}>|</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {post.readTime}
          </span>
        </div>

        {/* Excerpt / lede */}
        <p
          className="leading-relaxed mb-8 font-medium"
          style={{
            fontSize: "17px",
            color: "rgba(255,255,255,0.75)",
            lineHeight: "1.75",
            borderLeft: "2px solid rgba(255,255,255,0.2)",
            paddingLeft: "20px",
          }}
        >
          {post.excerpt}
        </p>

        {/* Body paragraphs */}
        <div className="flex flex-col gap-6">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: "15px",
                lineHeight: "1.85",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div
          className="flex flex-wrap items-center gap-2 mt-12 pt-8"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Tag size={14} style={{ color: "var(--text-muted)" }} />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs"
              style={{
                borderRadius: "4px",
                background: "var(--surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
