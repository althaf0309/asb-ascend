type InquiryPayload = {
  name: string;
  email?: string;
  phone: string;
  course?: string;
  message?: string;
  website?: string;
  formStartedAt?: number;
  turnstileToken?: string;
};

type ApplicationPayload = {
  name: string;
  email: string;
  phone: string;
  course: string;
  qualification?: string;
  experience?: string;
  preferredMode?: string;
  callbackTime?: string;
  message?: string;
  website?: string;
  formStartedAt?: number;
  turnstileToken?: string;
};

type NewsletterPayload = {
  email: string;
  website?: string;
  formStartedAt?: number;
  turnstileToken?: string;
};

export type AdminSubmission = {
  id: string;
  type: 'inquiry' | 'application' | 'newsletter';
  createdAt: string;
  updatedAt?: string;
  status?: string;
  note?: string;
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  qualification?: string;
  experience?: string;
  preferredMode?: string;
  callbackTime?: string;
  message?: string;
  ip?: string;
  userAgent?: string;
  verification?: 'screened' | 'turnstile';
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readTime: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  imageUrl?: string;
  imageAlt?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
};

type BlogPayload = {
  title: string;
  slug?: string;
  excerpt: string;
  category: string;
  author: string;
  readTime: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  imageData?: string;
  imageAlt?: string;
  content: string;
  published?: boolean;
  removeImage?: boolean;
};

/** The cookie carries the session; a literal token is only for non-browser callers. */
const authHeader = (token?: string): Record<string, string> =>
  token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {};

/**
 * All admin auth rides on an HttpOnly session cookie, so every request must
 * send credentials. Form notification emails are dispatched server-side.
 */
const submitJson = async (path: string, payload: unknown) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Submission failed. Please try again.');
  }

  return data;
};

export const submitInquiry = (payload: InquiryPayload) => submitJson('/api/inquiries', payload);

export const submitApplication = (payload: ApplicationPayload) =>
  submitJson('/api/applications', payload);

export const submitNewsletter = (payload: NewsletterPayload) =>
  submitJson('/api/newsletters', payload);

export const fetchBlogs = async (): Promise<BlogPost[]> => {
  const response = await fetch('/api/blogs');
  if (!response.ok) throw new Error('Unable to load blogs.');
  return response.json();
};

export const fetchBlog = async (slug: string): Promise<BlogPost> => {
  const response = await fetch(`/api/blogs/${slug}`);
  if (!response.ok) throw new Error('Blog not found.');
  return response.json();
};

export const adminLogin = async (username: string, password: string): Promise<string> => {
  const data = await submitJson('/api/admin/login', { username, password });
  return data.token;
};

/** Ends the server-side session and clears the auth cookie. */
export const logoutRequest = async () => {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }).catch(
    () => undefined,
  );
};

/** Returns true when the session cookie is still valid. */
export const checkSession = async (): Promise<boolean> => {
  const response = await fetch('/api/admin/session', { credentials: 'same-origin' }).catch(
    () => null,
  );
  return Boolean(response?.ok);
};

export const createBlog = async (payload: BlogPayload, token: string): Promise<BlogPost> => {
  const response = await fetch('/api/admin/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to save blog.');
  }

  return data.blog;
};

export const fetchAdminBlogs = async (token: string): Promise<BlogPost[]> => {
  const response = await fetch('/api/admin/blogs', {
    headers: authHeader(token),
    credentials: 'same-origin',
  });

  if (!response.ok) throw new Error('Unable to load admin blogs.');
  return response.json();
};

export const updateBlog = async (slug: string, payload: BlogPayload, token: string): Promise<BlogPost> => {
  const response = await fetch(`/api/admin/blogs/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to update blog.');
  }

  return data.blog;
};

export const deleteBlog = async (slug: string, token: string) => {
  const response = await fetch(`/api/admin/blogs/${slug}`, {
    method: 'DELETE',
    headers: authHeader(token),
    credentials: 'same-origin',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to delete blog.');
  }

  return data;
};

export const fetchAdminSubmissions = async (token: string): Promise<AdminSubmission[]> => {
  const response = await fetch('/api/admin/submissions', {
    headers: authHeader(token),
    credentials: 'same-origin',
  });

  if (!response.ok) throw new Error('Unable to load submissions.');
  return response.json();
};

export const updateAdminSubmission = async (
  submission: Pick<AdminSubmission, 'id' | 'type'> & { status?: string; note?: string },
  token: string,
): Promise<AdminSubmission> => {
  const response = await fetch(`/api/admin/submissions/${submission.type}/${submission.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    credentials: 'same-origin',
    body: JSON.stringify({ status: submission.status, note: submission.note }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to update submission.');
  }

  return data.submission;
};

/* ------------------------------------------------------------------ *
 * Courses
 * ------------------------------------------------------------------ */

export type CourseFaq = { q: string; a: string };

/** Full course record, as stored and edited in the admin. */
export type CatalogueEntry = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  icon: string;
  description: string;
  overview: string;
  duration: string;
  mode: string;
  internship: boolean;
  syllabus: string[];
  tools: string[];
  careers: string[];
  whoShouldJoin: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  projects: string[];
  certificate: string;
  faqs: CourseFaq[];
  content: string;
  imageUrl: string;
  imageAlt: string;
  secondaryImageUrl: string;
  secondaryImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

/** The trimmed shape the listing pages fetch (`?summary=1`). */
export type CatalogueSummary = Pick<
  CatalogueEntry,
  | 'id' | 'slug' | 'title' | 'category' | 'categoryLabel'
  | 'description' | 'duration' | 'mode' | 'internship' | 'icon'
  | 'imageUrl' | 'imageAlt'
>;

export type CourseCategoryInfo = { id: string; label: string; count: number };

/** What the admin form sends. Images travel as base64 data URIs. */
export type CataloguePayload = Partial<Omit<CatalogueEntry, 'createdAt' | 'updatedAt'>> & {
  title: string;
  description: string;
  imageData?: string;
  secondaryImageData?: string;
  removeImage?: boolean;
  removeSecondaryImage?: boolean;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  pages: number;
};

export const fetchCourseSummaries = async (category?: string): Promise<CatalogueSummary[]> => {
  const query = new URLSearchParams({ summary: '1' });
  if (category) query.set('category', category);
  const response = await fetch(`/api/courses?${query}`);
  if (!response.ok) throw new Error('Unable to load courses.');
  return response.json();
};

export const fetchCourse = async (slug: string): Promise<CatalogueEntry> => {
  const response = await fetch(`/api/courses/${slug}`);
  if (!response.ok) throw new Error('Course not found.');
  return response.json();
};

export const fetchCourseCategories = async (): Promise<CourseCategoryInfo[]> => {
  const response = await fetch('/api/course-categories');
  if (!response.ok) throw new Error('Unable to load course categories.');
  return response.json();
};

/* --- generic catalogue admin (serves both courses and training) --- */

export const fetchAdminEntries = async (
  apiPath: string,
  token: string,
  { page = 1, perPage = 20, search = '', category = '' } = {},
): Promise<Paginated<CatalogueEntry>> => {
  const query = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  if (search) query.set('search', search);
  if (category) query.set('category', category);

  const response = await fetch(`/api/admin/${apiPath}?${query}`, {
    headers: authHeader(token),
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to load entries.');
  return response.json();
};

export const createEntry = async (
  apiPath: string,
  payload: CataloguePayload,
  token: string,
): Promise<CatalogueEntry> => {
  const response = await fetch(`/api/admin/${apiPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to save.');
  return data.item;
};

export const updateEntry = async (
  apiPath: string,
  slug: string,
  payload: CataloguePayload,
  token: string,
): Promise<CatalogueEntry> => {
  const response = await fetch(`/api/admin/${apiPath}/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to update.');
  return data.item;
};

export const deleteEntry = async (apiPath: string, slug: string, token: string) => {
  const response = await fetch(`/api/admin/${apiPath}/${slug}`, {
    method: 'DELETE',
    headers: authHeader(token),
    credentials: 'same-origin',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to delete.');
  return data;
};

/* --- training: public reads --------------------------------------- */

export const fetchTrainingSummaries = async (category?: string): Promise<CatalogueSummary[]> => {
  const query = new URLSearchParams({ summary: '1' });
  if (category) query.set('category', category);
  const response = await fetch(`/api/training?${query}`);
  if (!response.ok) throw new Error('Unable to load training programmes.');
  return response.json();
};

export const fetchTrainingProgramme = async (slug: string): Promise<CatalogueEntry> => {
  const response = await fetch(`/api/training/${slug}`);
  if (!response.ok) throw new Error('Training programme not found.');
  return response.json();
};

/* --- names kept for existing callers ------------------------------ */

export type Course = CatalogueEntry;
export type CourseSummary = CatalogueSummary;
export type CoursePayload = CataloguePayload;
