/**
 * One-time migration: pushes your existing archive.json into Vercel Blob.
 * The blob is stored as PUBLIC so the API route can read it with a plain
 * HTTP GET — no auth headers needed anywhere.
 *
 * Usage:   node scripts/seed-blob.mjs <YOUR_TOKEN_HERE>
 * Example: node scripts/seed-blob.mjs vercel_blob_rw_abc123...
 */

import { put } from "@vercel/blob";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const token = process.argv[2];
if (!token) {
  console.error("❌  Pass your BLOB_READ_WRITE_TOKEN as the first argument:");
  console.error("    node scripts/seed-blob.mjs vercel_blob_rw_xxxx");
  process.exit(1);
}

process.env.BLOB_READ_WRITE_TOKEN = token;

const archivePath = join(dirname(fileURLToPath(import.meta.url)), "../app/data/archive.json");
const data = readFileSync(archivePath, "utf-8");
const reels = JSON.parse(data);

console.log(`📦 Seeding ${reels.length} reels to Vercel Blob (public)...`);

const { url } = await put("archive/data.json", data, {
  access: "public",
  contentType: "application/json",
  allowOverwrite: true,
});

console.log(`✅ Done! Public blob URL: ${url}`);
console.log(`   Verify: curl "${url}"`);
