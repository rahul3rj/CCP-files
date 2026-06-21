import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";

/**
 * Vercel Blob–backed archive store.
 *
 * Works with both:
 *  - BLOB_READ_WRITE_TOKEN  (local dev / manual token)
 *  - BLOB_STORE_ID          (Vercel OIDC connection — no token needed)
 *
 * GET    /api/archive          — returns all archived reels
 * POST   /api/archive          — adds a new reel (body: Reel JSON)
 * DELETE /api/archive?id=xxx   — removes the reel with the given id
 */

const BLOB_PATHNAME = "archive/data.json";

/** True when running on Vercel (OIDC) or locally with a token */
function usesBlob() {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/* ── helpers ──────────────────────────────────────────────────── */

async function readArchive(): Promise<object[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    if (blobs.length === 0) return [];

    // For private blobs: add auth header when a static token is available,
    // otherwise the OIDC identity is used automatically by the SDK.
    const headers: Record<string, string> = {};
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
    }

    const res = await fetch(blobs[0].downloadUrl, { headers });
    if (!res.ok) return [];
    const parsed = await res.json();
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeArchive(data: object[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

/* ── local file fallback (only when no Blob env vars are set) ─── */

async function readLocal(): Promise<object[]> {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  try {
    const raw = readFileSync(join(process.cwd(), "app", "data", "archive.json"), "utf-8");
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

/* ── GET — list all ───────────────────────────────────────────── */
export async function GET() {
  const archive = usesBlob() ? await readArchive() : await readLocal();
  return NextResponse.json(archive);
}

/* ── POST — add new entry ─────────────────────────────────────── */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing or invalid 'id' field" }, { status: 400 });
  }

  try {
    const archive = usesBlob() ? await readArchive() : await readLocal();

    if (archive.some((r) => (r as { id: string }).id === body.id)) {
      return NextResponse.json({ error: "An entry with this id already exists" }, { status: 409 });
    }

    archive.unshift(body); // newest first

    if (usesBlob()) {
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

/* ── DELETE — remove by id ────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing 'id' query param" }, { status: 400 });
  }

  try {
    const archive = usesBlob() ? await readArchive() : await readLocal();
    const updated = archive.filter((r) => (r as { id: string }).id !== id);

    if (updated.length === archive.length) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (usesBlob()) {
      await writeArchive(updated);
      // Clean up any individually keyed blobs (legacy)
      try {
        const { blobs } = await list({ prefix: `archive/${id}` });
        await Promise.all(blobs.map((b) => del(b.url)));
      } catch {
        // non-critical
      }
    } else {
      await writeLocal(updated);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/archive error:", err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
