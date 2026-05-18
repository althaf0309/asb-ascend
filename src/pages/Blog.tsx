import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { fetchBlogs, type BlogPost } from '@/lib/api';
import { setPageSeo } from '@/lib/seo';

const blogFallbackImages: Record<string, string> = {
  Career: '/blog/internship-tips.png',
  Programming: '/blog/python-vs-java.png',
  AI: '/blog/ai-jobs-kerala.png',
  ERP: '/blog/erp-implementation.png',
};

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const formatDate = (value: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPageSeo({
      title: 'Blog | ASB Training Hub',
      description: 'Career insights, ERP, AI, programming, and internship resources from ASB Training Hub.',
      keywords: 'ASB blog, career training, ERP courses, AI training, programming courses',
      path: '/blog',
    });

    fetchBlogs()
      .then(setPosts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load blogs.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Blog</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">Career Insights & Resources</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Expert tips, industry trends, and career guidance from the ASB Training Hub team.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          {loading && <div className="text-center text-muted-foreground py-16">Loading blogs...</div>}
          {error && <div className="text-center text-destructive py-16">{error}</div>}
          {!loading && !error && posts.length === 0 && <div className="text-center text-muted-foreground py-16">No blogs published yet.</div>}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => {
              const imageSrc = post.imageUrl || blogFallbackImages[post.category] || '/blog/why-sap-career-2024.png';
              const imageAlt = post.imageAlt || `${post.title} blog cover`;
              return (
              <ScrollReveal key={post.slug} delay={(i % 6) * 80}>
                <Link to={`/blog/${post.slug}`} title={`${post.title} | ASB Training Hub blog`} className="block h-full group">
                  <article className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full flex flex-col">
                    <div className="h-44 gradient-primary flex items-center justify-center overflow-hidden">
                      <img src={imageSrc} alt={imageAlt} title={imageAlt} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs font-semibold text-primary">{post.category}</span>
                      <h3 className="text-lg font-bold font-heading mt-1 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground flex-1 mb-3">{post.excerpt}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(post.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                      </div>
                      <span className="mt-4 text-sm font-semibold text-primary inline-flex items-center gap-1">
                        Read more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                </Link>
              </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Blog;
