import { test, expect, waitForTurnstile, adminSubmissions, ADMIN } from "./fixtures";

/**
 * Lead capture, end to end. A regression here silently costs enquiries:
 * until 2026-10 a hidden "I am human" step made the backend discard them.
 */
// The backend merges repeat enquiries (same email or phone and message within
// 24 hours), so every test uses its own contact details.
const uniquePhone = () => `9${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;

test("the contact page enquiry reaches admin as a verified lead", async ({ page, request }) => {
  const phone = uniquePhone();
  await page.goto("/contact");
  const form = page.locator("form").filter({ has: page.getByPlaceholder("Phone Number *") }).first();
  // No manual checkbox: the challenge must start on its own.
  await expect(page.getByText("I am human")).toHaveCount(0);
  await form.getByPlaceholder("Full Name *").fill("E2E Contact Lead");
  await form.getByPlaceholder("Phone Number *").fill(phone);
  await form.getByPlaceholder("Email").fill(`contact.${phone}@example.com`);
  await waitForTurnstile(page, form);
  await form.getByRole("button", { name: /submit|send|enquire|inquir/i }).click();
  await expect(page.getByText("Inquiry Submitted!", { exact: true })).toBeVisible();

  const lead = (await adminSubmissions(request)).find((s) => s.phone === phone);
  expect(lead, "the enquiry must be stored").toBeTruthy();
  expect(lead!.type).toBe("inquiry");
  expect(lead!.verification).toBe("turnstile");
});

test("the homepage enquiry form submits", async ({ page, request }) => {
  const phone = uniquePhone();
  await page.goto("/");
  const form = page.locator("form").filter({ has: page.getByPlaceholder("Phone Number *") }).first();
  await form.scrollIntoViewIfNeeded();
  await form.getByPlaceholder("Full Name *").fill("E2E Home Lead");
  await form.getByPlaceholder("Phone Number *").fill(phone);
  await waitForTurnstile(page, form);
  await form.getByRole("button", { name: /submit|send|enquire|inquir/i }).click();
  await expect(page.getByText("Inquiry Submitted!", { exact: true })).toBeVisible();
  expect((await adminSubmissions(request)).some((s) => s.phone === phone)).toBe(true);
});

test("a keyword landing page enquiry submits", async ({ page, request }) => {
  const phone = uniquePhone();
  await page.goto("/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi");
  const form = page.locator("form").first();
  await form.getByPlaceholder("Full Name *").fill("E2E Landing Lead");
  await form.getByPlaceholder("Phone Number *").fill(phone);
  await waitForTurnstile(page, form);
  await form.getByRole("button", { name: /submit|send|enquire|inquir/i }).click();
  await expect(page.getByText("Inquiry Submitted!", { exact: true })).toBeVisible();
  expect((await adminSubmissions(request)).some((s) => s.phone === phone)).toBe(true);
});

test("the application form reaches admin", async ({ page, request }) => {
  const phone = uniquePhone();
  await page.goto("/apply");
  const form = page.locator("form").filter({ has: page.getByPlaceholder("Email *") }).first();
  await form.getByPlaceholder("Full Name *").fill("E2E Applicant");
  await form.getByPlaceholder("Email *").fill(`applicant.${phone}@example.com`);
  await form.getByPlaceholder("Phone Number *").fill(phone);
  await form.getByRole("combobox").first().click();
  await page.getByRole("option").first().click();
  await waitForTurnstile(page, form);
  await form.getByRole("button", { name: /submit|apply/i }).click();
  await expect(page.getByText("Application Submitted!", { exact: true })).toBeVisible();
  const lead = (await adminSubmissions(request)).find((s) => s.phone === phone);
  expect(lead?.type).toBe("application");
});

test("an enquiry sent without a challenge token is kept for review, not lost", async ({ request }) => {
  const phone = uniquePhone();
  const res = await request.post("/api/inquiries", { data: { name: "No Token Visitor", phone, message: "Call me" } });
  expect(res.status()).toBe(201);
  const lead = (await adminSubmissions(request)).find((s) => s.phone === phone);
  expect(lead?.verification).toBe("unverified");
});

test("required fields are enforced before submitting", async ({ page }) => {
  await page.goto("/contact");
  const form = page.locator("form").filter({ has: page.getByPlaceholder("Phone Number *") }).first();
  await form.getByPlaceholder("Full Name *").fill("Only A Name");
  await form.getByRole("button", { name: /submit|send|enquire|inquir/i }).click();
  await expect(page.getByText(/required|valid phone/i).first()).toBeVisible();
});

test("admin can sign in and see enquiries", async ({ page, request }) => {
  const phone = uniquePhone();
  const name = `Admin View Lead ${phone}`;
  await request.post("/api/inquiries", { data: { name, phone } });
  await page.goto("/admin/blog");
  await page.getByPlaceholder("Username").fill(ADMIN.username);
  await page.getByPlaceholder("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: /log ?in|sign in/i }).click();
  await page.getByRole("button", { name: /Form Submissions/ }).click();
  await expect(page.getByText("Contact Form Submissions")).toBeVisible();
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText("Not verified — check before calling").first()).toBeVisible();
});

test("admin login rejects a wrong password", async ({ request }) => {
  const res = await request.post("/api/admin/login", { data: { username: ADMIN.username, password: "wrong-password-xyz" } });
  expect(res.status()).toBe(401);
});
