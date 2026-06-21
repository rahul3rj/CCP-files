import { NextResponse } from "next/server";

/**
 * GET /api/mirrors
 * Pings each mirror site and returns their up/down status.
 * Each mirror should respond to GET / within 4 seconds.
 * Cached for 60 seconds so rapid re-opens don't flood mirrors.
 */

// ── Update these URLs when you deploy new mirrors ─────────────────────────────
// Each mirror is just another Vercel deployment of the same repo.
// All share the same BLOB_READ_WRITE_TOKEN env var → same data.
export const MIRRORS = [
  {
    id: "m1",
    label: "Mirror 1",
    url: "https://ccp-files-1.vercel.app/",
    region: "US Europe",
  },
  {
    id: "m2",
    label: "Mirror 2",
    url: "https://ccp-files-2.vercel.app/",
    region: "Middle East",
  },
  {
    id: "m3",
    label: "Mirror 3",
    url: "https://ccp-files-3.vercel.app/",
    region: "Brazil",
  },
];

type MirrorStatus = {
  id: string;
  label: string;
  url: string;
  region: string;
  online: boolean;
  latencyMs: number | null;
};

async function pingMirror(mirror: (typeof MIRRORS)[0]): Promise<MirrorStatus> {
  const start = Date.now();
  try {
    const res = await fetch(mirror.url, {
      method: "HEAD",
      signal: AbortSignal.timeout(4000), // 4 s timeout
      cache: "no-store",
    });
    const latencyMs = Date.now() - start;
    return { ...mirror, online: res.ok || res.status < 500, latencyMs };
  } catch {
    return { ...mirror, online: false, latencyMs: null };
  }
}

export async function GET() {
  const results = await Promise.all(MIRRORS.map(pingMirror));

  return NextResponse.json(results, {
    headers: {
      // Cache 60 s on CDN, allow stale for 30 s while revalidating
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
