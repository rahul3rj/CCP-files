import { NextRequest } from "next/server";

/**
 * Video proxy — streams Twitter CDN videos through our origin to bypass
 * hotlink / CORS restrictions on video.twimg.com.
 *
 * Properly handles Range requests so seeking and progressive playback work.
 * Passes through all headers needed for the browser's media pipeline.
 */

const ALLOWED_HOSTS = [
  "video.twimg.com",
  "pbs.twimg.com",
];

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");

  if (!target) {
    return new Response("Missing 'url' parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const range = req.headers.get("range");

  const upstream = await fetch(parsed.toString(), {
    headers: {
      Referer: "https://twitter.com/",
      Origin: "https://twitter.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      // Forward range header for seeking support
      ...(range ? { Range: range } : {}),
    },
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(`Upstream error: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  const headers = new Headers();

  // Always set correct video content type so browser uses hardware decoder
  const upstreamType = upstream.headers.get("content-type");
  headers.set("content-type", upstreamType?.startsWith("video/") ? upstreamType : "video/mp4");

  // Pass through all headers needed for progressive streaming + seeking
  const passThrough = [
    "content-length",
    "content-range",
    "accept-ranges",
    "last-modified",
    "etag",
  ];
  for (const key of passThrough) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }

  // Always advertise range support — critical for video seeking
  if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");

  // Cache for 24 hours — twimg URLs are content-addressed so safe to cache
  headers.set("cache-control", "public, max-age=86400, immutable");

  // CORS — allow same-origin playback
  headers.set("access-control-allow-origin", "*");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
