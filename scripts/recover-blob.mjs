/**
 * Tries to recover archive data from Vercel Blob using the list API,
 * then attempts to read the blob via multiple methods.
 *
 * Usage: node scripts/recover-blob.mjs <BLOB_READ_WRITE_TOKEN>
 */

const token = process.argv[2];
if (!token) {
  console.error("❌  Pass your BLOB_READ_WRITE_TOKEN as the first argument:");
  console.error("    node scripts/recover-blob.mjs <BLOB_READ_WRITE_TOKEN>");
  process.exit(1);
}

console.log("🔍 Listing all blobs in the store...\n");

// Try listing all blobs (not just archive/)
const listRes = await fetch("https://blob.vercel-storage.com?limit=1000", {
  headers: { Authorization: `Bearer ${token}` },
});

console.log("List API status:", listRes.status);

if (!listRes.ok) {
  const txt = await listRes.text();
  console.error("List failed:", txt);
  process.exit(1);
}

const { blobs, cursor } = await listRes.json();
console.log(`Found ${blobs?.length ?? 0} blobs total:`);
blobs?.forEach(b => console.log(" -", b.pathname, `(${b.size} bytes, ${b.uploadedAt})`));

if (cursor) console.log("(more blobs exist — cursor:", cursor, ")");

// Find the archive blob
const archiveBlob = blobs?.find(b => b.pathname === "archive/data.json");
if (!archiveBlob) {
  console.error("\n❌ archive/data.json not found in blob list.");
  process.exit(1);
}

console.log("\n📄 Archive blob found:", archiveBlob.url);
console.log("   Size:", archiveBlob.size, "bytes");
console.log("   Uploaded:", archiveBlob.uploadedAt);

// Try fetching with token
console.log("\n⬇️  Attempting download with Authorization header...");
const dataRes = await fetch(archiveBlob.url, {
  headers: { Authorization: `Bearer ${token}` },
  cache: "no-store",
});

console.log("Download status:", dataRes.status);

if (!dataRes.ok) {
  const err = await dataRes.text();
  console.error("Download failed:", err);

  // Try the downloadUrl if available
  if (archiveBlob.downloadUrl) {
    console.log("\n⬇️  Trying downloadUrl...");
    const dlRes = await fetch(archiveBlob.downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    console.log("downloadUrl status:", dlRes.status);
    if (dlRes.ok) {
      const raw = await dlRes.text();
      console.log("\n✅ Got data via downloadUrl!");
      await writeOutput(raw);
    } else {
      console.error("downloadUrl also failed:", await dlRes.text());
    }
  }
  process.exit(1);
}

const raw = await dataRes.text();
console.log("\n✅ Download succeeded!");
await writeOutput(raw);

async function writeOutput(raw) {
  const { writeFileSync } = await import("fs");
  const { join, dirname } = await import("path");
  const { fileURLToPath } = await import("url");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("❌ Data is not valid JSON:", raw.slice(0, 200));
    process.exit(1);
  }

  const count = Array.isArray(parsed) ? parsed.length : "?";
  console.log(`📦 ${count} reels recovered.`);

  const outPath = join(dirname(fileURLToPath(import.meta.url)), "../app/data/archive.json");
  writeFileSync(outPath, JSON.stringify(parsed, null, 2), "utf-8");
  console.log(`💾 Saved to app/data/archive.json`);
}
