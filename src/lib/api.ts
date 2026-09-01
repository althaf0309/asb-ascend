type InquiryPayload = {
  name: string;
  email?: string;
  phone: string;
  course?: string;
  message?: string;
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
};

type NewsletterPayload = {
  email: string;
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
