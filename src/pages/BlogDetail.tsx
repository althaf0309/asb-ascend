import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchBlog, type BlogPost } from '@/lib/api';
import InquiryForm from '@/components/InquiryForm';
import { removeJsonLd, setJsonLd, setPageSeo } from '@/lib/seo';
import { sanitizeBlogHtml } from '@/lib/sanitize';

const formatDate = (value: string) => new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));

const blogFallbackImages: Record<string, string> = {
  Career: '/blog/internship-tips.webp',
  Programming: '/blog/python-vs-java.webp',
  AI: '/blog/ai-jobs-kerala.webp',
  ERP: '/blog/erp-implementation.webp',
};

const blogCategoryToCourseInterest = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('ai')) return 'ai';
  if (normalized.includes('erp') || normalized.includes('sap')) return 'erp';
  if (normalized.includes('program')) return 'programming';
  if (normalized.includes('intern')) return 'internship';
  return undefined;
};

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetchBlog(slug)
      .then((blog) => {
        const seoImage = blog.imageUrl || blogFallbackImages[blog.category] || '/blog/why-sap-career-2024.webp';
        setPost(blog);
        setPageSeo({
          title: blog.metaTitle || `${blog.title} | ASB Training Hub`,
          description: blog.metaDescription || blog.excerpt,
          keywords: blog.keywords,
          path: `/blog/${blog.slug}`,
          image: seoImage,
          type: 'article',
        });
        setJsonLd('article', {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: blog.title,
          description: blog.metaDescription || blog.excerpt,
          author: {
            '@type': 'Organization',
            name: blog.author || 'ASB Training Hub',
          },
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'ASB Training Hub',
            url: 'https://www.asbtraininghub.com/',
          },
          datePublished: blog.createdAt,
          dateModified: blog.updatedAt || blog.createdAt,
          mainEntityOfPage: `https://www.asbtraininghub.com/blog/${blog.slug}`,
          image: seoImage.startsWith('http') ? seoImage : `https://www.asbtraininghub.com${seoImage}`,
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Blog not found.');
        removeJsonLd('article');
        setPageSeo({
          title: 'Blog Not Found | ASB Training Hub',
          description: 'The requested ASB Training Hub blog post could not be found.',
          keywords: 'ASB Training Hub blog, training articles',
          path: slug ? `/blog/${slug}` : '/blog',
          noindex: true,
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <main className="min-h-screen pt-32 text-center text-muted-foreground">Loading blog...</main>;
  }

  if (error || !post) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h1 className="text-3xl font-bold font-heading mb-3">Blog not found</h1>
        <p className="text-muted-foreground mb-6">{error || 'This post may have been removed.'}</p>
        <Link to="/blog" title="Back to ASB Training Hub blog" className="inline-flex self-center"><Button>Back to Blog</Button></Link>
      </main>
    );
  }

  const imageSrc = post.imageUrl || blogFallbackImages[post.category] || '/blog/why-sap-career-2024.webp';
  const imageAlt = post.imageAlt || `${post.title} blog cover`;

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/blog" title="Back to ASB Training Hub blog" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">{post.category}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-5">{post.title}</h1>
          <div className="mt-6 mb-6 overflow-hidden rounded-2xl border border-white/10">
            <img src={imageSrc} alt={imageAlt} title={imageAlt} className="max-h-[420px] w-full object-cover" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.readTime}</span>
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-6xl">
          {/* Article scrolls; the callback form rides alongside it and stays put.
              `items-start` matters - a stretched grid item cannot be sticky. */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 xl:gap-14 items-start">
            <article className="min-w-0">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">{post.excerpt}</p>
              <div className="blog-content" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }} />
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              {/* Capped so a short laptop screen scrolls the panel rather than
                  hiding the submit button below the fold. */}
              {/* Kept deliberately short. A sticky element can only travel
                  (article height - its own height), so every row trimmed here
                  is another row of article it stays pinned for. */}
              <div className="rounded-2xl border border-border bg-card/40 p-5 shadow-sm lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <h2 className="text-lg font-bold font-heading mb-4">Request a callback</h2>
                <InquiryForm stacked preselectedCourse={blogCategoryToCourseInterest(post.category)} />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogDetail;
