/**
 * Client-side security checks: stored-XSS rendering, credential handling in the
 * admin console, third-party script surface, and secrets in the shipped bundle.
 */
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import BlogDetail from "@/pages/BlogDetail";

const root = path.resolve(__dirname, "../..");
const indexHtml = readFileSync(path.join(root, "index.html"), "utf8");

const makePost = (content: string) => ({
  slug: "probe",
  title: "Probe post",
  excerpt: "Probe excerpt",
  category: "AI",
  author: "ASB Team",
  readTime: "5 min",
  metaDescription: "Probe meta description",
  keywords: "probe",
  imageUrl: "/blog/ai-jobs-kerala.png",
  imageAlt: "Probe",
  content,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  published: true,
});

const renderPostWith = async (content: string) => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(makePost(content)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

  render(
    <MemoryRouter initialEntries={["/blog/probe"]}>
      <Routes>
        <Route path="/blog/:slug" element={<BlogDetail />} />
      </Routes>
    </MemoryRouter>,
  );

  await waitFor(() => expect(document.querySelector(".blog-content")).not.toBeNull());
  return document.querySelector(".blog-content")!;
};

beforeEach(() => {
  document.head.innerHTML = "";
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("stored XSS: blog content rendering", () => {
  const payloads: Array<[string, string]> = [
    ["script tag", "<p>ok</p><script>window.__xss = true;</script>"],
    ["img onerror", '<img src="x" onerror="window.__xss = true">'],
    ["svg onload", "<svg onload=\"window.__xss = true\"></svg>"],
    ["iframe", '<iframe src="https://evil.test"></iframe>'],
    ["anchor javascript href", '<a href="javascript:window.__xss=true">go</a>'],
    ["form exfiltration", '<form action="https://evil.test"><input name="p"></form>'],
    ["style block", "<style>body{display:none}</style>"],
    ["object embed", '<object data="https://evil.test/x"></object>'],
  ];

  for (const [name, payload] of payloads) {
    it(`sanitises "${name}" before inserting it into the DOM`, async () => {
      const container = await renderPostWith(payload);
      const html = container.innerHTML;

      expect(html, "script element rendered").not.toMatch(/<script/i);
      expect(html, "iframe rendered").not.toMatch(/<iframe/i);
      expect(html, "object rendered").not.toMatch(/<object/i);
      expect(html, "embed rendered").not.toMatch(/<embed/i);
      expect(html, "form rendered").not.toMatch(/<form/i);
      expect(html, "style block rendered").not.toMatch(/<style/i);
      expect(html, "inline event handler rendered").not.toMatch(/\son\w+\s*=/i);
      expect(html, "javascript: URL rendered").not.toMatch(/javascript:/i);
    });
  }

  it("keeps safe formatting markup intact", async () => {
    const container = await renderPostWith(
      '<h2>Heading</h2><p>Body with <strong>bold</strong> and <a href="/courses">a link</a>.</p><ul><li>Point</li></ul>',
    );
    expect(container.querySelector("h2")).not.toBeNull();
    expect(container.querySelector("strong")).not.toBeNull();
    expect(container.querySelector("ul li")).not.toBeNull();
    expect(container.querySelector('a[href="/courses"]')).not.toBeNull();
  });

  it("renders the post heading as text, never as markup", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ...makePost("<p>x</p>"), title: "<img src=x onerror=alert(1)>" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    render(
      <MemoryRouter initialEntries={["/blog/probe"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => expect(document.querySelector("h1")).not.toBeNull());
    expect(document.querySelector("h1")!.querySelector("img")).toBeNull();
  });
});

describe("admin credential handling", () => {
  const adminSource = readFileSync(path.join(root, "src/pages/AdminBlog.tsx"), "utf8");
  const apiSource = readFileSync(path.join(root, "src/lib/api.ts"), "utf8");

  it("does not hardcode admin credentials in the client bundle", () => {
    expect(adminSource).not.toMatch(/admin123/);
    expect(apiSource).not.toMatch(/admin123/);
    expect(apiSource).not.toMatch(/asb-admin-token/);
  });

  it("keeps the admin route out of the sitemap and behind robots.txt", () => {
    const robots = readFileSync(path.join(root, "public/robots.txt"), "utf8");
    const sitemap = readFileSync(path.join(root, "public/sitemap.xml"), "utf8");
    expect(robots).toMatch(/Disallow:\s*\/admin\//i);
    expect(sitemap).not.toContain("/admin");
  });

  it("does not persist the admin session token in localStorage", () => {
    // localStorage is readable by any injected script; a session cookie with
    // HttpOnly/SameSite is the correct store for an admin credential.
    expect(
      adminSource,
      "admin token is written to localStorage, so any XSS on the site steals it",
    ).not.toMatch(/localStorage\.setItem/);
  });

  it("does not use document.execCommand-based HTML editing without sanitising on save", () => {
    const usesExecCommand = /document\.execCommand/.test(adminSource);
    if (!usesExecCommand) return;
    expect(
      /sanitize|DOMPurify/i.test(adminSource),
      "the contenteditable editor stores raw innerHTML with no client-side sanitiser",
    ).toBe(true);
  });
});

describe("third-party and secret surface", () => {
  it("does not embed a private API key in the frontend source", () => {
    const apiSource = readFileSync(path.join(root, "src/lib/api.ts"), "utf8");
    const suspicious = apiSource.match(
      /(secret|private[_-]?key|api[_-]?secret|password)\s*[:=]\s*['"][^'"]{8,}/gi,
    );
    expect(suspicious, `possible secret in src/lib/api.ts: ${suspicious?.join(", ")}`).toBeNull();
  });

  it("routes third-party form posts through an origin the site controls", () => {
    const apiSource = readFileSync(path.join(root, "src/lib/api.ts"), "utf8");
    const externalPosts = apiSource.match(/fetch\(\s*['"]https?:\/\/[^'"]+/g) ?? [];
    expect(
      externalPosts,
      `the browser posts form data straight to a third party (${externalPosts.join(", ")}); proxy it through /api so the access key is not public and can be rate-limited`,
    ).toHaveLength(0);
  });

  it("loads third-party scripts with subresource integrity or from a pinned origin", () => {
    const scripts = [...indexHtml.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/g)];
    for (const [tag, src] of scripts) {
      if (!src.startsWith("http")) continue;
      const host = new URL(src).host;
      expect(
        ["www.googletagmanager.com"],
        `unexpected third-party script host: ${host} (${tag.slice(0, 80)})`,
      ).toContain(host);
    }
  });

  it("declares a Content-Security-Policy, by header or meta tag", () => {
    const confPath = path.resolve(root, "../deploy-nginx-asbtraininghub.conf");
    const conf = existsSync(confPath) ? readFileSync(confPath, "utf8") : "";

    const headerCsp = /add_header\s+Content-Security-Policy\s+"[^"]*default-src/i.test(conf);
    const metaCsp = /http-equiv=["']Content-Security-Policy["']/i.test(indexHtml);

    expect(
      headerCsp || metaCsp,
      "no CSP is declared as an nginx response header or an index.html meta tag",
    ).toBe(true);

    if (headerCsp) {
      // A policy that allows everything is not a policy.
      const policy = conf.match(/add_header\s+Content-Security-Policy\s+"([^"]*)"/i)![1];
      expect(policy).toMatch(/object-src\s+'none'/);
      expect(policy).toMatch(/base-uri\s+'self'/);
      expect(policy).toMatch(/frame-ancestors/);
      expect(policy).not.toMatch(/default-src[^;]*\*/);
    }
  });

  it("does not leave debug logging in shipped source", () => {
    const srcDir = path.join(root, "src");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "test" || entry.name === "ui") continue;
          walk(full);
        } else if (/\.tsx?$/.test(entry.name)) {
          const source = readFileSync(full, "utf8");
          if (/console\.(log|debug)\(/.test(source)) offenders.push(path.relative(root, full));
        }
      }
    };
    walk(srcDir);
    expect(offenders, `console logging left in: ${offenders.join(", ")}`).toHaveLength(0);
  });
});

describe("deployment configuration", () => {
  const confPath = path.resolve(root, "../deploy-nginx-asbtraininghub.conf");
  const conf = existsSync(confPath) ? readFileSync(confPath, "utf8") : "";

  it("the nginx config exists", () => {
    expect(conf, "deploy-nginx-asbtraininghub.conf not found").not.toBe("");
  });

  it("terminates TLS and redirects http to https", () => {
    expect(conf, "no TLS listener; the site is served over plaintext http only").toMatch(
      /listen\s+443\s+ssl/,
    );
    expect(conf, "no http -> https redirect").toMatch(/return\s+301\s+https/);
  });

  it("sends HSTS", () => {
    expect(conf).toMatch(/Strict-Transport-Security/i);
  });

  it("sends the baseline security headers", () => {
    for (const header of [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Content-Security-Policy",
    ]) {
      expect(conf, `nginx does not send ${header}`).toMatch(new RegExp(header, "i"));
    }
  });

  it("redirects the apex host to the canonical www host", () => {
    // Find the server block whose server_name is the bare apex host, then check
    // that block redirects rather than serving content.
    const blocks = conf.split(/\nserver\s*\{/).slice(1);
    const apexBlocks = blocks.filter((block) =>
      /server_name\s+asbtraininghub\.com\s*;/.test(block),
    );

    expect(apexBlocks.length, "no server block handles the bare apex host").toBeGreaterThan(0);

    for (const block of apexBlocks) {
      expect(
        block,
        "the apex host serves content instead of redirecting, splitting link equity",
      ).toMatch(/return\s+301\s+https:\/\/www\.asbtraininghub\.com/);
    }
  });

  it("rate-limits the API so the public form endpoints cannot be flooded", () => {
    expect(conf, "no limit_req zone protecting /api/").toMatch(/limit_req/);
  });

  it("hides the nginx version", () => {
    expect(conf).toMatch(/server_tokens\s+off/);
  });
});
