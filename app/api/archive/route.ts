import { NextRequest, NextResponse } from "next/server";

/**
 * Cloudflare Workers KV–backed archive store.
 *
 * All data lives under a single KV key ("archive") as a JSON array.
 * The KV namespace is accessed via Cloudflare's REST API — no Cloudflare
 * Worker is needed. The Next.js app continues to run on Vercel.
 *
 * Required env vars (set in Vercel dashboard):
 *   CF_ACCOUNT_ID        — Cloudflare account ID
 *   CF_KV_NAMESPACE_ID   — KV namespace ID
 *   CF_KV_API_TOKEN      — Cloudflare API token with Workers KV Storage: Edit
 *
 * GET    /api/archive          — returns all archived reels
 * POST   /api/archive          — adds a new reel (body: Reel JSON)
 * DELETE /api/archive?id=xxx   — removes a reel by id
 */

const KV_KEY = "archive";

function kvBaseUrl(): string {
  const accountId = process.env.CF_ACCOUNT_ID;
  const namespaceId = process.env.CF_KV_NAMESPACE_ID;
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values`;
}

function kvHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.CF_KV_API_TOKEN ?? ""}`,
  };
}

function usesKV(): boolean {
  return !!(
    process.env.CF_ACCOUNT_ID &&
    process.env.CF_KV_NAMESPACE_ID &&
    process.env.CF_KV_API_TOKEN
  );
}

/* ── KV helpers ───────────────────────────────────────────────── */

async function readArchive(): Promise<object[]> {
  try {
    const res = await fetch(`${kvBaseUrl()}/${KV_KEY}`, {
      headers: kvHeaders(),
      cache: "no-store",
    });

    // 404 means the key doesn't exist yet — return empty array
    if (res.status === 404) return [];
    if (!res.ok) {
      console.error("KV read error:", res.status, await res.text());
      return [];
    }

    const parsed = await res.json();
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("KV read exception:", err);
    return [];
  }
}

async function writeArchive(data: object[]): Promise<void> {
  const res = await fetch(`${kvBaseUrl()}/${KV_KEY}`, {
    method: "PUT",
    headers: {
      ...kvHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`KV write failed (${res.status}): ${body}`);
  }
}

/* ── Local file fallback (no KV env vars — used in local dev) ── */

async function readLocal(): Promise<object[]> {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  try {
    const raw = readFileSync(
      join(process.cwd(), "app", "data", "archive.json"),
      "utf-8"
    );
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal(data: object[]): Promise<void> {
  const { writeFileSync } = await import("fs");
  const { join } = await import("path");
  writeFileSync(
    join(process.cwd(), "app", "data", "archive.json"),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

/* ── GET ─────────────────────────────────────────────────────── */
export async function GET() {
  const archive = usesKV() ? await readArchive() : await readLocal();
  return NextResponse.json(archive);
}

/* ── POST ────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'id' field" },
      { status: 400 }
    );
  }

  try {
    const archive = usesKV() ? await readArchive() : await readLocal();

    if (archive.some((r) => (r as { id: string }).id === body.id)) {
      return NextResponse.json(
        { error: "An entry with this id already exists" },
        { status: 409 }
      );
    }

    archive.unshift(body); // newest first

    if (usesKV()) {
      await writeArchive(archive);
    } else {
      await writeLocal(archive);
    }

    return NextResponse.json({ ok: true, id: body.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/archive error:", err);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}

/* ── DELETE ──────────────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Missing 'id' query param" },
      { status: 400 }
    );
  }

  try {
    const archive = usesKV() ? await readArchive() : await readLocal();
    const updated = archive.filter((r) => (r as { id: string }).id !== id);

    if (updated.length === archive.length) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (usesKV()) {
      await writeArchive(updated);
    } else {
      await writeLocal(updated);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/archive error:", err);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
