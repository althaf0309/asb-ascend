import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ArrowRight, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { courses, courseCategories, getCoursesByCategory, type CourseCategory } from '@/data/courses';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Courses = () => {
  const { category } = useParams<{ category?: string }>();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(category || 'all');

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? courses : getCoursesByCategory(activeTab as CourseCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.categoryLabel.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, search]);

  const currentCategory = courseCategories.find(c => c.id === category);
  const title = currentCategory ? currentCategory.label : 'All Courses';

  // Sync tab when route category changes
  if (category && activeTab !== category) setActiveTab(category);

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
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant={activeTab === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'gradient-primary border-0 text-white' : ''}>
              All ({courses.length})
            </Button>
            {courseCategories.map(cat => (
              <Button key={cat.id} variant={activeTab === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(cat.id)} className={activeTab === cat.id ? 'gradient-primary border-0 text-white' : ''}>
                {cat.label} ({cat.count})
              </Button>
            ))}
          </div>

          {/* Course Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No courses found matching your search.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <ScrollReveal key={course.id} delay={(i % 6) * 80}>
                  <Link to={`/course/${course.slug}`} className="group block h-full">
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full flex flex-col">
                      <div className={`h-36 bg-gradient-to-br ${courseCategories.find(c => c.id === course.category)?.color || 'from-primary to-secondary'} flex items-center justify-center relative`}>
                        <span className="text-3xl font-bold text-white/20 font-heading">{course.title.slice(0, 3)}</span>
                        {course.internship && <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Internship</span>}
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
