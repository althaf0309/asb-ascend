import { useParams, Link } from 'react-router-dom';
import { getCourseBySlug, courses, courseCategories } from '@/data/courses';
import {
  CheckCircle, Clock, MapPin, Award, Users, ArrowRight, BookOpen, Briefcase,
  MessageCircle, Sparkles, Target, Layers, GraduationCap, Rocket, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import InquiryForm from '@/components/InquiryForm';

import { getCourseImages } from '@/data/courseImages';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const course = getCourseBySlug(slug || '');

  if (!course) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
        <h1 className="text-3xl font-bold font-heading mb-3">Course not found</h1>
        <p className="text-muted-foreground mb-6">The course you're looking for may have been renamed.</p>
        <Link to="/courses"><Button>Browse all courses</Button></Link>
      </main>
    );
  }

  const catColor = courseCategories.find(c => c.id === course.category)?.color || 'from-primary to-secondary';
  const related = courses.filter(c => c.category === course.category && c.id !== course.id).slice(0, 3);
  const { primary: heroImg, secondary: secondaryImg } = getCourseImages(course.id, course.category);

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className={`absolute inset-0 bg-gradient-to-br ${catColor} opacity-80`} />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <Link to={`/courses/${course.category}`} className="text-white/80 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
            ← {course.categoryLabel}
          </Link>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-3 mb-4 max-w-4xl">{course.title}</h1>
          <p className="text-white/90 max-w-3xl text-lg md:text-xl mb-6 leading-relaxed">{course.description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-white/90 mb-6">
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full"><Clock className="h-4 w-4" />{course.duration}</span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full"><MapPin className="h-4 w-4" />{course.mode}</span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full"><Award className="h-4 w-4" />Certificate</span>
            {course.internship && (
              <span className="flex items-center gap-1.5 bg-emerald-500/25 text-emerald-100 px-3 py-1.5 rounded-full">
                <Briefcase className="h-4 w-4" />Internship Included
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/apply"><Button size="lg" className="bg-white text-foreground font-semibold hover:bg-white/90">Apply Now</Button></Link>
            <a href="https://wa.me/918714773304" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-white/5">
                <MessageCircle className="h-4 w-4 mr-2" />Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Quick stats strip */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary font-heading">{course.syllabus.length}+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Modules</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-heading">{course.tools.length}+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Tools</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-heading">{course.projects.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Projects</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-heading">{course.careers.length}+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Career Paths</div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview with secondary image */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" /> Course Overview
                </h2>
                <div className="grid md:grid-cols-5 gap-6 items-start">
                  <p className="md:col-span-3 text-muted-foreground leading-relaxed text-base">{course.overview}</p>
                  <div className="md:col-span-2 rounded-2xl overflow-hidden aspect-[4/3] border border-border">
                    <img src={secondaryImg} alt={`${course.title} learning environment`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" /> What You'll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who Should Join */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" /> Who Should Join?
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.whoShouldJoin.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" /> Prerequisites
                </h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Syllabus */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" /> Detailed Syllabus
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.syllabus.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-xs font-semibold">{i + 1}</span>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <Layers className="h-6 w-6 text-primary" /> Tools & Software
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course.tools.map(tool => (
                    <span key={tool} className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">{tool}</span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-primary" /> Hands-on Projects
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.projects.map((p, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 hover-lift">
                      <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                        <span>Project {i + 1}</span>
                      </div>
                      <p className="text-sm">{p}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Careers */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-primary" /> Career Opportunities
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.careers.map(career => (
                    <div key={career} className="flex items-center gap-2 text-sm rounded-lg border border-border bg-card p-3">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0" />{career}
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" /> Certification
                </h2>
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary text-white">
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="text-sm leading-relaxed">{course.certificate}</p>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {course.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4 bg-card">
                      <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 sticky top-24 shadow-sm">
                <h3 className="text-lg font-bold font-heading mb-4">Enquire about this course</h3>
                <InquiryForm preselectedCourse={course.category} />
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h4 className="font-bold font-heading mb-4">Course Highlights</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Duration: {course.duration}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Mode: {course.mode}</div>
                  <div className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" />Certificate Included</div>
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{course.syllabus.length} Modules</div>
                  <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" />{course.projects.length} Hands-on Projects</div>
                  {course.internship && <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-emerald-500" />Internship Available</div>}
                </div>
              </div>
              <a
                href="https://wa.me/918714773304"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl gradient-primary p-6 text-white text-center hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <div className="font-bold font-heading">Need help choosing?</div>
                <div className="text-sm text-white/90">Talk to our counsellor on WhatsApp</div>
              </a>
            </aside>
          </div>

          {/* Related Courses */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-6">Related Courses</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(c => (
                  <Link key={c.id} to={`/course/${c.slug}`} className="group block">
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full flex flex-col">
                      <div className="aspect-video overflow-hidden">
                        <img src={heroImages[c.category]} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <span className="text-xs text-primary font-semibold uppercase tracking-wide">{c.categoryLabel}</span>
                        <h3 className="font-bold font-heading mt-1 group-hover:text-primary transition-colors">{c.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">{c.description}</p>
                        <span className="text-xs text-primary mt-3 inline-flex items-center gap-1">View course <ArrowRight className="h-3 w-3" /></span>
                      </div>
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
