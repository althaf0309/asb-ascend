import { useParams, Link } from 'react-router-dom';
import { getCourseBySlug, courses, courseCategories } from '@/data/courses';
import { CheckCircle, Clock, MapPin, Award, Users, ArrowRight, BookOpen, Briefcase, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import InquiryForm from '@/components/InquiryForm';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const course = getCourseBySlug(slug || '');

  if (!course) return <div className="min-h-screen flex items-center justify-center pt-20"><p>Course not found.</p></div>;

  const catColor = courseCategories.find(c => c.id === course.category)?.color || 'from-primary to-secondary';
  const related = courses.filter(c => c.category === course.category && c.id !== course.id).slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className={`bg-gradient-to-br ${catColor} pt-28 pb-16`}>
        <div className="container mx-auto px-4">
          <Link to={`/courses/${course.category}`} className="text-white/70 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
            ← {course.categoryLabel}
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">{course.title}</h1>
          <p className="text-white/80 max-w-2xl text-lg mb-6">{course.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{course.mode}</span>
            {course.internship && <span className="flex items-center gap-1 bg-green-500/20 text-green-200 px-3 py-1 rounded-full"><Briefcase className="h-4 w-4" />Internship Included</span>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link to="/apply"><Button size="lg" className="bg-white text-foreground font-semibold hover:bg-white/90">Apply Now</Button></Link>
            <a href="https://wa.me/918714773304" target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10"><MessageCircle className="h-4 w-4 mr-2" />WhatsApp</Button></a>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Who Should Join */}
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-4 flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Who Should Join?</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.whoShouldJoin.map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" />{item}</div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Syllabus */}
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-4 flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Syllabus Highlights</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.syllabus.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm rounded-lg border border-border bg-card p-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-xs">{i + 1}</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Tools */}
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-4">Tools & Software</h2>
                  <div className="flex flex-wrap gap-2">
                    {course.tools.map(tool => (
                      <span key={tool} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">{tool}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Careers */}
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-4 flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" /> Career Opportunities</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.careers.map(career => (
                      <div key={career} className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-primary shrink-0" />{career}</div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* FAQ */}
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-4">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {course.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4 bg-card">
                        <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
                  <h3 className="text-lg font-bold font-heading mb-4">Enquire About This Course</h3>
                  <InquiryForm preselectedCourse={course.category} />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h4 className="font-bold font-heading mb-3">Course Highlights</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Duration: {course.duration}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Mode: {course.mode}</div>
                    <div className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" />Certificate Included</div>
                    {course.internship && <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-green-500" />Internship Available</div>}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Related Courses */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold font-heading mb-6">Related Courses</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(c => (
                  <Link key={c.id} to={`/course/${c.slug}`} className="group block">
                    <div className="rounded-xl border border-border bg-card p-5 hover-lift">
                      <span className="text-xs text-primary font-medium">{c.categoryLabel}</span>
                      <h3 className="font-bold font-heading mt-1 group-hover:text-primary transition-colors">{c.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CourseDetail;
