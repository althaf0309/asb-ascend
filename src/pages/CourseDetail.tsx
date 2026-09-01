import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getCourseBySlug, courses, courseCategories } from '@/data/courses';
import {
  CheckCircle, Clock, MapPin, Award, Users, ArrowRight, BookOpen, Briefcase,
  MessageCircle, Sparkles, Target, Layers, GraduationCap, Rocket, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import InquiryForm from '@/components/InquiryForm';

import { getCourseImages } from '@/data/courseImages';
import SmartImage from '@/components/SmartImage';
import { absoluteUrl, removeJsonLd, setJsonLd, setPageSeo, truncateForSerp } from '@/lib/seo';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const course = getCourseBySlug(slug || '');

  useEffect(() => {
    if (!course) {
      setPageSeo({
        title: 'Course Not Found | ASB Training Hub',
        description: 'The requested ASB Training Hub course could not be found. Browse all ERP, AI, programming, management, and internship courses.',
        keywords: 'ASB Training Hub courses, course not found, training courses Trivandrum',
        path: slug ? `/course/${slug}` : '/courses',
        noindex: true,
      });
    }
  }, [course, slug]);

  useEffect(() => {
    if (!course) return;
    const { primary: heroImg } = getCourseImages(course.id, course.category);
    setPageSeo({
      title: `${course.title} Course in Trivandrum | ASB Training Hub`,
      // Kept under the ~160-character SERP budget: the course description is
      // already a full sentence, so only a short qualifier is appended.
      description: truncateForSerp(
        `${course.description} ${course.duration}, ${course.mode.toLowerCase()}${
          course.internship ? ', with internship support' : ''
        }.`,
      ),
      keywords: `${course.title}, ${course.categoryLabel}, ${course.title} course Trivandrum, ${course.title} training Kerala, ASB Training Hub, job oriented course, placement support`,
      path: `/course/${course.slug}`,
      image: heroImg,
    });
    setJsonLd('course', {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.overview || course.description,
      provider: {
        '@type': 'EducationalOrganization',
        '@id': 'https://www.asbtraininghub.com/#organization',
        name: 'ASB Training Hub',
        sameAs: 'https://www.asbtraininghub.com/',
      },
      educationalCredentialAwarded: course.certificate,
      courseMode: course.mode,
      timeRequired: course.duration,
      inLanguage: 'en',
      teaches: course.learningOutcomes,
      coursePrerequisites: course.prerequisites,
      url: `https://www.asbtraininghub.com/course/${course.slug}`,
      image: absoluteUrl(heroImg),
      // Google requires at least one instance with a mode and duration before a
      // course is eligible for course rich results.
      hasCourseInstance: [
        {
          '@type': 'CourseInstance',
          courseMode: course.mode.toLowerCase().includes('online') ? 'blended' : 'onsite',
          courseWorkload: course.duration,
          location: {
            '@type': 'Place',
            name: 'ASB Training Hub',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '105-2, The Atomic, Near Technopark Phase 1, Kazhakootam',
              addressLocality: 'Trivandrum',
              addressRegion: 'Kerala',
              postalCode: '695581',
              addressCountry: 'IN',
            },
          },
        },
      ],
    });

    setJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Courses', item: absoluteUrl('/courses') },
        {
          '@type': 'ListItem',
          position: 3,
          name: course.categoryLabel,
          item: absoluteUrl(`/courses/${course.category}`),
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: course.title,
          item: absoluteUrl(`/course/${course.slug}`),
        },
      ],
    });

    // The FAQs are already on the page; publishing them as schema is what makes
    // them answerable.
    if (course.faqs.length) {
      setJsonLd('course-faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: course.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      });
    } else {
      removeJsonLd('course-faq');
    }

    return () => {
      removeJsonLd('course');
      removeJsonLd('breadcrumb');
      removeJsonLd('course-faq');
    };
  }, [course]);

  if (!course) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
        <h1 className="text-3xl font-bold font-heading mb-3">Course not found</h1>
        <p className="text-muted-foreground mb-6">The course you're looking for may have been renamed.</p>
        <Link to="/courses" title="Browse all ASB Training Hub courses" className="inline-flex self-center"><Button>Browse all courses</Button></Link>
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
          <SmartImage src={heroImg} alt={`${course.title} course training at ASB Training Hub`} wrapperClassName="absolute inset-0" eager />
          {/* Strong universal scrim — keeps text readable on any image (incl. very light ones) */}
          <div className="absolute inset-0 bg-black/70" />
          {/* Bottom-up depth gradient that blends into the stats strip */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />
          {/* Subtle category color tint */}
          <div className={`absolute inset-0 bg-gradient-to-br ${catColor} opacity-25 mix-blend-overlay`} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <Link to={`/courses/${course.category}`} title={`${course.categoryLabel} courses at ASB Training Hub`} className="text-white/90 hover:text-white text-sm mb-2 inline-flex items-center gap-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
            ← {course.categoryLabel}
          </Link>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-3 mb-4 max-w-4xl [text-shadow:0_2px_12px_rgba(0,0,0,0.75)]">{course.title}</h1>
          <p className="text-white/95 max-w-3xl text-lg md:text-xl mb-6 leading-relaxed [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">{course.description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-white mb-6">
            <span className="flex items-center gap-1.5 bg-black/65 ring-1 ring-white/25 px-3 py-1.5 rounded-full"><Clock className="h-4 w-4" />{course.duration}</span>
            <span className="flex items-center gap-1.5 bg-black/65 ring-1 ring-white/25 px-3 py-1.5 rounded-full"><MapPin className="h-4 w-4" />{course.mode}</span>
            <span className="flex items-center gap-1.5 bg-black/65 ring-1 ring-white/25 px-3 py-1.5 rounded-full"><Award className="h-4 w-4" />Certificate</span>
            {course.internship && (
              <span className="flex items-center gap-1.5 bg-emerald-500 ring-1 ring-white/30 text-white px-3 py-1.5 rounded-full">
                <Briefcase className="h-4 w-4" />Internship Included
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/apply" title={`Apply for ${course.title} at ASB Training Hub`} className="inline-flex self-center">
              <Button size="lg" className="bg-white !text-black font-semibold hover:bg-white/90 shadow-lg">Apply Now</Button>
            </Link>
            <a href="https://wa.me/918714773304" target="_blank" rel="noopener noreferrer" title={`Chat on WhatsApp about ${course.title}`} className="inline-flex self-center">
              <Button size="lg" variant="outline" className="border-white/80 !text-white hover:bg-white/15 bg-black/40 shadow-lg">
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
                  <SmartImage
                    src={secondaryImg}
                    alt={`${course.title} learning environment`}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    wrapperClassName="md:col-span-2 rounded-2xl overflow-hidden aspect-[4/3] border border-border"
                  />
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
                title="Chat with ASB Training Hub course counsellor"
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
                  <Link key={c.id} to={`/course/${c.slug}`} title={`${c.title} course | ASB Training Hub`} className="group block">
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full flex flex-col">
                      <SmartImage
                        src={getCourseImages(c.id, c.category).primary}
                        alt={c.title}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        wrapperClassName="aspect-video overflow-hidden"
                        className="group-hover:scale-105 transition-transform"
                      />
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
