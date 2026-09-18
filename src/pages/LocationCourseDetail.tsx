import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, BookOpen, Briefcase, CheckCircle, Clock, MapPin, Monitor, Wrench } from 'lucide-react';
import InquiryForm from '@/components/InquiryForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchCourse, type Course } from '@/lib/api';
import { absoluteUrl, removeJsonLd, setJsonLd, setPageSeo, truncateForSerp } from '@/lib/seo';
import { districtPath, localizedCoursePath, locationBySlug, topicForCategory, topicPath } from '@/data/locations';
import { locationImage } from '@/data/locationImages';

const LocationCourseDetail = () => {
  const { district, slug } = useParams<{ district: string; slug: string }>();
  const location = locationBySlug(district);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!slug || !location) { setLoading(false); return; }
    fetchCourse(slug).then((value) => active && setCourse(value)).catch(() => active && setCourse(null)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug, location]);

  useEffect(() => {
    if (loading) return;
    if (!course || !location) {
      setPageSeo({ title: 'Local Course Not Found | ASB Training Hub', description: 'Browse courses available to learners across Kerala.', keywords: 'courses Kerala', path: '/locations/kerala', noindex: true });
      return;
    }
    const path = localizedCoursePath(location, course.slug);
    const images = locationImage(location.slug);
    const local = location.region === 'Trivandrum area';
    const description = truncateForSerp(`${course.title} for learners in ${location.name}. ${local ? 'Classroom, hybrid and live online options' : 'Live instructor-led online training'}, practical projects and career support.`);
    setPageSeo({ title: `${course.title} Course in ${location.name} | ASB Training Hub`, description, keywords: `${course.title} course in ${location.name}, ${course.title} training ${location.name}, ${course.categoryLabel} courses ${location.name}`, path, image: images.large });
    setJsonLd('localized-course', {
      '@context': 'https://schema.org', '@type': 'Course', name: `${course.title} in ${location.name}`,
      description, url: absoluteUrl(path), image: absoluteUrl(images.large), teaches: course.learningOutcomes,
      educationalCredentialAwarded: course.certificate, coursePrerequisites: course.prerequisites,
      provider: { '@type': 'EducationalOrganization', '@id': `${absoluteUrl('/')}#organization`, name: 'ASB Training Hub' },
      hasCourseInstance: [{ '@type': 'CourseInstance', courseMode: local ? 'blended' : 'online', courseWorkload: course.duration }],
    });
    setJsonLd('localized-breadcrumb', { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      ['Home', '/'], ['Kerala locations', '/locations/kerala'], [location.name, districtPath(location)], [course.title, path],
    ].map(([name, item], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(item) })) });
    if (course.faqs.length) setJsonLd('localized-faq', { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: course.faqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) });
    return () => { removeJsonLd('localized-course'); removeJsonLd('localized-breadcrumb'); removeJsonLd('localized-faq'); };
  }, [course, location, loading]);

  if (loading) return <main className="min-h-[60vh] pt-32 text-center text-muted-foreground">Loading course...</main>;
  if (!course || !location) return <main className="min-h-[60vh] pt-32 text-center"><h1 className="text-3xl font-bold">Course location not found</h1><Link to="/locations/kerala" className="mt-4 inline-block text-primary">Browse locations</Link></main>;

  const images = locationImage(location.slug);
  const local = location.region === 'Trivandrum area';
  const topic = topicForCategory(course.category);
  const featureGroups = [
    { title: 'What you will learn', icon: BookOpen, items: course.learningOutcomes },
    { title: 'Syllabus', icon: CheckCircle, items: course.syllabus },
    { title: 'Tools and software', icon: Wrench, items: course.tools },
    { title: 'Career opportunities', icon: Briefcase, items: course.careers },
  ].filter((group) => group.items.length);

  return <main className="bg-background">
    <section className="relative min-h-[570px] pt-28 flex items-center overflow-hidden bg-black">
      <picture className="absolute inset-0"><source media="(max-width:640px)" srcSet={images.small} /><img src={images.large} alt={`${location.name} learning setting for ${course.title}`} className="h-full w-full object-cover" fetchPriority="high" /></picture>
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/25" />
      <div className="container mx-auto px-4 py-14 relative z-10 grid lg:grid-cols-[1.2fr_.8fr] gap-10 items-center">
        <div className="text-white"><Link to={districtPath(location)} className="text-orange-300 font-semibold inline-flex items-center gap-2"><MapPin className="h-4 w-4" />Courses in {location.name}</Link><h1 className="text-4xl md:text-6xl font-bold font-heading my-5">{course.title} Course in {location.name}</h1><p className="text-lg text-gray-200 max-w-3xl">{course.description}</p><div className="flex flex-wrap gap-3 mt-6 text-sm"><span className="rounded-full bg-black/60 px-4 py-2 flex gap-2"><Clock className="h-4 w-4" />{course.duration}</span><span className="rounded-full bg-black/60 px-4 py-2 flex gap-2"><Monitor className="h-4 w-4" />{local ? course.mode : 'Live online'}</span><span className="rounded-full bg-black/60 px-4 py-2 flex gap-2"><Award className="h-4 w-4" />Certificate</span></div></div>
        <div className="rounded-2xl bg-background/95 p-6 shadow-2xl"><h2 className="text-2xl font-bold mb-2">Get course details</h2><p className="text-sm text-muted-foreground mb-5">Ask about syllabus, fees and the next batch for {location.name}.</p><InquiryForm stacked preselectedCourse={course.category} /></div>
      </div>
    </section>
    <section className="section-padding"><div className="container mx-auto px-4"><div className="max-w-4xl mb-10"><span className="text-primary font-semibold">Practical, career-focused learning</span><h2 className="text-3xl font-bold mt-2 mb-4">Study {course.title} from {location.name}</h2><p className="text-muted-foreground leading-relaxed">{course.overview || course.description} {local ? 'You can ask about classroom, hybrid or live online batches at our centre near Technopark.' : `Learners in ${location.name} can attend live online sessions with instructor guidance, assignments, project reviews and doubt-clearing support from our Trivandrum team.`}</p></div><div className="grid md:grid-cols-2 gap-6">{featureGroups.map(({ title, icon: Icon, items }) => <article key={title} className="rounded-2xl border border-border p-6 bg-card"><h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Icon className="h-5 w-5 text-primary" />{title}</h2><ul className="space-y-3">{items.map((item) => <li key={item} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />{item}</li>)}</ul></article>)}</div></div></section>
    {course.projects.length > 0 && <section className="section-padding bg-muted/30"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold mb-6">Hands-on projects</h2><div className="grid md:grid-cols-3 gap-4">{course.projects.map((item, i) => <div key={item} className="rounded-xl bg-background border border-border p-5"><span className="text-primary text-sm font-semibold">Project {i + 1}</span><p className="mt-2">{item}</p></div>)}</div></div></section>}
    {course.faqs.length > 0 && <section className="section-padding"><div className="container mx-auto px-4 max-w-4xl"><h2 className="text-3xl font-bold mb-6">Questions about {course.title} in {location.name}</h2><Accordion type="single" collapsible>{course.faqs.map((faq, i) => <AccordionItem key={faq.q} value={`faq-${i}`}><AccordionTrigger className="text-left">{faq.q}</AccordionTrigger><AccordionContent>{faq.a}</AccordionContent></AccordionItem>)}</Accordion><div className="flex flex-wrap gap-4 mt-8"><Link to={`/course/${course.slug}`} className="text-primary font-semibold">Main course overview</Link>{topic && <Link to={topicPath(location, topic)} className="text-primary font-semibold">More {topic.shortName} courses in {location.name}</Link>}<Link to={districtPath(location)} className="text-primary font-semibold">All courses in {location.name}</Link></div></div></section>}
  </main>;
};

export default LocationCourseDetail;
