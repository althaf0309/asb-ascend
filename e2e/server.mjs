/**
 * Production-shaped server for the end-to-end suite.
 *
 * Mirrors the nginx site config: files that exist in the build are served
 * directly, and every other request goes to the real Express backend, which
 * server-renders pages and answers /api. The backend runs on a throwaway data
 * directory, so tests never touch backend/data/.
 */
import http from "node:http";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "..", "dist-e2e");
const backendEntry = path.resolve(here, "..", "..", "backend", "src", "index.js");
const port = Number(process.env.E2E_PORT || 4173);

// Must be set before the backend module is imported: it reads env on load.
process.env.DATA_DIR = await mkdtemp(path.join(tmpdir(), "asb-e2e-"));
process.env.FRONTEND_INDEX = path.join(distDir, "index.html");
process.env.ADMIN_USER = "e2e-admin";
process.env.ADMIN_PASSWORD = "e2e-password-123";
process.env.WEB3FORMS_ACCESS_KEY = "";
// Every test request comes from 127.0.0.1, so the per-IP production limits
// (15 submissions per 10 minutes, 120 API writes per minute) would throttle the
// suite itself. Those limits are covered by the backend security suite.
process.env.RATE_LIMIT_SUBMISSION = "100000";
process.env.RATE_LIMIT_API = "100000";
// Cloudflare's public "always passes" test secret, paired with the test site
// key baked into dist-e2e by e2e/build.mjs.
process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";

const { app } = await import(pathToFileURL(backendEntry).href);
const backend = await new Promise((resolve) => {
  const server = app.listen(0, "127.0.0.1", () => resolve(server));
});
const backendPort = backend.address().port;

const types = {
  ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

const serveFile = async (pathname, res) => {
  if (pathname === "/" || pathname.endsWith("/")) return false;
  const filePath = path.join(distDir, decodeURIComponent(pathname));
  if (!filePath.startsWith(distDir)) return false;
  try {
    if (!(await stat(filePath)).isFile()) return false;
  } catch {
    return false;
  }
  res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
  res.end(await readFile(filePath));
  return true;
};

const proxy = (req, res) => {
  const upstream = http.request(
    { host: "127.0.0.1", port: backendPort, path: req.url, method: req.method, headers: req.headers },
    (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    },
  );
  upstream.on("error", (error) => {
    res.writeHead(502);
    res.end(String(error));
  });
  req.pipe(upstream);
};

// nginx serves sitemap.xml and llms.txt from the backend, not from the build.
const backendOnly = new Set(["/sitemap.xml", "/llms.txt"]);

http
  .createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    if (req.method === "GET" && !pathname.startsWith("/api/") && !backendOnly.has(pathname) && (await serveFile(pathname, res))) return;
    proxy(req, res);
  })
  .listen(port, "127.0.0.1", () => console.log(`e2e site on http://127.0.0.1:${port} (backend :${backendPort})`));
