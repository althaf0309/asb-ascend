/**
 * AEO (Answer Engine Optimisation) and GEO (Generative Engine Optimisation).
 *
 * AEO asks: can a search assistant lift a correct, attributable answer straight
 * off this page? That needs valid schema.org entities, question/answer pairs,
 * and a stated location/contact for local intent.
 *
 * GEO asks: when a generative model summarises this brand, does it have clean
 * machine-readable ground truth? That needs llms.txt, consistent entity naming,
 * absolute URLs, and self-contained factual copy.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { courses, courseCategories } from "@/data/courses";
import FAQ from "@/pages/FAQ";
import Index from "@/pages/Index";
import CourseDetail from "@/pages/CourseDetail";
import TermsAndConditions from "@/pages/TermsAndConditions";

const root = path.resolve(__dirname, "../..");
const llms = readFileSync(path.join(root, "public/llms.txt"), "utf8");
const SITE_URL = "https://www.asbtraininghub.com";
const BRAND = "ASB Training Hub";
const PHONE_DIGITS = "918714773304";

const jsonLd = (id: string) => {
  const el = document.querySelector<HTMLScriptElement>(`script[data-json-ld="${id}"]`);
  return el ? JSON.parse(el.textContent!) : null;
};

const renderAt = (route: string, path: string, element: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  document.head.innerHTML = "";
});

/* ------------------------------------------------------------------ *
 * GEO: llms.txt
 * ------------------------------------------------------------------ */
describe("GEO: llms.txt", () => {
  it("opens with the brand as an H1", () => {
    expect(llms.trimStart().startsWith(`# ${BRAND}`)).toBe(true);
  });

  it("states what the organisation is in the first paragraph", () => {
    const summary = llms.split("\n\n")[1] ?? "";
    expect(summary.length).toBeGreaterThan(80);
    expect(summary).toMatch(/Trivandrum|Kerala/i);
    expect(summary).toMatch(/training|courses/i);
  });

  it("publishes the canonical site, sitemap and contact URLs", () => {
    for (const url of [
      `${SITE_URL}/`,
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/contact`,
      `${SITE_URL}/apply`,
    ]) {
      expect(llms, `llms.txt is missing ${url}`).toContain(url);
    }
  });

  it("lists every indexable top-level page", () => {
    for (const route of ["/about", "/courses", "/reviews", "/faq", "/blog", "/terms-and-conditions"]) {
      expect(llms, `llms.txt is missing ${route}`).toContain(`${SITE_URL}${route}`);
    }
  });

  it("lists every course category landing page", () => {
    for (const category of courseCategories) {
      expect(llms, `llms.txt is missing /courses/${category.id}`).toContain(
        `${SITE_URL}/courses/${category.id}`,
      );
    }
  });

  it("gives an assistant a reachable contact channel", () => {
    expect(llms).toMatch(/info@asbtraininghub\.com/);
    expect(llms.replace(/[\s+-]/g, "")).toContain(PHONE_DIGITS);
  });

  it("states crawling guidance including the admin exclusion", () => {
    expect(llms).toMatch(/Crawling Guidance/i);
    expect(llms).toMatch(/\/admin\//);
  });

  it("uses only https URLs on the canonical www host", () => {
    const urls = llms.match(/https?:\/\/\S+/g) ?? [];
    for (const url of urls) {
      expect(url.startsWith("https://"), `insecure URL in llms.txt: ${url}`).toBe(true);
    }
  });

  it("stays inside a context budget an assistant will actually read", () => {
    expect(llms.length).toBeLessThan(12000);
  });
});

/* ------------------------------------------------------------------ *
 * AEO: FAQPage structured data
 * ------------------------------------------------------------------ */
describe("AEO: FAQ page", () => {
  it("emits a valid FAQPage with every visible question", async () => {
    renderAt("/faq", "/faq", <FAQ />);
    await waitFor(() => expect(jsonLd("faq")).not.toBeNull());

    const data = jsonLd("faq");
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("FAQPage");
    expect(Array.isArray(data.mainEntity)).toBe(true);
    expect(data.mainEntity.length).toBeGreaterThanOrEqual(15);

    for (const entry of data.mainEntity) {
      expect(entry["@type"]).toBe("Question");
      expect(entry.name.trim().length).toBeGreaterThan(8);
      expect(entry.name.trim().endsWith("?")).toBe(true);
      expect(entry.acceptedAnswer["@type"]).toBe("Answer");
      expect(entry.acceptedAnswer.text.trim().length).toBeGreaterThanOrEqual(25);
    }
  });

  it("has no duplicate questions, which suppresses rich results", async () => {
    renderAt("/faq", "/faq", <FAQ />);
    await waitFor(() => expect(jsonLd("faq")).not.toBeNull());
    const names = jsonLd("faq").mainEntity.map((q: { name: string }) => q.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("answers the high-intent questions an assistant is asked about a training institute", async () => {
    renderAt("/faq", "/faq", <FAQ />);
    await waitFor(() => expect(jsonLd("faq")).not.toBeNull());
    const corpus = JSON.stringify(jsonLd("faq")).toLowerCase();
    for (const topic of ["fee", "placement", "certificate", "online", "enroll", "locat"]) {
      expect(corpus, `FAQ never addresses "${topic}"`).toContain(topic);
    }
  });
});

/* ------------------------------------------------------------------ *
 * AEO: local / organisation entity
 * ------------------------------------------------------------------ */
describe("AEO: organisation entity", () => {
  it("emits an EducationalOrganization with a complete postal address", async () => {
    renderAt("/", "/", <Index />);
    await waitFor(() => expect(jsonLd("organization")).not.toBeNull());

    const org = jsonLd("organization");
    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("EducationalOrganization");
    expect(org.name).toBe(BRAND);
    expect(org.url).toBe(`${SITE_URL}/`);
    expect(org.telephone.replace(/\D/g, "")).toBe(PHONE_DIGITS);
    expect(org.email).toMatch(/@asbtraininghub\.com$/);

    const address = org.address;
    expect(address["@type"]).toBe("PostalAddress");
    for (const field of [
      "streetAddress",
      "addressLocality",
      "addressRegion",
      "postalCode",
      "addressCountry",
    ]) {
      expect(address[field], `address is missing ${field}`).toBeTruthy();
    }
  });

  it("declares a logo and image so an answer panel can render the brand", async () => {
    renderAt("/", "/", <Index />);
    await waitFor(() => expect(jsonLd("organization")).not.toBeNull());
    const org = jsonLd("organization");
    expect(org.logo, "organisation JSON-LD has no logo").toBeTruthy();
    expect(org.image, "organisation JSON-LD has no image").toBeTruthy();
  });

  it("declares opening hours, which local answer engines quote directly", async () => {
    renderAt("/", "/", <Index />);
    await waitFor(() => expect(jsonLd("organization")).not.toBeNull());
    expect(
      jsonLd("organization").openingHours ?? jsonLd("organization").openingHoursSpecification,
      "no opening hours in the organisation entity, but the FAQ states them",
    ).toBeTruthy();
  });

  it("declares geo coordinates for map and near-me answers", async () => {
    renderAt("/", "/", <Index />);
    await waitFor(() => expect(jsonLd("organization")).not.toBeNull());
    expect(jsonLd("organization").geo, "no geo coordinates on the local entity").toBeTruthy();
  });

  it("links out to the profiles that corroborate the entity", async () => {
    renderAt("/", "/", <Index />);
    await waitFor(() => expect(jsonLd("organization")).not.toBeNull());
    const sameAs = jsonLd("organization").sameAs ?? [];
    expect(Array.isArray(sameAs)).toBe(true);
    expect(
      sameAs.length,
      "sameAs should list social/Google Business profiles so models can verify the entity",
    ).toBeGreaterThanOrEqual(2);
  });
});

/* ------------------------------------------------------------------ *
 * AEO: course entity
 * ------------------------------------------------------------------ */
describe("AEO: course pages", () => {
  const sample = courses[0];

  it("emits a Course entity with a provider", async () => {
    renderAt(`/course/${sample.slug}`, "/course/:slug", <CourseDetail />);
    await waitFor(() => expect(jsonLd("course")).not.toBeNull());

    const course = jsonLd("course");
    expect(course["@context"]).toBe("https://schema.org");
    expect(course["@type"]).toBe("Course");
    expect(course.name).toBeTruthy();
    expect(course.description?.length).toBeGreaterThan(50);
    expect(course.provider?.name).toBe(BRAND);
  });

  it("declares hasCourseInstance so the mode and duration are answerable", async () => {
    renderAt(`/course/${sample.slug}`, "/course/:slug", <CourseDetail />);
    await waitFor(() => expect(jsonLd("course")).not.toBeNull());
    expect(
      jsonLd("course").hasCourseInstance,
      "Google requires hasCourseInstance (mode + duration) for course rich results",
    ).toBeTruthy();
  });

  it("exposes the per-course FAQs as structured data", async () => {
    const withFaqs = courses.find((c) => c.faqs.length > 0)!;
    renderAt(`/course/${withFaqs.slug}`, "/course/:slug", <CourseDetail />);
    await waitFor(() => expect(jsonLd("course")).not.toBeNull());
    expect(
      jsonLd("course-faq") ?? jsonLd("faq"),
      `${withFaqs.slug} renders FAQs on screen but publishes no FAQPage schema`,
    ).not.toBeNull();
  });

  it("publishes breadcrumbs so answer engines can place the page in the site", async () => {
    renderAt(`/course/${sample.slug}`, "/course/:slug", <CourseDetail />);
    await waitFor(() => expect(jsonLd("course")).not.toBeNull());
    expect(jsonLd("breadcrumb"), "no BreadcrumbList on a course detail page").not.toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * GEO: catalogue content quality
 * ------------------------------------------------------------------ */
describe("GEO: course catalogue is citable", () => {
  it("every course has a unique slug and id", () => {
    const slugs = courses.map((c) => c.slug);
    const ids = courses.map((c) => c.id);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every slug is url-safe and readable", () => {
    for (const course of courses) {
      expect(course.slug, `bad slug: ${course.slug}`).toMatch(/^[a-z0-9-]+$/);
      expect(course.slug.length).toBeLessThanOrEqual(70);
    }
  });

  it("every course carries a description a model can quote verbatim", () => {
    for (const course of courses) {
      expect(course.description.length, `${course.slug} description too short`).toBeGreaterThanOrEqual(60);
      expect(course.overview.length, `${course.slug} overview too short`).toBeGreaterThanOrEqual(100);
    }
  });

  it("every course states duration, mode and certificate", () => {
    for (const course of courses) {
      expect(course.duration, `${course.slug} has no duration`).toBeTruthy();
      expect(course.mode, `${course.slug} has no mode`).toBeTruthy();
      expect(course.certificate, `${course.slug} has no certificate line`).toBeTruthy();
    }
  });

  it("every course lists syllabus, outcomes, careers and tools", () => {
    for (const course of courses) {
      expect(course.syllabus.length, `${course.slug} syllabus`).toBeGreaterThanOrEqual(4);
      expect(course.learningOutcomes.length, `${course.slug} outcomes`).toBeGreaterThanOrEqual(3);
      expect(course.careers.length, `${course.slug} careers`).toBeGreaterThanOrEqual(3);
      expect(course.tools.length, `${course.slug} tools`).toBeGreaterThanOrEqual(2);
    }
  });

  it("every course answers at least three questions in its own FAQ block", () => {
    for (const course of courses) {
      expect(course.faqs.length, `${course.slug} has too few FAQs for AEO`).toBeGreaterThanOrEqual(3);
      for (const faq of course.faqs) {
        expect(faq.q.trim().endsWith("?"), `${course.slug}: "${faq.q}" is not a question`).toBe(true);
        expect(faq.a.trim().length, `${course.slug}: answer too short`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it("every course belongs to a declared category", () => {
    const ids = new Set(courseCategories.map((c) => c.id));
    for (const course of courses) {
      expect(ids.has(course.category), `${course.slug} has orphan category ${course.category}`).toBe(true);
    }
  });

  it("every category has at least one course, so no landing page is empty", () => {
    for (const category of courseCategories) {
      expect(
        courses.some((c) => c.category === category.id),
        `category ${category.id} has no courses but is linked from the nav and sitemap`,
      ).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ *
 * GEO: trust surfaces
 * ------------------------------------------------------------------ */
describe("GEO: trust and policy surfaces", () => {
  it("the terms page publishes structured data", async () => {
    renderAt("/terms-and-conditions", "/terms-and-conditions", <TermsAndConditions />);
    await waitFor(() => expect(jsonLd("terms-page")).not.toBeNull());
    expect(jsonLd("terms-page")["@context"]).toBe("https://schema.org");
  });

  it("the brand name is spelled consistently everywhere a model will read it", () => {
    const files = [
      "index.html",
      "public/llms.txt",
      "public/site.webmanifest",
      "src/lib/seo.ts",
    ];
    for (const file of files) {
      const source = readFileSync(path.join(root, file), "utf8");
      expect(source, `${file} never names the brand`).toContain(BRAND);
      expect(source, `${file} uses an inconsistent brand spelling`).not.toMatch(/ASB\s+training\s+hub/);
    }
  });
});
