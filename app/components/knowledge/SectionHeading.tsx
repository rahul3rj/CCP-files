"use client";

import { useRef, useEffect, useState } from "react";

interface Props {
  label: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ label, title, subtitle }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
        marginBottom: "48px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <div style={{ width: "14px", height: "1px", background: "var(--accent)" }} />
        <span style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}>
          {label}
        </span>
      </div>
      <h2 style={{
        fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        color: "#fff",
        lineHeight: 1.1,
        marginBottom: subtitle ? "12px" : 0,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontSize: "15px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: "580px",
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
