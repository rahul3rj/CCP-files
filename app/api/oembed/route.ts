import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side oEmbed fetch for X/Twitter posts.
 * Called from the Upload page to get tweet metadata (author, text, thumbnail).
 * We do this server-side so the request comes from our server (no CORS issue).
 *
 * GET /api/oembed?url=<encoded-tweet-url>
 */
export async function GET(req: NextRequest) {
  const tweetUrl = req.nextUrl.searchParams.get("url");
  if (!tweetUrl) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Validate it's a Twitter/X URL
  if (!/(?:twitter\.com|x\.com|xcancel\.com)\/\w+\/status\/\d+/.test(tweetUrl)) {
    return NextResponse.json({ error: "Not a valid X post URL" }, { status: 400 });
  }

  try {
    const oembedUrl =
      `https://publish.x.com/oembed?` +
      `url=${encodeURIComponent(tweetUrl)}` +
      `&omit_script=1` +
      `&theme=dark` +
      `&dnt=true`;

    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CCPFiles/1.0; +https://ccpfiles.com)",
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `oEmbed returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      html: data.html,               // full embed HTML (blockquote + script)
      authorName: data.author_name,  // @handle
      authorUrl: data.author_url,
      width: data.width,
      url: tweetUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch oEmbed data" },
      { status: 500 }
    );
  }
}
