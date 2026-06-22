/**
 * migrate-blob-to-kv.mjs
 *
 * Pulls your archive data directly from Vercel Blob, then writes it into
 * Cloudflare KV. Run this once to migrate — no manual JSON copy-paste needed.
 *
 * Usage:
 *   node scripts/migrate-blob-to-kv.mjs \
 *     <BLOB_READ_WRITE_TOKEN> \
 *     <CF_ACCOUNT_ID> \
 *     <CF_KV_NAMESPACE_ID> \
 *     <CF_KV_API_TOKEN>
 *
 * Where to find each value:
 *   BLOB_READ_WRITE_TOKEN  — Vercel project → Settings → Environment Variables
 *   CF_ACCOUNT_ID          — Cloudflare dashboard URL or Workers & Pages sidebar
 *   CF_KV_NAMESPACE_ID     — Cloudflare → Workers & Pages → KV → your namespace
 *   CF_KV_API_TOKEN        — Cloudflare → My Profile → API Tokens
 */

const [blobToken, cfAccountId, cfNamespaceId, cfApiToken] = process.argv.slice(2);

if (!blobToken || !cfAccountId || !cfNamespaceId || !cfApiToken) {
  console.error("❌  Missing arguments. Usage:");
  console.error(
    "    node scripts/migrate-blob-to-kv.mjs <BLOB_TOKEN> <CF_ACCOUNT_ID> <CF_KV_NAMESPACE_ID> <CF_KV_API_TOKEN>"
  );
  process.exit(1);
}

// ── Step 1: List blobs to find archive/data.json ─────────────────────────────
console.log("🔍  Fetching blob list from Vercel...");

const listRes = await fetch(
  "https://blob.vercel-storage.com?prefix=archive%2Fdata.json&limit=1",
  {
    headers: { Authorization: `Bearer ${blobToken}` },
  }
);

if (!listRes.ok) {
  console.error(`❌  Vercel Blob list failed (${listRes.status}): ${await listRes.text()}`);
  process.exit(1);
}

const { blobs } = await listRes.json();

if (!blobs || blobs.length === 0) {
  console.error("❌  No blob found at path 'archive/data.json'. Is the token correct?");
  process.exit(1);
}

const blobUrl = blobs[0].url;
console.log(`✅  Found blob: ${blobUrl}`);

// ── Step 2: Download the blob data ───────────────────────────────────────────
console.log("⬇️   Downloading archive data from Vercel Blob...");

const dataRes = await fetch(blobUrl, {
  headers: { Authorization: `Bearer ${blobToken}` },
  cache: "no-store",
});

if (!dataRes.ok) {
  console.error(`❌  Blob download failed (${dataRes.status}): ${await dataRes.text()}`);
  process.exit(1);
}

const rawJson = await dataRes.text();
let reels;
try {
  reels = JSON.parse(rawJson);
} catch {
  console.error("❌  Blob data is not valid JSON.");
  process.exit(1);
}

if (!Array.isArray(reels)) {
  console.error("❌  Blob data is not a JSON array.");
  process.exit(1);
}

console.log(`✅  Downloaded ${reels.length} reels from Vercel Blob.`);

// ── Step 3: Write to Cloudflare KV ───────────────────────────────────────────
console.log("⬆️   Writing to Cloudflare KV...");

const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/storage/kv/namespaces/${cfNamespaceId}/values/archive`;

const kvRes = await fetch(kvUrl, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${cfApiToken}`,
    "Content-Type": "application/json",
  },
  body: rawJson,
});

if (!kvRes.ok) {
  console.error(`❌  Cloudflare KV write failed (${kvRes.status}): ${await kvRes.text()}`);
  process.exit(1);
}

console.log(`✅  Done! ${reels.length} reels migrated to Cloudflare KV key "archive".`);
console.log();
console.log("   Verify in Cloudflare dashboard:");
console.log("   Workers & Pages → KV → your namespace → View → key: archive");
