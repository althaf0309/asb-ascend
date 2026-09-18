import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, MapPin, Monitor, Sparkles } from 'lucide-react';
import InquiryForm from '@/components/InquiryForm';
import {
  districtPath, locationBySlug, locations, locationTopicBySlug, locationTopics,
  localizedCoursePath, topicKeywordsForLocation, topicPath,
} from '@/data/locations';
import { absoluteUrl, removeJsonLd, setJsonLd, setPageSeo } from '@/lib/seo';
import { fetchCourseSummaries, type CourseSummary } from '@/lib/api';
import { locationImage } from '@/data/locationImages';

const LocationCourse = () => {
  const { district, topic: topicSlug } = useParams<{ district: string; topic: string }>();
  const location = locationBySlug(district);
  const topic = locationTopicBySlug(topicSlug);
  const [courses, setCourses] = useState<CourseSummary[]>([]);

  useEffect(() => {
    if (!topic) return;
    let cancelled = false;
    fetchCourseSummaries(topic.category).then((items) => {
      if (cancelled) return;
      const focused = topic.slug === 'generative-ai-course'
        ? items.filter((item) => /generative|gen\s*ai/i.test(item.title))
        : topic.slug === 'agentic-ai-course'
          ? items.filter((item) => /agentic|ai agent/i.test(item.title))
          : items;
      setCourses(focused.length ? focused : items);
    }).catch(() => setCourses([]));
    return () => { cancelled = true; };
  }, [topic]);

  useEffect(() => {
    if (!location || !topic) {
      setPageSeo({ title: 'Course Location Not Found | ASB Training Hub', description: 'Browse AI courses available across Kerala.', keywords: 'AI courses Kerala', path: '/locations/kerala', noindex: true });
      return;
    }
    const path = topicPath(location, topic);
    const title = `${topic.name} in ${location.name}`;
    const description = `${topic.summary} Join from ${location.name} through ${location.delivery.toLowerCase()}.`;
    const keywords = topicKeywordsForLocation(location, topic);
    setPageSeo({ title: `${title} | ASB Training Hub`, description, keywords: keywords.join(', '), path, image: locationImage(location.slug).large });
    setJsonLd('location-course-schema', [
      {
        '@context': 'https://schema.org', '@type': 'Course', name: title, description,
        url: absoluteUrl(path), provider: { '@type': 'EducationalOrganization', '@id': `${absoluteUrl('/')}#organization`, name: 'ASB Training Hub' },
        hasCourseInstance: [{ '@type': 'CourseInstance', courseMode: location.region === 'Trivandrum area' ? 'blended' : 'online', location: { '@type': 'VirtualLocation', url: absoluteUrl(path) } }],
        teaches: topic.outcomes,
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
          { '@type': 'Question', name: `Can students in ${location.name} join this ${topic.shortName} course?`, acceptedAnswer: { '@type': 'Answer', text: location.region === 'Trivandrum area' ? 'Yes. Classroom, hybrid and live online learning options are available from our centre near Technopark.' : `Yes. Students in ${location.name} can join live instructor-led online batches from ASB Training Hub in Trivandrum.` } },
          { '@type': 'Question', name: `Does the ${topic.shortName} course include practical projects?`, acceptedAnswer: { '@type': 'Answer', text: 'Yes. The programme uses guided assignments and practical projects to help learners apply each topic.' } },
        ],
      },
    ]);
    return () => removeJsonLd('location-course-schema');
  }, [location, topic]);

  if (!location || !topic) return <main className="min-h-[60vh] pt-32 text-center"><h1 className="text-3xl font-bold">Course location not found</h1><Link to="/locations/kerala" className="text-primary mt-4 inline-block">Browse Kerala locations</Link></main>;

  const title = `${topic.name} in ${location.name}`;
  const keywords = topicKeywordsForLocation(location, topic);
  const otherTopics = locationTopics.filter((item) => item.slug !== topic.slug);
  const nearby = locations.filter((item) => item.slug !== location.slug).slice(0, 3);
  const local = location.region === 'Trivandrum area';
  const hero = locationImage(location.slug);

  return <main>
    <section className="relative min-h-[620px] pt-28 flex items-center overflow-hidden bg-foreground">
      <picture className="absolute inset-0"><source media="(max-width: 640px)" srcSet={hero.small} /><img src={hero.large} alt={`${topic.shortName} students from ${location.name}`} className="h-full w-full object-cover" fetchPriority="high" /></picture>
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/25" />
      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center py-12">
        <div className="text-white"><div className="flex items-center gap-2 text-orange-300 font-semibold"><MapPin className="h-5 w-5" />{location.name}, Kerala</div><h1 className="text-4xl md:text-6xl font-bold font-heading mt-4 mb-5">{title}</h1><p className="text-lg text-gray-200 leading-relaxed max-w-2xl">{topic.summary}</p><div className="flex items-center gap-2 mt-5 text-gray-300"><Monitor className="h-5 w-5 text-primary" />{location.delivery}</div></div>
        <div className="rounded-2xl bg-background/95 backdrop-blur p-5 md:p-7 shadow-2xl"><h2 className="text-2xl font-bold font-heading mb-2">Get course details</h2><p className="text-sm text-muted-foreground mb-5">Ask about syllabus, fees, schedules and the next available batch.</p><InquiryForm stacked preselectedCourse="ai" /></div>
      </div>
    </section>

    <section className="section-padding bg-background"><div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start"><div><span className="text-primary font-semibold">Practical, guided learning</span><h2 className="text-3xl font-bold font-heading mt-2 mb-5">What you will learn in this {topic.shortName} programme</h2><p className="text-muted-foreground leading-relaxed">This course is designed for learners in {location.name} who want structured training, hands-on practice and guidance toward real applications. Sessions connect core concepts with assignments and project work instead of relying only on theory.</p><ul className="mt-6 grid gap-4">{topic.outcomes.map((outcome) => <li key={outcome} className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /><span>{outcome}</span></li>)}</ul></div><div className="rounded-2xl bg-muted/50 p-7"><Sparkles className="h-8 w-8 text-primary" /><h2 className="text-2xl font-bold font-heading mt-4 mb-4">Learning from {location.name}</h2><p className="text-muted-foreground leading-relaxed">{local ? 'Attend at our training centre near Technopark Phase 1, choose a hybrid schedule, or join live online sessions when required.' : `Join scheduled live online sessions from ${location.name}. Trainers explain concepts in real time, review practical work and support questions throughout the programme.`}</p><Link to={districtPath(location)} className="inline-flex items-center gap-2 text-primary font-semibold mt-5">All courses in {location.name}<ArrowRight className="h-4 w-4" /></Link></div></div></section>

    <section className="section-padding bg-muted/30"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold font-heading mb-6">Search topics covered by this page</h2><div className="flex flex-wrap gap-3">{keywords.map((keyword) => <span key={keyword} className="rounded-full bg-background border border-border px-4 py-2 text-sm">{keyword}</span>)}</div></div></section>

    <section className="section-padding bg-background"><div className="container mx-auto px-4"><span className="text-primary font-semibold">Available programmes</span><h2 className="text-3xl font-bold font-heading mt-2 mb-3">{topic.shortName} courses for learners in {location.name}</h2><p className="text-muted-foreground max-w-3xl mb-7">Choose a programme to view its complete syllabus, duration, learning outcomes, projects and admission information.</p>{courses.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{courses.map((course) => <Link key={course.slug} to={localizedCoursePath(location, course.slug)} className="group rounded-2xl border border-border bg-card p-5 hover-lift"><span className="text-xs font-semibold text-primary">{course.categoryLabel}</span><h3 className="text-lg font-bold font-heading mt-2 group-hover:text-primary">{course.title}</h3><p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p><div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground"><span>{course.duration}</span><ArrowRight className="h-4 w-4 group-hover:text-primary" /></div></Link>)}</div> : <p className="rounded-xl border border-border p-5 text-muted-foreground">Contact the admissions team for the current programme list and upcoming batches.</p>}</div></section>

    <section className="section-padding bg-muted/30"><div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10"><div><h2 className="text-3xl font-bold font-heading mb-5">Frequently asked questions</h2><div className="space-y-5"><article><h3 className="font-bold text-lg">Can students in {location.name} join this course?</h3><p className="text-muted-foreground mt-2">{local ? 'Yes. Classroom, hybrid and live online options are available near Technopark.' : `Yes. Learners in ${location.name} can attend live, instructor-led online batches.`}</p></article><article><h3 className="font-bold text-lg">Does the course include practical projects?</h3><p className="text-muted-foreground mt-2">Yes. Guided assignments and applied projects help you practise the concepts covered in the programme.</p></article><article><h3 className="font-bold text-lg">Can beginners apply?</h3><p className="text-muted-foreground mt-2">Beginners can request counselling so the admissions team can recommend the right starting level and prerequisite preparation.</p></article></div></div><div><h2 className="text-3xl font-bold font-heading mb-5">Related courses in {location.name}</h2><div className="grid sm:grid-cols-2 gap-3">{otherTopics.map((item) => <Link key={item.slug} to={topicPath(location, item)} className="flex items-center justify-between rounded-xl border border-border bg-background p-4 font-semibold hover:border-primary hover:text-primary">{item.name}<ArrowRight className="h-4 w-4" /></Link>)}</div><h2 className="text-xl font-bold font-heading mt-8 mb-3">Nearby Kerala pages</h2><div className="flex flex-wrap gap-2">{nearby.map((item) => <Link key={item.slug} to={topicPath(item, topic)} className="rounded-full border border-border bg-background px-3 py-2 text-sm hover:border-primary hover:text-primary">{topic.shortName} in {item.name}</Link>)}</div></div></div></section>
  </main>;
};

export default LocationCourse;
