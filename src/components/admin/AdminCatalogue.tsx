import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { setPageSeo } from '@/lib/seo';
import { sanitizeBlogHtml } from '@/lib/sanitize';
import { useAdminAuth } from '@/components/admin/useAdminAuth';
import AdminNav from '@/components/admin/AdminNav';
import {
  createEntry,
  deleteEntry,
  fetchAdminEntries,
  updateEntry,
  type CatalogueEntry,
  type CataloguePayload,
} from '@/lib/api';
import {
  Bold, ChevronLeft, ChevronRight, Code, Italic, List, ListOrdered,
  Pencil, Plus, Redo, Trash2, Underline, Undo,
} from 'lucide-react';

const PER_PAGE = 10;

/**
 * Courses and training programmes are the same shape, so one screen serves both.
 * Everything that differs between them lives here.
 */
export type AdminCatalogueConfig = {
  /** URL segment the API is mounted on, e.g. "courses" or "training". */
  apiPath: string;
  /** Plural heading, e.g. "Courses". */
  title: string;
  /** Singular noun used in buttons and toasts, e.g. "Course". */
  singular: string;
  /** Public URL prefix for the row subtitle, e.g. "/course". */
  publicPrefix: string;
  categories: { id: string; label: string }[];
  defaultCategory: string;
};

/** List fields are edited as one item per line - simplest thing that reads well. */
const linesToList = (value: string) =>
  value.split('\n').map((l) => l.trim()).filter(Boolean);
const listToLines = (items: string[] = []) => items.join('\n');

/** FAQs are edited as `Question | Answer` per line. */
const linesToFaqs = (value: string) =>
  value
    .split('\n')
    .map((line) => {
      const [q, ...rest] = line.split('|');
      return { q: (q || '').trim(), a: rest.join('|').trim() };
    })
    .filter((f) => f.q && f.a);
const faqsToLines = (faqs: { q: string; a: string }[] = []) =>
  faqs.map((f) => `${f.q} | ${f.a}`).join('\n');

const makeEmptyForm = (defaultCategory: string) => ({
  title: '', slug: '', category: defaultCategory, categoryLabel: '', icon: 'GraduationCap',
  description: '', overview: '', duration: '3-6 Months', mode: 'Online & Offline',
  internship: false, certificate: '',
  syllabus: '', tools: '', careers: '', whoShouldJoin: '',
  learningOutcomes: '', prerequisites: '', projects: '', faqs: '',
  metaTitle: '', metaDescription: '', keywords: '',
  imageAlt: '', secondaryImageAlt: '',
});

const toolbar = [
  { label: 'Bold', icon: Bold, command: 'bold' },
  { label: 'Italic', icon: Italic, command: 'italic' },
  { label: 'Underline', icon: Underline, command: 'underline' },
  { label: 'Heading', icon: Code, command: 'formatBlock', value: 'h2' },
  { label: 'Bullet list', icon: List, command: 'insertUnorderedList' },
  { label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList' },
  { label: 'Undo', icon: Undo, command: 'undo' },
  { label: 'Redo', icon: Redo, command: 'redo' },
];

const AdminCatalogue = ({ config }: { config: AdminCatalogueConfig }) => {
  const {
    apiPath,
    title: pageTitle,
    singular,
    publicPrefix,
    categories: CATEGORIES,
    defaultCategory,
  } = config;
  const { toast } = useToast();
  const { token, loggingIn, login, logout, signedIn } = useAdminAuth();
  const editorRef = useRef<HTMLDivElement>(null);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const emptyForm = useMemo(() => makeEmptyForm(defaultCategory), [defaultCategory]);
  const [form, setForm] = useState(emptyForm);
  const [content, setContent] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [entries, setEntries] = useState<CatalogueEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const [imageData, setImageData] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [secondaryImageData, setSecondaryImageData] = useState('');
  const [secondaryPreview, setSecondaryPreview] = useState('');
  const [removeSecondaryImage, setRemoveSecondaryImage] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: `${pageTitle} Admin | ASB Training Hub`,
      description: `ASB Training Hub ${pageTitle.toLowerCase()} administration.`,
      keywords: 'ASB Training Hub admin',
      path: `/admin/${apiPath}`,
      noindex: true,
    });
  }, [apiPath, pageTitle]);

  const load = useCallback(async () => {
    if (!signedIn) return;
    setLoading(true);
    try {
      const result = await fetchAdminEntries(apiPath, token, { page, perPage: PER_PAGE, search, category });
      setEntries(result.items);
      setPages(result.pages);
      setTotal(result.total);
    } catch (error) {
      toast({
        title: `Unable to load ${pageTitle.toLowerCase()}`,
        description: error instanceof Error ? error.message : 'Please sign in again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [apiPath, signedIn, token, page, search, category, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  // A new search or filter should start from the first page, not page 4 of the
  // previous result set.
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials.username, credentials.password);
      toast({ title: 'Signed in', description: `You can manage ${pageTitle.toLowerCase()} now.` });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Check your credentials.',
        variant: 'destructive',
      });
    }
  };

  /** Downscales before upload so a phone photo does not become a 6 MB request. */
  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
      img.src = url;
    });

  const pickImage = (which: 'primary' | 'secondary') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file)
      .then((result) => {
        if (which === 'primary') { setImageData(result); setImagePreview(result); setRemoveImage(false); }
        else { setSecondaryImageData(result); setSecondaryPreview(result); setRemoveSecondaryImage(false); }
      })
      .catch(() => toast({ title: 'Could not read that image', variant: 'destructive' }));
  };

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current?.innerHTML || '');
  };

  const resetEditor = () => {
    setForm(emptyForm);
    setContent('');
    setEditingSlug('');
    setImageData(''); setImagePreview(''); setRemoveImage(false);
    setSecondaryImageData(''); setSecondaryPreview(''); setRemoveSecondaryImage(false);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const startNew = () => { resetEditor(); setShowEditor(true); };

  // Seed the contenteditable once it exists. Keyed on `showEditor` alone so it
  // does not fight the user while they type (typing updates `content`, not
  // `showEditor`).
  useEffect(() => {
    if (showEditor && editorRef.current) {
      editorRef.current.innerHTML = content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditor]);

  const startEdit = (course: CatalogueEntry) => {
    setEditingSlug(course.slug);
    setForm({
      title: course.title, slug: course.slug, category: course.category,
      categoryLabel: course.categoryLabel, icon: course.icon,
      description: course.description, overview: course.overview,
      duration: course.duration, mode: course.mode, internship: course.internship,
      certificate: course.certificate,
      syllabus: listToLines(course.syllabus),
      tools: listToLines(course.tools),
      careers: listToLines(course.careers),
      whoShouldJoin: listToLines(course.whoShouldJoin),
      learningOutcomes: listToLines(course.learningOutcomes),
      prerequisites: listToLines(course.prerequisites),
      projects: listToLines(course.projects),
      faqs: faqsToLines(course.faqs),
      metaTitle: course.metaTitle, metaDescription: course.metaDescription,
      keywords: course.keywords,
      imageAlt: course.imageAlt, secondaryImageAlt: course.secondaryImageAlt,
    });
    // The editor is not mounted yet (showEditor is still false), so the ref is
    // null here. The effect below writes the body once it renders.
    setContent(sanitizeBlogHtml(course.content || ''));
    setImageData(''); setImagePreview(course.imageUrl || ''); setRemoveImage(false);
    setSecondaryImageData(''); setSecondaryPreview(course.secondaryImageUrl || '');
    setRemoveSecondaryImage(false);
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: 'Title and description are required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // The contenteditable body carries whatever a paste brought with it, so
      // it is sanitised here as well as on the server.
      const html = sanitizeBlogHtml(editorRef.current?.innerHTML || content);
      const payload: CataloguePayload = {
        ...form,
        content: html,
        syllabus: linesToList(form.syllabus),
        tools: linesToList(form.tools),
        careers: linesToList(form.careers),
        whoShouldJoin: linesToList(form.whoShouldJoin),
        learningOutcomes: linesToList(form.learningOutcomes),
        prerequisites: linesToList(form.prerequisites),
        projects: linesToList(form.projects),
        faqs: linesToFaqs(form.faqs),
        imageData, secondaryImageData,
        removeImage, removeSecondaryImage,
        published: true,
      };

      const saved = editingSlug
        ? await updateEntry(apiPath, editingSlug, payload, token)
        : await createEntry(apiPath, payload, token);

      toast({
        title: editingSlug ? `${singular} updated` : `${singular} created`,
        description: `"${saved.title}" is live at ${publicPrefix}/${saved.slug}`,
      });
      resetEditor();
      setShowEditor(false);
      await load();
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

  const handleDelete = async (course: CatalogueEntry) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await deleteEntry(apiPath, course.slug, token);
      toast({ title: `${singular} deleted`, description: course.title });
      await load();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  /* ---------------------------------------------------------------- */

  if (!signedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold font-heading mb-1">{pageTitle} Admin</h1>
          <p className="text-sm text-muted-foreground mb-5">Sign in to manage {pageTitle.toLowerCase()}.</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="admin-user" className="sr-only">Username</label>
              <Input id="admin-user" autoComplete="username" placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="admin-pass" className="sr-only">Password</label>
              <Input id="admin-pass" type="password" autoComplete="current-password" placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} required />
            </div>
            <Button disabled={loggingIn} className="w-full gradient-primary border-0 text-white">
              {loggingIn ? 'Signing in...' : 'Login'}
            </Button>
          </div>
        </form>
      </main>
    );
  }

  const field = (key: keyof typeof form, label: string, rows = 4, hint?: string) => (
    <div>
      <label htmlFor={`f-${key}`} className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      <Textarea id={`f-${key}`} rows={rows} value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <main className="min-h-screen pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <AdminNav onLogout={logout} />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold font-heading">{pageTitle}</h1>
          <span className="text-sm text-muted-foreground">{total} total</span>
          <Button onClick={() => (showEditor ? (resetEditor(), setShowEditor(false)) : startNew())}
            className="ml-auto gradient-primary border-0 text-white">
            <Plus className="h-4 w-4 mr-2" aria-hidden /> {showEditor ? 'Close editor' : `New ${singular.toLowerCase()}`}
          </Button>
        </div>

        {showEditor && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 mb-8 space-y-6">
            <h2 className="text-xl font-bold font-heading">
              {editingSlug ? `Editing: ${editingSlug}` : `New ${singular.toLowerCase()}`}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="f-title" className="block text-sm font-medium mb-1">Title *</label>
                <Input id="f-title" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="f-slug" className="block text-sm font-medium mb-1">URL slug</label>
                <Input id="f-slug" placeholder="auto-generated from title" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-category" className="block text-sm font-medium mb-1">Category</label>
                <select id="f-category" value={form.category}
                  onChange={(e) => {
                    const next = CATEGORIES.find((c) => c.id === e.target.value);
                    setForm({ ...form, category: e.target.value, categoryLabel: next?.label || '' });
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="f-icon" className="block text-sm font-medium mb-1">Icon name</label>
                <Input id="f-icon" value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-duration" className="block text-sm font-medium mb-1">Duration</label>
                <Input id="f-duration" value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-mode" className="block text-sm font-medium mb-1">Mode</label>
                <Input id="f-mode" value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.internship}
                onChange={(e) => setForm({ ...form, internship: e.target.checked })} />
              Includes an internship
            </label>

            <div>
              <label htmlFor="f-description" className="block text-sm font-medium mb-1">
                Short description * <span className="font-normal text-muted-foreground">(used on cards)</span>
              </label>
              <Textarea id="f-description" rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            {field('overview', 'Overview', 3, 'Longer intro shown at the top of the course page.')}

            {/* --- images ------------------------------------------------ */}
            <fieldset className="grid md:grid-cols-2 gap-4">
              <legend className="text-sm font-medium mb-2">Images</legend>
              {([
                ['primary', 'Hero image', imagePreview, removeImage, setRemoveImage, 'imageAlt'],
                ['secondary', 'Second image', secondaryPreview, removeSecondaryImage, setRemoveSecondaryImage, 'secondaryImageAlt'],
              ] as const).map(([which, label, preview, removed, setRemoved, altKey]) => (
                <div key={which} className="rounded-xl border border-border p-4">
                  <p className="text-sm font-medium mb-2">{label}</p>
                  {preview && !removed && (
                    <img src={preview} alt="" className="mb-2 h-28 w-full rounded object-cover" />
                  )}
                  <input type="file" accept="image/*" onChange={pickImage(which)}
                    aria-label={`Upload ${label.toLowerCase()}`} className="text-sm" />
                  {preview && (
                    <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" checked={removed} onChange={(e) => setRemoved(e.target.checked)} />
                      Remove this image
                    </label>
                  )}
                  <Input className="mt-2" placeholder={`${label} alt text`} value={form[altKey]}
                    aria-label={`${label} alt text`}
                    onChange={(e) => setForm({ ...form, [altKey]: e.target.value })} />
                </div>
              ))}
            </fieldset>

            {/* --- rich body --------------------------------------------- */}
            <div>
              <p className="block text-sm font-medium mb-1">Page content</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {toolbar.map((t) => (
                  <Button key={t.label} type="button" size="sm" variant="outline" title={t.label}
                    aria-label={t.label} onClick={() => runCommand(t.command, t.value)}>
                    <t.icon className="h-4 w-4" aria-hidden />
                  </Button>
                ))}
              </div>
              <div ref={editorRef} contentEditable role="textbox" aria-multiline="true"
                aria-label="Page content"
                onInput={() => setContent(editorRef.current?.innerHTML || '')}
                className="blog-content min-h-[220px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            {/* --- structured lists -------------------------------------- */}
            <div className="grid md:grid-cols-2 gap-4">
              {field('syllabus', 'Syllabus', 6, 'One module per line.')}
              {field('learningOutcomes', 'Learning outcomes', 6, 'One per line.')}
              {field('tools', 'Tools', 4, 'One per line.')}
              {field('careers', 'Career paths', 4, 'One per line.')}
              {field('whoShouldJoin', 'Who should join', 4, 'One per line.')}
              {field('prerequisites', 'Prerequisites', 4, 'One per line.')}
              {field('projects', 'Projects', 4, 'One per line.')}
              {field('certificate', 'Certificate', 3)}
            </div>

            {field('faqs', 'FAQs', 6, 'One per line, as: Question | Answer')}

            {/* --- SEO ---------------------------------------------------- */}
            <fieldset className="rounded-xl border border-border p-4 space-y-3">
              <legend className="text-sm font-medium px-1">SEO</legend>
              <div>
                <label htmlFor="f-metaTitle" className="block text-sm mb-1">
                  Meta title <span className="text-muted-foreground">({form.metaTitle.length}/60 ideal)</span>
                </label>
                <Input id="f-metaTitle" value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-metaDescription" className="block text-sm mb-1">
                  Meta description <span className="text-muted-foreground">({form.metaDescription.length}/155 ideal)</span>
                </label>
                <Textarea id="f-metaDescription" rows={2} value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-keywords" className="block text-sm mb-1">Keywords</label>
                <Input id="f-keywords" placeholder="comma, separated, keywords" value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting} className="gradient-primary border-0 text-white">
                {submitting ? 'Saving...' : `${editingSlug ? 'Update' : 'Create'} ${singular.toLowerCase()}`}
              </Button>
              <Button type="button" variant="outline" className="bg-transparent"
                onClick={() => { resetEditor(); setShowEditor(false); }}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* --- filters ------------------------------------------------- */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="course-search" className="sr-only">Search {pageTitle.toLowerCase()}</label>
            <Input id="course-search" type="search" placeholder={`Search ${pageTitle.toLowerCase()} by title or slug...`}
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label htmlFor="course-filter" className="sr-only">Filter by category</label>
            <select id="course-filter" value={category} onChange={(e) => setCategory(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* --- list ---------------------------------------------------- */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">{singular}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Duration</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Images</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                )}
                {!loading && entries.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nothing found.</td></tr>
                )}
                {!loading && entries.map((course) => (
                  <tr key={course.slug} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{course.title}</div>
                      <div className="text-xs text-muted-foreground">{publicPrefix}/{course.slug}</div>
                    </td>
                    <td className="px-4 py-3">{course.categoryLabel}</td>
                    <td className="px-4 py-3">{course.duration}</td>
                    <td className="px-4 py-3">
                      {[course.imageUrl, course.secondaryImageUrl].filter(Boolean).length} / 2
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent"
                          onClick={() => startEdit(course)} aria-label={`Edit ${course.title}`}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button size="sm" variant="outline"
                          className="bg-transparent border-red-500/40 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(course)} aria-label={`Delete ${course.title}`}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- pagination ---------------------------------------------- */}
        {pages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Result pages">
            <Button variant="outline" size="sm" className="bg-transparent" disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4 mr-1" aria-hidden /> Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2" aria-live="polite">
              Page {page} of {pages}
            </span>
            <Button variant="outline" size="sm" className="bg-transparent" disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              Next <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
            </Button>
          </nav>
        )}
      </div>
    </main>
  );
};

export default AdminCatalogue;
