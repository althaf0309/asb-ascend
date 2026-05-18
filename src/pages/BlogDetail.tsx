import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchBlog, type BlogPost } from '@/lib/api';
import InquiryForm from '@/components/InquiryForm';
import { removeJsonLd, setJsonLd, setPageSeo } from '@/lib/seo';

const formatDate = (value: string) => new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));

const blogFallbackImages: Record<string, string> = {
  Career: '/blog/internship-tips.png',
  Programming: '/blog/python-vs-java.png',
  AI: '/blog/ai-jobs-kerala.png',
  ERP: '/blog/erp-implementation.png',
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
        const seoImage = blog.imageUrl || blogFallbackImages[blog.category] || '/blog/why-sap-career-2024.png';
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
        <Link to="/blog" title="Back to ASB Training Hub blog"><Button>Back to Blog</Button></Link>
      </main>
    );
  }

  const imageSrc = post.imageUrl || blogFallbackImages[post.category] || '/blog/why-sap-career-2024.png';
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
        <article className="container mx-auto max-w-3xl">
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">{post.excerpt}</p>
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </section>

      <section className="section-padding bg-card/40 border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Need guidance?</span>
              <h2 className="text-3xl font-bold font-heading mt-2 mb-4">Talk to ASB Training Hub</h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Ask about courses, internships, demo classes, fees, or placement support. Our admissions team will help you choose the right path.
              </p>
              <a
                href="https://wa.me/918714773304?text=Hi%20ASB%20Training%20Hub%2C%20I%20read%20your%20blog%20and%20want%20course%20guidance."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <h3 className="text-xl font-bold font-heading mb-4">Request a callback</h3>
              <InquiryForm preselectedCourse={blogCategoryToCourseInterest(post.category)} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogDetail;
