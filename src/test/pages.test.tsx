/**
 * Page-level rendering, accessibility and on-page SEO checks.
 * Each public route is mounted and audited for the things a crawler and a
 * screen reader both depend on: one H1, described images, real link text, and a
 * unique title/canonical pair.
 */
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";

import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Reviews from "@/pages/Reviews";
import Gallery from "@/pages/Gallery";
import FAQ from "@/pages/FAQ";
import Apply from "@/pages/Apply";
import TermsAndConditions from "@/pages/TermsAndConditions";
import NotFound from "@/pages/NotFound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryForm from "@/components/InquiryForm";
import { courses } from "@/data/courses";

const SITE_URL = "https://www.asbtraininghub.com";

const renderRoute = (entry: string, routePath: string, element: ReactElement) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  );

const canonical = () =>
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? "";
const robots = () =>
  document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? "";
const description = () =>
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "";

const publicPages: Array<[string, string, string, () => ReactElement]> = [
  ["home", "/", "/", () => <Index />],
  ["about", "/about", "/about", () => <About />],
  ["contact", "/contact", "/contact", () => <Contact />],
  ["courses", "/courses", "/courses", () => <Courses />],
  ["course category", "/courses/erp", "/courses/:category", () => <Courses />],
  ["course detail", `/course/${courses[0].slug}`, "/course/:slug", () => <CourseDetail />],
  ["reviews", "/reviews", "/reviews", () => <Reviews />],
  ["faq", "/faq", "/faq", () => <FAQ />],
  ["apply", "/apply", "/apply", () => <Apply />],
  ["terms", "/terms-and-conditions", "/terms-and-conditions", () => <TermsAndConditions />],
];

beforeEach(() => {
  document.head.innerHTML = "";
  document.title = "";
});

afterEach(() => {
  cleanup();
});

describe("every public page renders and sets its own SEO", () => {
  for (const [name, entry, routePath, element] of publicPages) {
    it(`${name} renders without crashing`, () => {
      expect(() => renderRoute(entry, routePath, element())).not.toThrow();
    });

    it(`${name} sets a unique canonical matching its route`, async () => {
      renderRoute(entry, routePath, element());
      await waitFor(() => expect(canonical()).not.toBe(""));
      expect(canonical()).toBe(`${SITE_URL}${entry}`);
    });

    it(`${name} sets a non-empty, length-appropriate title`, async () => {
      renderRoute(entry, routePath, element());
      await waitFor(() => expect(document.title).not.toBe(""));
      expect(document.title.length).toBeGreaterThanOrEqual(20);
      expect(document.title.length, `title too long: ${document.title}`).toBeLessThanOrEqual(70);
      expect(document.title).toContain("ASB Training Hub");
    });

    it(`${name} sets a meta description of 50-165 characters`, async () => {
      renderRoute(entry, routePath, element());
      await waitFor(() => expect(description()).not.toBe(""));
      expect(description().length).toBeGreaterThanOrEqual(50);
      expect(
        description().length,
        `description too long (${description().length}): ${description()}`,
      ).toBeLessThanOrEqual(165);
    });

    it(`${name} is indexable`, async () => {
      renderRoute(entry, routePath, element());
      await waitFor(() => expect(robots()).not.toBe(""));
      expect(robots()).toBe("index, follow");
    });

    it(`${name} renders exactly one H1`, async () => {
      renderRoute(entry, routePath, element());
      await waitFor(() => expect(document.querySelectorAll("h1").length).toBeGreaterThan(0));
      const h1s = document.querySelectorAll("h1");
      expect(h1s.length, `${name} has ${h1s.length} H1 elements`).toBe(1);
      expect(h1s[0].textContent!.trim().length).toBeGreaterThan(8);
    });

    it(`${name} gives every image alt text`, async () => {
      renderRoute(entry, routePath, element());
      await waitFor(() => expect(document.body.innerHTML).not.toBe(""));
      for (const img of Array.from(document.querySelectorAll("img"))) {
        // A decorative image is correctly alt="" + aria-hidden; only content
        // images exposed to the a11y tree need descriptive alt text.
        if (img.closest("[aria-hidden]")) continue;
        expect(
          img.getAttribute("alt"),
          `image without alt on ${name}: ${img.getAttribute("src")}`,
        ).toBeTruthy();
      }
    });

    it(`${name} does not skip from H1 straight past H2`, async () => {
      renderRoute(entry, routePath, element());
      await waitFor(() => expect(document.querySelectorAll("h1").length).toBeGreaterThan(0));
      const levels = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) =>
        Number(h.tagName[1]),
      );
      let previous = levels[0];
      for (const level of levels.slice(1)) {
        expect(level - previous, `heading jump on ${name}: h${previous} -> h${level}`).toBeLessThanOrEqual(1);
        previous = Math.max(previous, level);
      }
    });
  }
});

describe("private and error routes", () => {
  it("the 404 page is marked noindex", async () => {
    renderRoute("/definitely-missing", "*", <NotFound />);
    await waitFor(() => expect(robots()).not.toBe(""));
    expect(robots()).toBe("noindex, nofollow");
  });

  it("the gallery page's index directive agrees with robots.txt", async () => {
    renderRoute("/gallery", "/gallery", <Gallery />);
    await waitFor(() => expect(robots()).not.toBe(""));
    // robots.txt has `Disallow: /gallery`, so the page must not claim to be indexable.
    expect(robots()).toBe("noindex, nofollow");
  });
});

describe("navigation and internal linking", () => {
  const renderNav = () =>
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

  it("exposes a nav landmark with the primary routes", () => {
    renderNav();
    const links = Array.from(document.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    for (const route of ["/", "/about", "/courses", "/contact"]) {
      expect(links, `navbar is missing a link to ${route}`).toContain(route);
    }
  });

  it("has no empty or icon-only links without an accessible name", () => {
    renderNav();
    for (const link of Array.from(document.querySelectorAll("a"))) {
      const name =
        link.textContent?.trim() ||
        link.getAttribute("aria-label") ||
        link.getAttribute("title") ||
        "";
      expect(name, `link without accessible text: ${link.outerHTML.slice(0, 90)}`).not.toBe("");
    }
  });

  it("footer links use descriptive anchor text, not 'click here'", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    for (const link of Array.from(document.querySelectorAll("a"))) {
      const text = (link.textContent ?? "").trim().toLowerCase();
      expect(["click here", "here", "read more", "link"]).not.toContain(text);
    }
  });

  it("every external link is rel=noopener noreferrer", () => {
    render(
      <MemoryRouter>
        <Footer />
        <Navbar />
      </MemoryRouter>,
    );
    for (const link of Array.from(document.querySelectorAll('a[target="_blank"]'))) {
      const rel = link.getAttribute("rel") ?? "";
      expect(rel, `unsafe external link: ${link.getAttribute("href")}`).toContain("noopener");
      expect(rel).toContain("noreferrer");
    }
  });
});

describe("inquiry form", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("marks the required fields as required", () => {
    render(
      <MemoryRouter>
        <InquiryForm />
      </MemoryRouter>,
    );
    const name = screen.getByPlaceholderText("Full Name *");
    const phone = screen.getByPlaceholderText("Phone Number *");
    expect(name).toBeRequired();
    expect(phone).toBeRequired();
  });

  it("uses the email input type so mobile keyboards and validation work", () => {
    render(
      <MemoryRouter>
        <InquiryForm />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
  });

  it("does not submit when the required fields are blank", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(
      <MemoryRouter>
        <InquiryForm />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: /submit inquiry/i }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to the backend when the required fields are filled", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, id: "1" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      );

    render(
      <MemoryRouter>
        <InquiryForm />
      </MemoryRouter>,
    );
    await userEvent.type(screen.getByPlaceholderText("Full Name *"), "Test User");
    await userEvent.type(screen.getByPlaceholderText("Phone Number *"), "9876543210");
    await userEvent.click(screen.getByRole("button", { name: /submit inquiry/i }));

    await waitFor(() => {
      const calls = fetchSpy.mock.calls.map((c) => String(c[0]));
      expect(calls).toContain("/api/inquiries");
    });
  });

  it("labels every input for assistive technology", () => {
    render(
      <MemoryRouter>
        <InquiryForm />
      </MemoryRouter>,
    );
    for (const input of Array.from(document.querySelectorAll("input, textarea"))) {
      const id = input.getAttribute("id");
      const labelled =
        (id && document.querySelector(`label[for="${id}"]`)) ||
        input.getAttribute("aria-label") ||
        input.getAttribute("aria-labelledby");
      expect(
        labelled,
        `field relies on a placeholder alone: ${input.getAttribute("placeholder")}`,
      ).toBeTruthy();
    }
  });
});
