import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";

/**
 * Vercel Blob–backed archive store.
 *
 * All archived reels are stored as a single JSON blob at a fixed pathname
 * ("archive/data.json") inside your Blob store.  On every read we fetch
 * that blob; on every write we overwrite it with the updated array.
 *
 * GET    /api/archive          — returns all archived reels
 * POST   /api/archive          — adds a new reel (body: Reel JSON)
 * DELETE /api/archive?id=xxx   — removes the reel with the given id
 *
 * Required env var (set in Vercel dashboard → Storage → Blob):
 *   BLOB_READ_WRITE_TOKEN
 */

const BLOB_PATHNAME = "archive/data.json";

/* ── helpers ──────────────────────────────────────────────────── */

async function readArchive(): Promise<object[]> {
  try {
    // Find the blob by its pathname
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    if (blobs.length === 0) return [];

    const res = await fetch(blobs[0].downloadUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!res.ok) return [];
    const parsed = await res.json();
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeArchive(data: object[]): Promise<void> {
  // `put` with `allowOverwrite: true` replaces the existing blob
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

/* ── GET — list all ───────────────────────────────────────────── */
export async function GET() {
  // Fallback: if no Blob token is set (local dev), read from local file
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    try {
      const raw = readFileSync(join(process.cwd(), "app", "data", "archive.json"), "utf-8");
      const parsed = JSON.parse(raw);
      return NextResponse.json(Array.isArray(parsed) ? parsed : []);
    } catch {
      return NextResponse.json([]);
    }
  }

  const archive = await readArchive();
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

  // Local dev fallback
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const { readFileSync, writeFileSync } = await import("fs");
    const { join } = await import("path");
    const archivePath = join(process.cwd(), "app", "data", "archive.json");
    try {
      const raw = readFileSync(archivePath, "utf-8");
      const archive: object[] = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      if (archive.some((r) => (r as { id: string }).id === body.id)) {
        return NextResponse.json({ error: "Duplicate id" }, { status: 409 });
      }
      archive.unshift(body);
      writeFileSync(archivePath, JSON.stringify(archive, null, 2), "utf-8");
    } catch {
      return NextResponse.json({ error: "Local write failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: body.id }, { status: 201 });
  }

  const archive = await readArchive();

  if (archive.some((r) => (r as { id: string }).id === body.id)) {
    return NextResponse.json({ error: "An entry with this id already exists" }, { status: 409 });
  }

  archive.unshift(body); // newest first
  await writeArchive(archive);

  return NextResponse.json({ ok: true, id: body.id }, { status: 201 });
}

/* ── DELETE — remove by id ────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing 'id' query param" }, { status: 400 });
  }

  // Local dev fallback
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const { readFileSync, writeFileSync } = await import("fs");
    const { join } = await import("path");
    const archivePath = join(process.cwd(), "app", "data", "archive.json");
    try {
      const raw = readFileSync(archivePath, "utf-8");
      const archive: object[] = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      const updated = archive.filter((r) => (r as { id: string }).id !== id);
      if (updated.length === archive.length) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
      writeFileSync(archivePath, JSON.stringify(updated, null, 2), "utf-8");
    } catch {
      return NextResponse.json({ error: "Local write failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const archive = await readArchive();
  const before = archive.length;
  const updated = archive.filter((r) => (r as { id: string }).id !== id);

  if (updated.length === before) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  await writeArchive(updated);

  // Also clean up any individually keyed blobs (legacy)
  try {
    const { blobs } = await list({ prefix: `archive/${id}` });
    await Promise.all(blobs.map((b) => del(b.url)));
  } catch {
    // non-critical
  }

  return NextResponse.json({ ok: true });
}
