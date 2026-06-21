import { NextRequest, NextResponse } from "next/server";

/**
 * Resolves a tweet URL → direct MP4 video URL + metadata.
 *
 * Strategy (in order):
 *  1. Scrape xcancel.com page HTML — the highest-quality MP4 src is embedded
 *     directly in <video> / <source> tags and in JSON-LD / meta tags.
 *  2. Fall back to Twitter syndication API with the correct computed token.
 *
 * GET /api/resolve-tweet?url=<encoded-tweet-url>
 */

// ─── Token algorithm (same as Vercel's react-tweet) ──────────────────────────
function getSyndicationToken(id: string): string {
  return (Number(id) / 1e15 * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

// ─── Pick best MP4 from a variants array ─────────────────────────────────────
function bestMp4(variants: { type?: string; src?: string; bitrate?: number }[]): string | null {
  const mp4s = variants
    .filter((v) => (!v.type || v.type === "video/mp4") && v.src)
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
  return mp4s[0]?.src ?? null;
}

// ─── Shared return type ───────────────────────────────────────────────────────
type TweetResult = {
  videoUrl: string;
  thumbnail: string | null;
  author: string;
  avatarUrl: string | null;
  tweetText: string;
  durationMs: number;
  aspectRatio: number;
};

// ─── Method 1: scrape xcancel.com page ───────────────────────────────────────
async function resolveViaXcancel(tweetId: string): Promise<TweetResult | null> {
  try {
    // xcancel serves the full page with video URLs in the HTML
    const res = await fetch(`https://xcancel.com/i/status/${tweetId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extract all video.twimg.com MP4 URLs — pick the highest resolution one
    // xcancel embeds them as: <source src="https://video.twimg.com/.../1280x720/...mp4" type="video/mp4">
    const srcMatches = [...html.matchAll(/src="(https:\/\/video\.twimg\.com\/[^"]+\.mp4[^"]*)"/g)];
    const mp4Urls = srcMatches.map((m) => decodeHTMLEntities(m[1]));

    if (!mp4Urls.length) return null;

    // Sort by resolution: extract WxH from URL path and prefer highest
    const sorted = mp4Urls.sort((a, b) => {
      const resA = parseResolution(a);
      const resB = parseResolution(b);
      return (resB.w * resB.h) - (resA.w * resA.h);
    });

    const videoUrl = sorted[0];

    // Extract thumbnail from og:image or twitter:image meta
    const thumbMatch = html.match(/<meta[^>]+(?:property="og:image"|name="twitter:image")[^>]+content="([^"]+)"/)
      ?? html.match(/content="([^"]+)"[^>]+(?:property="og:image"|name="twitter:image")/);
    const thumbnail = thumbMatch ? decodeHTMLEntities(thumbMatch[1]) : null;

    // Extract author from og:title or twitter:creator
    const authorMatch = html.match(/(?:twitter:creator.*?content|content.*?twitter:creator)[^"]*"@?([A-Za-z0-9_]+)"/)
      ?? html.match(/\/@([A-Za-z0-9_]+)\//);
    const author = authorMatch?.[1] ?? "";

    // Extract tweet body text from og:description or twitter:description meta
    const descMatch = html.match(/<meta[^>]+(?:property="og:description"|name="twitter:description")[^>]+content="([^"]+)"/)
      ?? html.match(/content="([^"]+)"[^>]+(?:property="og:description"|name="twitter:description")/);
    const tweetText = descMatch ? decodeHTMLEntities(descMatch[1]).trim() : "";

    // Extract avatar: xcancel renders profile images as pbs.twimg.com profile_images URLs
    const avatarMatch = html.match(/src="(https:\/\/pbs\.twimg\.com\/profile_images\/[^"]+)"/);
    const avatarUrl = avatarMatch ? decodeHTMLEntities(avatarMatch[1]) : null;

    // Aspect ratio from the chosen video URL
    const { w, h } = parseResolution(videoUrl);
    const aspectRatio = w && h ? w / h : 16 / 9;

    console.log(`[resolve-tweet] xcancel found ${mp4Urls.length} MP4(s) for ${tweetId}:`, sorted.map(parseResolution));

    return { videoUrl, thumbnail, author, avatarUrl, tweetText, durationMs: 0, aspectRatio };
  } catch (e) {
    console.warn("[resolve-tweet] xcancel scrape failed:", e);
    return null;
  }
}

// ─── Method 2: Twitter syndication API ───────────────────────────────────────
const SYNDICATION_FEATURES = [
  "tfw_timeline_list:",
  "tfw_follower_count_sunset:true",
  "tfw_tweet_edit_backend:on",
  "tfw_refsrc_session:on",
  "tfw_fosnr_soft_interventions_enabled:on",
  "tfw_show_birdwatch_pivots_enabled:on",
  "tfw_show_business_verified_badge:on",
  "tfw_duplicate_scribes_to_settings:on",
  "tfw_use_profile_image_shape_enabled:on",
  "tfw_show_blue_verified_badge:on",
  "tfw_legacy_timeline_sunset:true",
  "tfw_show_gov_verified_badge:on",
  "tfw_show_business_affiliate_badge:on",
  "tfw_tweet_edit_frontend:on",
].join(";");

async function resolveViaSyndication(tweetId: string): Promise<TweetResult | null> {
  try {
    const url = new URL("https://cdn.syndication.twimg.com/tweet-result");
    url.searchParams.set("id", tweetId);
    url.searchParams.set("lang", "en");
    url.searchParams.set("features", SYNDICATION_FEATURES);
    url.searchParams.set("token", getSyndicationToken(tweetId));

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Origin": "https://platform.twitter.com",
        "Referer": "https://platform.twitter.com/",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();

    const variants: { type: string; src: string; bitrate?: number }[] =
      data?.video?.variants ?? data?.mediaDetails?.[0]?.video_info?.variants ?? [];

    const videoUrl = bestMp4(variants);
    if (!videoUrl) return null;

    const thumbnail = data?.video?.poster ?? data?.mediaDetails?.[0]?.media_url_https ?? null;
    const author = data?.user?.screen_name ?? "";
    const durationMs = data?.video?.durationMs ?? 0;
    // tweet text is in data.text; clean up t.co links at the end
    const rawText: string = data?.text ?? data?.full_text ?? "";
    const tweetText = rawText.replace(/https:\/\/t\.co\/\S+/g, "").trim();
    // Profile image — syndication returns profile_image_url_https on the user object
    const rawAvatar: string = data?.user?.profile_image_url_https ?? "";
    // Use the _400x400 variant for better quality (default is _normal = 48px)
    const avatarUrl = rawAvatar
      ? rawAvatar.replace(/_normal(\.\w+)$/, "_400x400$1")
      : null;

    const aspectRatio = (() => {
      const orig = data?.mediaDetails?.[0]?.original_info;
      if (orig?.width && orig?.height) return orig.width / orig.height;
      const [w, h] = data?.video?.aspectRatio ?? [16, 9];
      return w / h;
    })();

    console.log(`[resolve-tweet] syndication found video for ${tweetId}: ${videoUrl}`);
    return { videoUrl, thumbnail, author, avatarUrl, tweetText, durationMs, aspectRatio };
  } catch (e) {
    console.warn("[resolve-tweet] syndication failed:", e);
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseResolution(url: string): { w: number; h: number } {
  const m = url.match(/\/(\d+)x(\d+)\//);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : { w: 0, h: 0 };
}

function decodeHTMLEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const tweetUrl = req.nextUrl.searchParams.get("url");
  if (!tweetUrl) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const match = tweetUrl.match(/(?:twitter\.com|x\.com|xcancel\.com|nitter\.\w+)\/\w+\/status\/(\d+)/);
  if (!match) return NextResponse.json({ error: "Invalid tweet or xcancel URL" }, { status: 400 });

  const tweetId = match[1];

  // Try xcancel scrape first (gets highest res directly), fall back to syndication API
  const result = await resolveViaXcancel(tweetId) ?? await resolveViaSyndication(tweetId);

  if (!result) {
    return NextResponse.json(
      { error: "Could not find a video in this tweet. Try opening the post in a browser, finding the .mp4 URL in DevTools Network tab, and pasting it directly." },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
