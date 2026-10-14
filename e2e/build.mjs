/**
 * Builds the site for the end-to-end suite into dist-e2e/.
 *
 * Identical to the production build except that Turnstile uses Cloudflare's
 * public "always passes" test site key, so form tests exercise the real
 * challenge flow without a human solving it.
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
import { build } from "vite";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// The sitemap script also writes the per-keyword hero images the pages use.
execFileSync(process.execPath, [path.join(root, "scripts", "generate-sitemap.mjs")], { cwd: root, stdio: "inherit" });

process.env.VITE_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
await build({
  root,
  mode: "e2e",
  logLevel: "warn",
  build: { outDir: path.join(root, "dist-e2e"), emptyOutDir: true, sourcemap: false },
});
console.log("e2e build written to dist-e2e/");
