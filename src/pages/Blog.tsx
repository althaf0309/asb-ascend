import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const posts = [
  { slug: 'why-sap-career-2024', title: 'Why a SAP Career Is Still One of the Best Choices in 2024', excerpt: 'SAP continues to dominate enterprise software with S/4HANA migrations driving massive demand for skilled consultants across India.', date: 'Mar 15, 2024', readTime: '5 min', author: 'ASB Team', category: 'Career' },
  { slug: 'python-vs-java', title: 'Python vs Java: Which Should You Learn First?', excerpt: 'A detailed comparison of Python and Java to help you choose the right programming language for your career goals.', date: 'Mar 10, 2024', readTime: '7 min', author: 'ASB Team', category: 'Programming' },
  { slug: 'ai-jobs-kerala', title: 'Top AI Job Opportunities in Kerala\'s Tech Industry', excerpt: 'Explore the growing AI job market in Kerala\'s tech hubs including Technopark, Infopark, and startup ecosystem.', date: 'Mar 5, 2024', readTime: '6 min', author: 'ASB Team', category: 'AI' },
  { slug: 'internship-tips', title: '10 Tips to Make the Most of Your Internship', excerpt: 'Practical advice on how to maximize your learning, build connections, and convert your internship into a full-time offer.', date: 'Feb 28, 2024', readTime: '4 min', author: 'ASB Team', category: 'Career' },
  { slug: 'erp-implementation', title: 'Understanding ERP Implementation: A Beginner\'s Guide', excerpt: 'Learn the fundamentals of ERP implementation, key phases, and why SAP is the preferred choice for enterprises.', date: 'Feb 20, 2024', readTime: '8 min', author: 'ASB Team', category: 'ERP' },
  { slug: 'generative-ai-future', title: 'How Generative AI Is Reshaping Every Industry', excerpt: 'From healthcare to finance, GenAI is transforming how businesses operate. Learn what skills you need to stay ahead.', date: 'Feb 15, 2024', readTime: '6 min', author: 'ASB Team', category: 'AI' },
];

const Blog = () => (
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={(i % 6) * 80}>
              <div className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full flex flex-col">
                <div className="h-40 gradient-primary flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/20 font-heading">{post.category}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs font-semibold text-primary">{post.category}</span>
                  <h3 className="text-lg font-bold font-heading mt-1 mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default Blog;
