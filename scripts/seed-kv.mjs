/**
 * One-time migration: pushes your existing archive.json into Cloudflare KV.
 *
 * Usage:
 *   node scripts/seed-kv.mjs <CF_ACCOUNT_ID> <CF_KV_NAMESPACE_ID> <CF_KV_API_TOKEN>
 *
 * Example:
 *   node scripts/seed-kv.mjs abc123 def456 your_token_here
 *
 * You can find these values in the Cloudflare dashboard:
 *   - Account ID: Workers & Pages → right sidebar
 *   - Namespace ID: Workers & Pages → KV → your namespace
 *   - API Token: My Profile → API Tokens (needs Workers KV Storage: Edit)
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const [accountId, namespaceId, apiToken] = process.argv.slice(2);

if (!accountId || !namespaceId || !apiToken) {
  console.error("❌  Missing arguments. Usage:");
  console.error(
    "    node scripts/seed-kv.mjs <CF_ACCOUNT_ID> <CF_KV_NAMESPACE_ID> <CF_KV_API_TOKEN>"
  );
  process.exit(1);
}

const archivePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../app/data/archive.json"
);

const data = readFileSync(archivePath, "utf-8");
const reels = JSON.parse(data);

console.log(`📦 Seeding ${reels.length} reels to Cloudflare KV...`);

const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/archive`;

const res = await fetch(url, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  },
  body: data,
});

if (!res.ok) {
  const body = await res.text();
  console.error(`❌  KV write failed (${res.status}): ${body}`);
  process.exit(1);
}

console.log(`✅  Done! ${reels.length} reels written to KV key "archive".`);
console.log(
  `   Verify in the Cloudflare dashboard: Workers & Pages → KV → your namespace → View`
);
