import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Edit,
  FileDown,
  AlignCenter, AlignLeft, AlignRight, Bold, Code, Eye, Heading1, Image, Italic,
  Inbox,
  Link as LinkIcon, List, ListOrdered, LogOut, Quote, Redo, Save, Strikethrough,
  Table, Trash2, Underline, Undo, Upload, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  adminLogin,
  createBlog,
  deleteBlog,
  fetchAdminBlogs,
  fetchAdminSubmissions,
  updateAdminSubmission,
  updateBlog,
  type AdminSubmission,
  type BlogPost,
} from '@/lib/api';
import { setPageSeo } from '@/lib/seo';

const tokenKey = 'asb-admin-token';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  category: 'Career',
  author: 'ASB Team',
  readTime: '5 min',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  imageAlt: '',
};

const toolbarGroups = [
  [
    { label: 'Bold', icon: Bold, command: 'bold' },
    { label: 'Italic', icon: Italic, command: 'italic' },
    { label: 'Underline', icon: Underline, command: 'underline' },
    { label: 'Strike', icon: Strikethrough, command: 'strikeThrough' },
  ],
  [
    { label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList' },
    { label: 'Bulleted list', icon: List, command: 'insertUnorderedList' },
    { label: 'Quote', icon: Quote, command: 'formatBlock', value: 'blockquote' },
  ],
  [
    { label: 'Align left', icon: AlignLeft, command: 'justifyLeft' },
    { label: 'Align center', icon: AlignCenter, command: 'justifyCenter' },
    { label: 'Align right', icon: AlignRight, command: 'justifyRight' },
  ],
  [
    { label: 'Link', icon: LinkIcon, command: 'createLink' },
    { label: 'Image', icon: Image, command: 'insertImage' },
    { label: 'Table', icon: Table, command: 'insertHTML', value: '<table><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table>' },
  ],
  [
    { label: 'Code', icon: Code, command: 'formatBlock', value: 'pre' },
    { label: 'Fullscreen', icon: Eye, command: '' },
    { label: 'Undo', icon: Undo, command: 'undo' },
    { label: 'Redo', icon: Redo, command: 'redo' },
  ],
];

const AdminBlog = () => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '');
  const [login, setLogin] = useState({ username: '', password: '' });
  const [form, setForm] = useState(emptyForm);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [activeView, setActiveView] = useState<'blogs' | 'submissions'>('blogs');
  const [submissionDrafts, setSubmissionDrafts] = useState<Record<string, { status: string; note: string }>>({});
  const [editingSlug, setEditingSlug] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [imageData, setImageData] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'Blog Admin | ASB Training Hub',
      description: 'ASB Training Hub blog administration.',
      keywords: 'ASB Training Hub admin',
      path: '/admin/blog',
      noindex: true,
    });
  }, []);

  const loadBlogs = useCallback(async (authToken = token) => {
    if (!authToken) return;
    setLoadingBlogs(true);
    try {
      setBlogs(await fetchAdminBlogs(authToken));
    } catch (error) {
      toast({
        title: 'Unable to load blogs',
        description: error instanceof Error ? error.message : 'Please login again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingBlogs(false);
    }
  }, [toast, token]);

  const loadSubmissions = useCallback(async (authToken = token) => {
    if (!authToken) return;
    setLoadingSubmissions(true);
    try {
      const nextSubmissions = await fetchAdminSubmissions(authToken);
      setSubmissions(nextSubmissions);
      setSubmissionDrafts(Object.fromEntries(nextSubmissions.map((submission) => [
        `${submission.type}:${submission.id}`,
        { status: submission.status || 'new', note: submission.note || '' },
      ])));
    } catch (error) {
      toast({
        title: 'Unable to load submissions',
        description: error instanceof Error ? error.message : 'Please login again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSubmissions(false);
    }
  }, [toast, token]);

  useEffect(() => {
    if (token) {
      void loadBlogs(token);
      void loadSubmissions(token);
    }
  }, [loadBlogs, loadSubmissions, token]);

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    if (command === 'createLink') {
      const url = window.prompt('Enter link URL');
      if (url) document.execCommand(command, false, url);
      return;
    }
    if (command === 'insertImage') {
      const url = window.prompt('Enter image URL');
      if (url) document.execCommand(command, false, url);
      return;
    }
    if (command) document.execCommand(command, false, value);
    setContent(editorRef.current?.innerHTML || '');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const nextToken = await adminLogin(login.username, login.password);
      localStorage.setItem(tokenKey, nextToken);
      setToken(nextToken);
      await loadBlogs(nextToken);
      await loadSubmissions(nextToken);
      toast({ title: 'Logged in', description: 'You can manage blog posts and form submissions now.' });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check credentials.',
        variant: 'destructive',
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
      img.src = url;
    });

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Image must be smaller than 10 MB', variant: 'destructive' });
      return;
    }

    compressImage(file).then((result) => {
      setImageData(result);
      setImagePreview(result);
      setRemoveImage(false);
    }).catch(() => {
      toast({ title: 'Failed to process image', variant: 'destructive' });
    });
  };

  const resetEditor = () => {
    setForm(emptyForm);
    setEditingSlug('');
    setExistingImageUrl('');
    setRemoveImage(false);
    setImageData('');
    setImagePreview('');
    setContent('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const startEdit = (blog: BlogPost) => {
    setEditingSlug(blog.slug);
    setForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      category: blog.category || 'Career',
      author: blog.author || 'ASB Team',
      readTime: blog.readTime || '5 min',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      keywords: blog.keywords || '',
      imageAlt: blog.imageAlt || '',
    });
    setExistingImageUrl(blog.imageUrl || '');
    setRemoveImage(false);
    setImageData('');
    setImagePreview('');
    setContent(blog.content || '');
    if (editorRef.current) editorRef.current.innerHTML = blog.content || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (blog: BlogPost) => {
    const confirmed = window.confirm(`Delete "${blog.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteBlog(blog.slug, token);
      if (editingSlug === blog.slug) resetEditor();
      await loadBlogs();
      toast({ title: 'Blog deleted', description: `"${blog.title}" was removed.` });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const html = editorRef.current?.innerHTML || content;
    if (!form.title.trim() || !html.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }
    if ((imageData || existingImageUrl) && !form.imageAlt.trim()) {
      toast({ title: 'Image alt text is required for SEO', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, imageData, removeImage, content: html, published: true };
      const post = editingSlug
        ? await updateBlog(editingSlug, payload, token)
        : await createBlog(payload, token);
      resetEditor();
      await loadBlogs();
      toast({
        title: editingSlug ? 'Blog updated' : 'Blog published',
        description: `"${post.title}" is live on the blog page.`,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    setToken('');
    setBlogs([]);
    setSubmissions([]);
    setSubmissionDrafts({});
    resetEditor();
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const submissionKey = (submission: AdminSubmission) => `${submission.type}:${submission.id}`;

  const updateDraft = (submission: AdminSubmission, patch: Partial<{ status: string; note: string }>) => {
    const key = submissionKey(submission);
    setSubmissionDrafts((current) => ({
      ...current,
      [key]: {
        status: current[key]?.status || submission.status || 'new',
        note: current[key]?.note || submission.note || '',
        ...patch,
      },
    }));
  };

  const saveSubmission = async (submission: AdminSubmission) => {
    const key = submissionKey(submission);
    const draft = submissionDrafts[key] || { status: submission.status || 'new', note: submission.note || '' };

    try {
      await updateAdminSubmission({ id: submission.id, type: submission.type, ...draft }, token);
      await loadSubmissions();
      toast({ title: 'Submission updated', description: 'Status and notes were saved.' });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const exportSubmissions = () => {
    const headers = ['Type', 'Status', 'Name', 'Email', 'Phone', 'Course', 'Message', 'Note', 'Created At'];
    const rows = submissions.map((submission) => [
      submission.type,
      submission.status || 'new',
      submission.name || '',
      submission.email || '',
      submission.phone || '',
      submission.course || '',
      submission.message || '',
      submission.note || '',
      formatDateTime(submission.createdAt),
    ]);

    const escapeCsv = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asb-form-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <main className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-24">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-xl border border-white/10 bg-white p-6 shadow-xl">
          <h1 className="text-2xl font-bold font-heading mb-2">Admin Login</h1>
          <p className="text-sm text-muted-foreground mb-5">Sign in to add blog posts.</p>
          <div className="space-y-4">
            <Input placeholder="Username" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} required />
            <Input placeholder="Password" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required />
            <Button disabled={loggingIn} className="w-full gradient-primary border-0 text-white">
              {loggingIn ? 'Signing in...' : 'Login'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Default: admin / admin123</p>
        </form>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <section className="gradient-bg pt-28 pb-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Admin</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mt-1">
              {editingSlug ? 'Edit Blog Post' : 'Add Blog Post'}
            </h1>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-fit" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="container mx-auto max-w-6xl mb-6">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row">
            <Button type="button" variant={activeView === 'blogs' ? 'default' : 'outline'} className={activeView === 'blogs' ? 'gradient-primary border-0 text-white' : ''} onClick={() => setActiveView('blogs')}>
              <Edit className="h-4 w-4 mr-2" /> Blog Posts
            </Button>
            <Button type="button" variant={activeView === 'submissions' ? 'default' : 'outline'} className={activeView === 'submissions' ? 'gradient-primary border-0 text-white' : ''} onClick={() => setActiveView('submissions')}>
              <Inbox className="h-4 w-4 mr-2" /> Form Submissions ({submissions.length})
            </Button>
          </div>
        </div>

        {activeView === 'submissions' ? (
          <div className="container mx-auto max-w-6xl space-y-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                <div>
                  <h2 className="font-heading text-xl font-bold">Contact Form Submissions</h2>
                  <p className="text-sm text-muted-foreground">View inquiries, applications, and newsletter submissions saved in the backend.</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => loadSubmissions()}>
                    Refresh
                  </Button>
                  <Button type="button" className="gradient-primary border-0 text-white" onClick={exportSubmissions} disabled={submissions.length === 0}>
                    <FileDown className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </div>
              </div>

              {loadingSubmissions ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No form submissions yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-3 pr-3 font-medium">Lead</th>
                        <th className="py-3 pr-3 font-medium">Type</th>
                        <th className="py-3 pr-3 font-medium">Details</th>
                        <th className="py-3 pr-3 font-medium">Time</th>
                        <th className="py-3 pr-3 font-medium">Status / Note</th>
                        <th className="py-3 pr-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => {
                        const key = submissionKey(submission);
                        const draft = submissionDrafts[key] || { status: submission.status || 'new', note: submission.note || '' };
                        return (
                          <tr key={key} className="border-b border-border align-top last:border-0">
                            <td className="py-3 pr-3">
                              <div className="font-medium">{submission.name || submission.email || 'Newsletter subscriber'}</div>
                              {submission.email && <a href={`mailto:${submission.email}`} className="block text-xs text-primary">{submission.email}</a>}
                              {submission.phone && <a href={`tel:${submission.phone}`} className="block text-xs text-muted-foreground">{submission.phone}</a>}
                            </td>
                            <td className="py-3 pr-3 capitalize">{submission.type}</td>
                            <td className="py-3 pr-3">
                              <div className="max-w-xs space-y-1 text-xs text-muted-foreground">
                                {submission.course && <div><span className="font-medium text-foreground">Course:</span> {submission.course}</div>}
                                {submission.qualification && <div><span className="font-medium text-foreground">Qualification:</span> {submission.qualification}</div>}
                                {submission.preferredMode && <div><span className="font-medium text-foreground">Mode:</span> {submission.preferredMode}</div>}
                                {submission.callbackTime && <div><span className="font-medium text-foreground">Callback:</span> {submission.callbackTime}</div>}
                                {submission.message && <div className="line-clamp-3"><span className="font-medium text-foreground">Message:</span> {submission.message}</div>}
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-xs text-muted-foreground">{formatDateTime(submission.createdAt)}</td>
                            <td className="py-3 pr-3">
                              <div className="space-y-2">
                                <select
                                  value={draft.status}
                                  onChange={(event) => updateDraft(submission, { status: event.target.value })}
                                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                                  aria-label="Submission status"
                                >
                                  <option value="new">New</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="follow-up">Follow-up</option>
                                  <option value="converted">Converted</option>
                                  <option value="closed">Closed</option>
                                </select>
                                <Textarea
                                  value={draft.note}
                                  onChange={(event) => updateDraft(submission, { note: event.target.value })}
                                  placeholder="Admin note"
                                  className="min-h-[70px]"
                                />
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-right">
                              <Button type="button" size="sm" variant="outline" onClick={() => saveSubmission(submission)}>
                                Save
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
        <form onSubmit={handleSave} className="container mx-auto max-w-6xl space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Blog List</h2>
                <p className="text-sm text-muted-foreground">Edit or delete blog posts saved in the backend.</p>
              </div>
              <Button type="button" variant="outline" onClick={resetEditor}>
                Add New Blog
              </Button>
            </div>
            {loadingBlogs ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading blogs...</div>
            ) : blogs.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No blog posts yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-3 pr-3 font-medium">Title</th>
                      <th className="py-3 pr-3 font-medium">Category</th>
                      <th className="py-3 pr-3 font-medium">Updated</th>
                      <th className="py-3 pr-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => (
                      <tr key={blog.slug} className={`border-b border-border last:border-0 ${editingSlug === blog.slug ? 'bg-primary/5' : ''}`}>
                        <td className="py-3 pr-3">
                          <div className="font-medium">{blog.title}</div>
                          <div className="text-xs text-muted-foreground">/{blog.slug}</div>
                        </td>
                        <td className="py-3 pr-3">{blog.category}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{formatDateTime(blog.updatedAt || blog.createdAt)}</td>
                        <td className="py-3 pr-3">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(blog)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(blog)}>
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 space-y-4">
              <Input placeholder="Blog title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Short excerpt shown on blog cards" className="min-h-[90px]" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-semibold">Blog Image</div>
                    <div className="text-xs text-muted-foreground">Upload JPG, PNG, WEBP, or GIF up to 5 MB.</div>
                  </div>
                  {(imagePreview || existingImageUrl) && (
                    <Button type="button" variant="outline" size="sm" onClick={() => { setImageData(''); setImagePreview(''); setExistingImageUrl(''); setRemoveImage(true); }}>
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
                {imagePreview || existingImageUrl ? (
                  <img src={imagePreview || existingImageUrl} alt="Blog preview" title="Blog preview" className="mb-3 max-h-56 w-full rounded-md object-cover border border-border" />
                ) : (
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground hover:text-foreground">
                    <Upload className="h-6 w-6 mb-2" />
                    Click to upload blog image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
                  </label>
                )}
                <Input className="mt-3" placeholder="Image alt text for SEO/accessibility *" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              <Input placeholder="Read time (example: 5 min)" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-bold mb-1">SEO Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">These values are saved in the backend and applied on the public blog page.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Meta title for SEO" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              <Input placeholder="SEO keywords, comma separated" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
              <Textarea className="md:col-span-2 min-h-[90px]" placeholder="Meta description for Google search" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-[#3f7f96] text-white px-4 py-3 text-sm font-medium">Content</div>
            <div className="grid md:grid-cols-[190px_1fr] gap-0">
              <label className="px-4 py-5 text-sm font-semibold text-foreground">Content:</label>
              <div className="border-l border-border">
                <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-3 py-2">
                  <select
                    className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                    onChange={(e) => runCommand('formatBlock', e.target.value)}
                    defaultValue="p"
                    aria-label="Format"
                  >
                    <option value="p">Format</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="p">Paragraph</option>
                  </select>
                  <button type="button" title="Heading" onClick={() => runCommand('formatBlock', 'h2')} className="editor-btn"><Heading1 className="h-4 w-4" /></button>
                  {toolbarGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="flex items-center gap-1 border-l border-border pl-2 ml-1">
                      {group.map((item) => (
                        <button key={item.label} type="button" title={item.label} onClick={() => runCommand(item.command, item.value)} className="editor-btn">
                          <item.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => setContent(editorRef.current?.innerHTML || '')}
                  className="blog-editor min-h-[330px] bg-white p-6 text-sm leading-relaxed outline-none text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="gradient-primary border-0 text-white font-semibold">
              <Save className="h-4 w-4 mr-2" /> {submitting ? 'Saving...' : editingSlug ? 'Update Blog' : 'Publish Blog'}
            </Button>
          </div>
        </form>
        )}
      </section>
    </main>
  );
};

export default AdminBlog;
