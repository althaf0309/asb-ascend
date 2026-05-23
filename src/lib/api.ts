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

const WEB3FORMS_ACCESS_KEY = '1f6ef811-86bb-414d-bd19-0dd70acef36e';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const submitWeb3Form = async (payload: Record<string, unknown>) => {
  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      from_name: 'ASB Training Hub Website',
      botcheck: false,
      ...payload,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const message = data.message || data?.body?.message || 'Submission failed. Please try again.';
    throw new Error(message);
  }

  return data;
};

const submitJson = async (path: string, payload: unknown) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Submission failed. Please try again.');
  }

  return data;
};

export const submitInquiry = async (payload: InquiryPayload) => {
  const [stored] = await Promise.all([
    submitJson('/api/inquiries', payload),
    submitWeb3Form({
      subject: 'New Course Inquiry - ASB Training Hub',
      form_type: 'Course Inquiry',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      course_interest: payload.course || 'Not selected',
      message: payload.message || 'No message provided',
    }),
  ]);

  return stored;
};

export const submitApplication = async (payload: ApplicationPayload) => {
  const [stored] = await Promise.all([
    submitJson('/api/applications', payload),
    submitWeb3Form({
      subject: 'New Course Application - ASB Training Hub',
      form_type: 'Course Application',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      course: payload.course,
      qualification: payload.qualification || 'Not provided',
      experience: payload.experience || 'Not provided',
      preferred_mode: payload.preferredMode || 'Not selected',
      callback_time: payload.callbackTime || 'Not provided',
      message: payload.message || 'No message provided',
    }),
  ]);

  return stored;
};

export const submitNewsletter = async (payload: NewsletterPayload) => {
  const [stored] = await Promise.all([
    submitJson('/api/newsletters', payload),
    submitWeb3Form({
      subject: 'New Newsletter Subscription - ASB Training Hub',
      form_type: 'Newsletter Subscription',
      email: payload.email,
    }),
  ]);

  return stored;
};

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

export const createBlog = async (payload: BlogPayload, token: string): Promise<BlogPost> => {
  const response = await fetch('/api/admin/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Unable to load admin blogs.');
  return response.json();
};

export const updateBlog = async (slug: string, payload: BlogPayload, token: string): Promise<BlogPost> => {
  const response = await fetch(`/api/admin/blogs/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to delete blog.');
  }

  return data;
};

export const fetchAdminSubmissions = async (token: string): Promise<AdminSubmission[]> => {
  const response = await fetch('/api/admin/submissions', {
    headers: { Authorization: `Bearer ${token}` },
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
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: submission.status, note: submission.note }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to update submission.');
  }

  return data.submission;
};
