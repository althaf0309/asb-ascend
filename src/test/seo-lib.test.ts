/**
 * Unit tests for the client-side SEO helper that every route calls on mount.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  removeJsonLd,
  setCanonical,
  setJsonLd,
  setMetaTag,
  setPageSeo,
  setPropertyTag,
} from "@/lib/seo";

const meta = (name: string) =>
  document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content;
const prop = (property: string) =>
  document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content;
const canonical = () =>
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;

beforeEach(() => {
  document.head.innerHTML = "";
  document.title = "";
});

describe("absoluteUrl", () => {
  it("prefixes a relative path with the canonical origin", () => {
    expect(absoluteUrl("/courses")).toBe(`${SITE_URL}/courses`);
  });

  it("adds a missing leading slash", () => {
    expect(absoluteUrl("courses")).toBe(`${SITE_URL}/courses`);
  });

  it("defaults to the site root", () => {
    expect(absoluteUrl()).toBe(`${SITE_URL}/`);
  });

  it("passes through an already absolute URL", () => {
    expect(absoluteUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    expect(absoluteUrl("HTTP://example.com/a.png")).toBe("HTTP://example.com/a.png");
  });
});

describe("tag helpers are idempotent", () => {
  it("setMetaTag creates once then updates in place", () => {
    setMetaTag("description", "first");
    setMetaTag("description", "second");
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(meta("description")).toBe("second");
  });

  it("setPropertyTag creates once then updates in place", () => {
    setPropertyTag("og:title", "first");
    setPropertyTag("og:title", "second");
    expect(document.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(prop("og:title")).toBe("second");
  });

  it("setCanonical never duplicates the link element", () => {
    setCanonical(`${SITE_URL}/a`);
    setCanonical(`${SITE_URL}/b`);
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(canonical()).toBe(`${SITE_URL}/b`);
  });

  it("setJsonLd replaces the block with the same id and removeJsonLd clears it", () => {
    setJsonLd("faq", { "@type": "FAQPage", v: 1 });
    setJsonLd("faq", { "@type": "FAQPage", v: 2 });
    const blocks = document.querySelectorAll('script[data-json-ld="faq"]');
    expect(blocks).toHaveLength(1);
    expect(JSON.parse(blocks[0].textContent!).v).toBe(2);

    removeJsonLd("faq");
    expect(document.querySelector('script[data-json-ld="faq"]')).toBeNull();
  });

  it("keeps JSON-LD blocks with different ids side by side", () => {
    setJsonLd("organization", { "@type": "EducationalOrganization" });
    setJsonLd("faq", { "@type": "FAQPage" });
    expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
  });
});

describe("setPageSeo", () => {
  it("writes a complete, self-consistent tag set", () => {
    setPageSeo({
      title: "Courses | ASB Training Hub",
      description: "Job-oriented ERP, AI and programming courses in Trivandrum.",
      keywords: "erp courses",
      path: "/courses",
    });

    expect(document.title).toBe("Courses | ASB Training Hub");
    expect(meta("description")).toBe("Job-oriented ERP, AI and programming courses in Trivandrum.");
    expect(meta("keywords")).toBe("erp courses");
    expect(meta("robots")).toBe("index, follow");
    expect(canonical()).toBe(`${SITE_URL}/courses`);

    expect(prop("og:site_name")).toBe(SITE_NAME);
    expect(prop("og:title")).toBe("Courses | ASB Training Hub");
    expect(prop("og:url")).toBe(`${SITE_URL}/courses`);
    expect(prop("og:type")).toBe("website");
    expect(prop("og:image")).toBe(`${SITE_URL}/site-logo.png`);

    expect(meta("twitter:card")).toBe("summary_large_image");
    expect(meta("twitter:title")).toBe("Courses | ASB Training Hub");
    expect(meta("twitter:image")).toBe(`${SITE_URL}/site-logo.png`);
  });

  it("falls back to the site defaults when description/keywords are omitted", () => {
    setPageSeo({ title: "About", path: "/about" });
    expect(meta("description")).toBe(DEFAULT_DESCRIPTION);
    expect(meta("keywords")).toBe(DEFAULT_KEYWORDS);
  });

  it("emits noindex,nofollow for private routes", () => {
    setPageSeo({ title: "Admin", path: "/admin/blog", noindex: true });
    expect(meta("robots")).toBe("noindex, nofollow");
  });

  it("marks article pages as og:type=article", () => {
    setPageSeo({ title: "Post", path: "/blog/x", type: "article" });
    expect(prop("og:type")).toBe("article");
  });

  it("absolutises a relative social image", () => {
    setPageSeo({ title: "Post", path: "/blog/x", image: "/blog/cover.png" });
    expect(prop("og:image")).toBe(`${SITE_URL}/blog/cover.png`);
    expect(meta("twitter:image")).toBe(`${SITE_URL}/blog/cover.png`);
  });

  it("leaves no duplicate tags after successive navigations", () => {
    setPageSeo({ title: "A", path: "/a" });
    setPageSeo({ title: "B", path: "/b" });
    setPageSeo({ title: "C", path: "/c" });

    for (const selector of [
      'meta[name="description"]',
      'meta[name="keywords"]',
      'meta[name="robots"]',
      'meta[property="og:title"]',
      'meta[property="og:url"]',
      'link[rel="canonical"]',
    ]) {
      expect(document.querySelectorAll(selector), selector).toHaveLength(1);
    }
    expect(canonical()).toBe(`${SITE_URL}/c`);
  });

  it("escapes rather than injects a hostile title", () => {
    const hostile = "</title><script>alert(1)</script>";
    setPageSeo({ title: hostile, path: "/x" });
    // The value is written through DOM properties, so it stays inert text/attribute
    // data - no element is ever parsed out of it.
    expect(document.querySelectorAll("script").length).toBe(0);
    expect(document.title).toBe(hostile);
    expect(prop("og:title")).toBe(hostile);
  });
});
