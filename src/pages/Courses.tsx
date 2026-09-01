import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { courseCategories, type CourseCategory } from '@/data/courseCategories';
import { courseSummaries, getSummariesByCategory } from '@/data/courseSummaries';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { setPageSeo } from '@/lib/seo';

import { getCourseImages } from '@/data/courseImages';
import SmartImage from '@/components/SmartImage';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Courses = () => {
  const { category } = useParams<{ category?: string }>();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(category || 'all');

  useEffect(() => {
    setActiveTab(category || 'all');
  }, [category]);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? courseSummaries : getSummariesByCategory(activeTab as CourseCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.categoryLabel.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, search]);

  const currentCategory = activeTab !== 'all' ? courseCategories.find(c => c.id === activeTab) : undefined;
  const title = currentCategory ? currentCategory.label : 'All Courses';

  useEffect(() => {
    const seoByCategory: Record<string, { title: string; description: string; keywords: string }> = {
      erp: {
        title: 'ERP & SAP Courses in Trivandrum | ASB Training Hub',
        description: 'Explore practical ERP and SAP-style courses in finance, materials, sales, production, HR, quality, supply chain, ABAP, and more at ASB Training Hub, Trivandrum.',
        keywords: 'ERP courses Trivandrum, SAP training Kerala, SAP FICO course, SAP MM course, SAP SD training, ABAP training, ERP modules Kerala',
      },
      programming: {
        title: 'Programming Courses in Trivandrum | Python, Java, Web Development',
        description: 'Learn Python full stack, Java, JavaScript, C, C++, HTML, CSS, PHP, Ruby, Kotlin, Swift, and Dart with practical programming courses at ASB Training Hub.',
        keywords: 'programming courses Trivandrum, Python course Kerala, Java training Trivandrum, web development course, full stack course Kerala, coding classes Trivandrum',
      },
      ai: {
        title: 'AI, Machine Learning & Generative AI Courses in Trivandrum',
        description: 'Build job-ready AI skills with courses in AI, machine learning, deep learning, data science, NLP, robotics, generative AI, agentic AI, and full stack AI.',
        keywords: 'AI training Trivandrum, machine learning course Kerala, generative AI course, data science AI training, deep learning course, agentic AI training',
      },
      management: {
        title: 'Management Courses in Trivandrum | HR, Finance, Logistics & IT',
        description: 'Join professional management diploma courses in logistics, supply chain, warehouse, hospitality, finance, HR, and IT management at ASB Training Hub.',
        keywords: 'management courses Trivandrum, logistics course Kerala, HR management course, finance management diploma, IT management course, supply chain training',
      },
      internship: {
        title: 'Internship Programs in Trivandrum | Job-Oriented Training with Internship',
        description: 'Get practical training with internship programs in ERP, accounting, HR, Python full stack, AI, ML, GenAI, data science, agentic AI, and full stack AI.',
        keywords: 'internship programs Trivandrum, training with internship Kerala, Python internship course, AI internship, ERP internship, accounting internship, HR internship',
      },
    };
    const seo = currentCategory ? seoByCategory[currentCategory.id] : {
      title: 'Courses | ASB Training Hub ERP, AI, Programming & Management',
      description: 'Browse 50+ job-oriented courses at ASB Training Hub including ERP/SAP, programming, AI, management, and internship programs in Trivandrum.',
      keywords: 'ASB Training Hub courses, courses in Trivandrum, ERP courses, SAP training, AI courses, programming courses, management courses, internship programs',
    };
    setPageSeo({
      ...seo,
      path: currentCategory ? `/courses/${currentCategory.id}` : '/courses',
    });
  }, [currentCategory]);

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Programs</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">{title}</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">{currentCategory?.description || 'Browse 50+ industry-focused courses designed to launch your career.'}</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <label htmlFor="course-search" className="sr-only">Search courses</label>
              <Input
                id="course-search"
                type="search"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Link to="/courses" title="View all ASB Training Hub courses" className="inline-flex self-center">
              <Button variant={activeTab === 'all' ? 'default' : 'outline'} size="sm" className={activeTab === 'all' ? 'gradient-primary border-0 text-white' : ''}>
                All ({courseSummaries.length})
              </Button>
            </Link>
            {courseCategories.map(cat => (
              <Link key={cat.id} to={`/courses/${cat.id}`} title={`${cat.label} | ASB Training Hub`} className="inline-flex self-center">
                <Button variant={activeTab === cat.id ? 'default' : 'outline'} size="sm" className={activeTab === cat.id ? 'gradient-primary border-0 text-white' : ''}>
                  {cat.label} ({cat.count})
                </Button>
              </Link>
            ))}
          </div>

          {/* The card titles are h3, so the results group needs a real h2 above
              them - otherwise the outline jumps h1 -> h3 and the grouping is
              invisible to screen readers and crawlers. */}
          <h2 className="text-2xl font-bold font-heading mb-6">
            {search.trim()
              ? `${filtered.length} ${filtered.length === 1 ? 'course' : 'courses'} matching "${search.trim()}"`
              : currentCategory
                ? `${currentCategory.label} courses`
                : 'All courses'}
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No courses found matching your search.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <ScrollReveal key={course.id} delay={(i % 6) * 80}>
                  <Link to={`/course/${course.slug}`} title={`${course.title} course | ASB Training Hub`} className="group block h-full">
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full flex flex-col">
                      <div className="h-36 relative overflow-hidden">
                        <SmartImage
                          src={getCourseImages(course.id, course.category).primary}
                          alt={course.title}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          wrapperClassName="absolute inset-0"
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${courseCategories.find(c => c.id === course.category)?.color || 'from-primary to-secondary'} opacity-25 mix-blend-multiply pointer-events-none`} />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/70 to-transparent pointer-events-none" />
                        {course.internship && <span className="absolute top-3 right-3 bg-green-700 text-white text-xs font-semibold px-2 py-1 rounded-full">Internship</span>}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <span className="text-xs font-medium text-primary">{course.categoryLabel}</span>
                        <h3 className="text-lg font-bold font-heading mt-1 mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-3">{course.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                          <span>{course.duration}</span>
                          <span>{course.mode}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Courses;
