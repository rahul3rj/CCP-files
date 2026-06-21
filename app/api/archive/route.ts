import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Server-side JSON archive store.
 *
 * GET    /api/archive          — returns all archived reels
 * POST   /api/archive          — adds a new reel (body: Reel JSON)
 * DELETE /api/archive?id=xxx   — removes the reel with the given id
 *
 * Data is persisted in app/data/archive.json so it survives restarts.
 */

const ARCHIVE_PATH = path.join(process.cwd(), "app", "data", "archive.json");

function readArchive(): object[] {
  try {
    const raw = fs.readFileSync(ARCHIVE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArchive(data: object[]): void {
  fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

/* ── GET — list all ─────────────────────────────────────────── */
export async function GET() {
  const archive = readArchive();
  return NextResponse.json(archive);
}

/* ── POST — add new entry ───────────────────────────────────── */
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

  const archive = readArchive();

  // Prevent duplicates
  if (archive.some((r) => (r as { id: string }).id === body.id)) {
    return NextResponse.json({ error: "An entry with this id already exists" }, { status: 409 });
  }

  archive.unshift(body); // newest first
  writeArchive(archive);

  return NextResponse.json({ ok: true, id: body.id }, { status: 201 });
}

/* ── DELETE — remove by id ──────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing 'id' query param" }, { status: 400 });
  }

  const archive = readArchive();
  const before = archive.length;
  const updated = archive.filter((r) => (r as { id: string }).id !== id);

  if (updated.length === before) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  writeArchive(updated);
  return NextResponse.json({ ok: true });
}
