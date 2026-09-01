/**
 * Static-asset SEO audit: index.html, robots.txt, sitemap.xml and the web
 * manifest. These files are what a crawler sees before any JavaScript runs, so
 * they are checked as text rather than through the React tree.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const read = (relative: string) => readFileSync(path.join(root, relative), "utf8");

const indexHtml = read("index.html");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const manifest = JSON.parse(read("public/site.webmanifest"));

const SITE_URL = "https://www.asbtraininghub.com";

describe("SEO: index.html head", () => {
  it("declares the document language", () => {
    expect(indexHtml).toMatch(/<html[^>]*\slang=["']en["']/i);
  });

  it("declares charset and a responsive viewport", () => {
    expect(indexHtml).toMatch(/<meta\s+charset=["']UTF-8["']/i);
    expect(indexHtml).toMatch(/name=["']viewport["'][^>]*width=device-width/i);
  });

  it("has exactly one title of a sensible length", () => {
    const titles = indexHtml.match(/<title>/gi) ?? [];
    expect(titles).toHaveLength(1);
    const title = indexHtml.match(/<title>([\s\S]*?)<\/title>/i)![1];
    expect(title.length).toBeGreaterThanOrEqual(20);
    expect(title.length).toBeLessThanOrEqual(65);
  });

  it("has exactly one meta description of 50-165 characters", () => {
    const tags = indexHtml.match(/<meta\s+name=["']description["']/gi) ?? [];
    expect(tags).toHaveLength(1);
    const description = indexHtml.match(
      /<meta\s+name=["']description["'][^>]*content=["']([^"']*)/i,
    )![1];
    expect(description.length).toBeGreaterThanOrEqual(50);
    expect(description.length).toBeLessThanOrEqual(165);
  });

  it("is indexable and has exactly one canonical", () => {
    expect(indexHtml).toMatch(/<meta\s+name=["']robots["'][^>]*content=["']index, follow["']/i);
    const canonicals = indexHtml.match(/<link\s+rel=["']canonical["']/gi) ?? [];
    expect(canonicals).toHaveLength(1);
    const href = indexHtml.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)/i)![1];
    expect(href).toBe(`${SITE_URL}/`);
  });

  it("carries the full Open Graph set with absolute URLs", () => {
    for (const property of ["og:site_name", "og:title", "og:description", "og:type", "og:url", "og:image"]) {
      expect(indexHtml).toMatch(new RegExp(`<meta\\s+property=["']${property}["']`, "i"));
    }
    const image = indexHtml.match(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)/i)![1];
    expect(image.startsWith("https://")).toBe(true);
  });

  it("carries a summary_large_image Twitter card", () => {
    const card = indexHtml.match(/<meta\s+name=["']twitter:card["'][^>]*content=["']([^"']+)/i)![1];
    expect(card).toBe("summary_large_image");
    for (const name of ["twitter:title", "twitter:description", "twitter:image"]) {
      expect(indexHtml).toMatch(new RegExp(`<meta\\s+name=["']${name}["']`, "i"));
    }
  });

  it("links favicons, an apple touch icon and a web manifest", () => {
    expect(indexHtml).toMatch(/<link\s+rel=["']icon["'][^>]*href=["']\/favicon\.ico/i);
    expect(indexHtml).toMatch(/rel=["']apple-touch-icon["']/i);
    expect(indexHtml).toMatch(/rel=["']manifest["']/i);
  });

  it("declares a theme-color matching the manifest", () => {
    expect(indexHtml).toMatch(/<meta\s+name=["']theme-color["']/i);
  });

  it("preconnects to the third-party origins it loads scripts from", () => {
    expect(indexHtml).toMatch(
      /<link\s+rel=["'](preconnect|dns-prefetch)["'][^>]*googletagmanager\.com/i,
    );
  });

  it("ships base organisation JSON-LD in the static HTML, not only via JS", () => {
    expect(indexHtml).toMatch(/application\/ld\+json/i);
  });
});

describe("SEO: robots.txt", () => {
  it("allows general crawling", () => {
    expect(robots).toMatch(/User-agent:\s*\*/i);
    expect(robots).toMatch(/^Allow:\s*\/$/m);
  });

  it("points at the sitemap with an absolute URL", () => {
    const sitemapLine = robots.match(/^Sitemap:\s*(\S+)$/mi);
    expect(sitemapLine).not.toBeNull();
    expect(sitemapLine![1]).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("blocks the admin area", () => {
    expect(robots).toMatch(/^Disallow:\s*\/admin\//mi);
  });

  it("does not block assets that search engines need to render the page", () => {
    const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)$/gim)].map((m) => m[1]);
    for (const blocked of disallowed) {
      expect(["/assets/", "/assets", "/*.css", "/*.js"]).not.toContain(blocked);
    }
  });

  it("does not disallow a route that is also marked indexable in the app", () => {
    // /gallery is Disallow-ed here while Gallery.tsx still emits index,follow.
    const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)$/gim)].map((m) => m[1]);
    const appRoutes = readFileSync(path.join(root, "src/App.tsx"), "utf8");
    for (const blocked of disallowed) {
      if (blocked.startsWith("/admin")) continue;
      const route = blocked.replace(/\/$/, "");
      const declared = appRoutes.includes(`path="${route}"`);
      if (!declared) continue;
      const pageFile = route.replace("/", "");
      const source = readFileSync(
        path.join(root, `src/pages/${pageFile.charAt(0).toUpperCase()}${pageFile.slice(1)}.tsx`),
        "utf8",
      );
      expect(
        source.includes("noindex: true"),
        `${blocked} is disallowed in robots.txt but the page still declares index,follow`,
      ).toBe(true);
    }
  });

  it("points assistants at llms.txt", () => {
    expect(robots).toMatch(/llms\.txt/i);
  });

  /**
   * Parses robots.txt into groups. Consecutive `User-agent:` lines share the
   * rule block that follows them, which is how the file avoids repeating rules
   * 40 times.
   */
  const parseGroups = (text: string) => {
    const groups: Array<{ agents: string[]; allow: string[]; disallow: string[] }> = [];
    let current: { agents: string[]; allow: string[]; disallow: string[] } | null = null;
    let expectingAgents = false;

    for (const raw of text.split(/\r?\n/)) {
      const line = raw.replace(/#.*$/, "").trim();
      if (!line) continue;

      const [field, ...rest] = line.split(":");
      const key = field.trim().toLowerCase();
      const value = rest.join(":").trim();

      if (key === "user-agent") {
        if (!current || !expectingAgents) {
          current = { agents: [], allow: [], disallow: [] };
          groups.push(current);
          expectingAgents = true;
        }
        current.agents.push(value);
      } else if (key === "allow" || key === "disallow") {
        if (!current) continue;
        expectingAgents = false;
        if (key === "allow") current.allow.push(value);
        else current.disallow.push(value);
      }
    }
    return groups;
  };

  it("every crawler group protects the admin area", () => {
    // A crawler obeys only the most specific group matching its name and
    // ignores "*" entirely, so a named group that just says `Allow: /` hands
    // that crawler the admin console.
    const groups = parseGroups(robots);
    expect(groups.length).toBeGreaterThan(1);

    for (const group of groups) {
      expect(
        group.disallow.some((rule) => rule.startsWith("/admin")),
        `group [${group.agents.join(", ")}] does not disallow /admin`,
      ).toBe(true);
    }
  });

  it("every crawler group blocks the API", () => {
    for (const group of parseGroups(robots)) {
      expect(
        group.disallow.some((rule) => rule.startsWith("/api")),
        `group [${group.agents.join(", ")}] does not disallow /api/`,
      ).toBe(true);
    }
  });

  it("declares a catch-all group so unnamed crawlers still have rules", () => {
    const groups = parseGroups(robots);
    const wildcard = groups.filter((g) => g.agents.includes("*"));
    expect(wildcard).toHaveLength(1);
    expect(wildcard[0].allow).toContain("/");
  });

  it("names no crawler twice, which would make the duplicate group dead", () => {
    const agents = parseGroups(robots).flatMap((g) => g.agents.map((a) => a.toLowerCase()));
    const seen = new Set<string>();
    const duplicates = agents.filter((a) => (seen.has(a) ? true : (seen.add(a), false)));
    expect(duplicates, `duplicate user-agent tokens: ${duplicates.join(", ")}`).toHaveLength(0);
  });

  it("welcomes the AI answer engines the site publishes llms.txt for", () => {
    const agents = parseGroups(robots)
      .flatMap((g) => g.agents.map((a) => a.toLowerCase()));
    for (const bot of ["gptbot", "oai-searchbot", "claudebot", "perplexitybot", "google-extended"]) {
      expect(agents, `${bot} is not named in robots.txt`).toContain(bot);
    }
  });

  it("lists exactly one sitemap, and it is the one the server actually serves", () => {
    const sitemaps = [...robots.matchAll(/^Sitemap:\s*(\S+)$/gim)].map((m) => m[1]);
    expect(
      sitemaps,
      `robots.txt advertises ${sitemaps.length} sitemaps; only /sitemap.xml exists, ` +
        `the rest would return the SPA's HTML and be rejected as "Sitemap is HTML"`,
    ).toEqual([`${SITE_URL}/sitemap.xml`]);
  });
});

describe("SEO: sitemap.xml", () => {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it("is well-formed and namespaced", () => {
    expect(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it("has no duplicate URLs", () => {
    expect(new Set(locs).size).toBe(locs.length);
  });

  it("uses absolute https URLs on the canonical www host", () => {
    for (const loc of locs) {
      expect(loc.startsWith(`${SITE_URL}/`)).toBe(true);
    }
  });

  it("covers every public route declared in the router", () => {
    const appRoutes = readFileSync(path.join(root, "src/App.tsx"), "utf8");
    const declared = [...appRoutes.matchAll(/path="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((p) => p !== "*" && !p.includes(":") && !p.startsWith("/admin"));

    const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)$/gim)].map((m) =>
      m[1].replace(/\/$/, ""),
    );

    for (const route of declared) {
      if (disallowed.includes(route)) continue;
      expect(locs, `route ${route} is missing from sitemap.xml`).toContain(`${SITE_URL}${route}`);
    }
  });

  it("does not list disallowed or admin routes", () => {
    for (const loc of locs) {
      expect(loc).not.toContain("/admin");
    }
  });

  it("lists every course slug from the course catalogue", () => {
    const courses = readFileSync(path.join(root, "src/data/courses.ts"), "utf8");
    const slugs = [...new Set([...courses.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]))];
    expect(slugs.length).toBeGreaterThan(10);
    for (const slug of slugs) {
      expect(locs, `course ${slug} missing from sitemap`).toContain(`${SITE_URL}/course/${slug}`);
    }
  });

  it("stays under the 50,000-URL protocol limit", () => {
    expect(locs.length).toBeLessThan(50000);
  });
});

describe("SEO: web manifest", () => {
  it("names the site and sets display/theme", () => {
    expect(manifest.name).toBe("ASB Training Hub");
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("declares a 192px and a 512px icon for installability", () => {
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain("512x512");
    expect(sizes).toContain("192x192");
  });

  it("declares a start_url", () => {
    expect(manifest.start_url).toBeTruthy();
  });
});
