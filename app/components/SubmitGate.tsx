"use client";

import { useState, useEffect, useRef } from "react";
import { X, LockSimple, UploadSimple, Eye, EyeSlash } from "@phosphor-icons/react";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export function SubmitGate({ onSuccess, onClose }: Props) {
  const [password, setPassword]   = useState("");
  const [show,     setShow]       = useState(false);
  const [error,    setError]      = useState("");
  const [loading,  setLoading]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess();
      } else {
        setError("Incorrect password. Try again.");
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "380px",
          background: "#0d0d0d",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "fadeUp 0.2s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 20px 0",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(200,16,46,0.12)", border: "1px solid rgba(200,16,46,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <LockSimple size={16} weight="fill" color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                Submit Access
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                Enter password to continue
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
              color: "var(--text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)", margin: "16px 0" }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "0 20px 20px" }}>
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <input
              ref={inputRef}
              type={show ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Password"
              autoComplete="current-password"
              style={{
                width: "100%", padding: "11px 44px 11px 14px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${error ? "rgba(200,16,46,0.5)" : "var(--border)"}`,
                borderRadius: "9px", color: "#fff", fontSize: "14px",
                outline: "none", transition: "border-color 0.15s",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={e => {
                if (!error) e.currentTarget.style.borderColor = "var(--border-hover)";
              }}
              onBlur={e => {
                if (!error) e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", display: "flex", padding: 0,
              }}
              tabIndex={-1}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeSlash size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              fontSize: "12px", color: "var(--accent)",
              marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px",
            }}>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            style={{
              width: "100%", padding: "11px",
              background: loading || !password.trim() ? "rgba(200,16,46,0.4)" : "var(--accent)",
              color: "#fff", border: "none", borderRadius: "9px",
              fontSize: "13px", fontWeight: 700, cursor: loading || !password.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
              transition: "background 0.15s, opacity 0.15s",
              letterSpacing: "-0.01em",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "13px", height: "13px", borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block", flexShrink: 0,
                }} />
                Verifying…
              </>
            ) : (
              <>
                <UploadSimple size={13} weight="bold" />
                Enter Submit Page
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
