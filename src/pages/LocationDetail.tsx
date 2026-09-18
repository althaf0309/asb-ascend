import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, MapPin, Monitor, Route } from 'lucide-react';
import InquiryForm from '@/components/InquiryForm';
import { districtPath, localizedCoursePath, locationBySlug, locations, locationTopics, topicPath } from '@/data/locations';
import { setPageSeo, setJsonLd, removeJsonLd, absoluteUrl } from '@/lib/seo';
import { locationImage } from '@/data/locationImages';
import { fetchCourseSummaries, type CourseSummary } from '@/lib/api';

const courseLinks = [
  { label: 'AI & Generative AI Courses', href: '/courses/ai' },
  { label: 'Programming Courses', href: '/courses/programming' },
  { label: 'ERP Courses', href: '/courses/erp' },
  { label: 'Internship Programs', href: '/courses/internship' },
];

const LocationDetail = () => {
  const { district } = useParams<{ district: string }>();
  const location = locationBySlug(district);
  const [courses, setCourses] = useState<CourseSummary[]>([]);

  useEffect(() => { fetchCourseSummaries().then(setCourses).catch(() => setCourses([])); }, []);

  useEffect(() => {
    if (!location) {
      setPageSeo({ title: 'Location Not Found | ASB Training Hub', description: 'Browse ASB Training Hub course locations across Kerala.', keywords: 'AI courses Kerala', path: district ? `/locations/kerala/${district}` : '/locations/kerala', noindex: true });
      return;
    }
    const path = districtPath(location);
    setPageSeo({ title: `${location.title} | ASB Training Hub`, description: location.description, keywords: location.keywords.join(', '), path, image: locationImage(location.slug).large });
    setJsonLd('location-page-schema', {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: location.title,
      description: location.description, url: absoluteUrl(path),
      about: location.keywords.map((name) => ({ '@type': 'Thing', name })),
      provider: { '@type': 'EducationalOrganization', '@id': `${absoluteUrl('/') }#organization`, name: 'ASB Training Hub' },
    });
    return () => removeJsonLd('location-page-schema');
  }, [location, district]);

  if (!location) return <main className="min-h-[60vh] pt-32 text-center"><h1 className="text-3xl font-bold">Location not found</h1><Link className="text-primary mt-4 inline-block" to="/locations/kerala">Browse all locations</Link></main>;

  const nearby = locations.filter((item) => item.slug !== location.slug).slice(0, 4);
  const isLocal = location.region === 'Trivandrum area';
  const hero = locationImage(location.slug);

  return <main>
    <section className="relative min-h-[600px] pt-28 flex items-center overflow-hidden bg-foreground">
      <picture className="absolute inset-0">
        <source media="(max-width: 640px)" srcSet={hero.small} />
        <img src={hero.large} alt={`Students attending career training for ${location.name}`} className="h-full w-full object-cover" fetchPriority="high" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/20" />
      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-center py-12">
        <div className="text-white max-w-2xl">
          <div className="flex items-center gap-2 text-orange-300 font-semibold"><MapPin className="h-5 w-5" />{location.name}, Kerala</div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading mt-4 mb-5">{location.title}</h1>
          <p className="text-lg text-gray-200 leading-relaxed">{location.intro}</p>
          <div className="flex items-center gap-2 mt-5 text-sm text-gray-300"><Monitor className="h-5 w-5 text-primary" />{location.delivery}</div>
        </div>
        <div className="rounded-2xl bg-background/95 backdrop-blur p-5 md:p-7 shadow-2xl"><h2 className="text-2xl font-bold font-heading mb-2">Ask about the next batch</h2><p className="text-sm text-muted-foreground mb-5">Tell us what you want to learn. Our admissions team will contact you.</p><InquiryForm stacked preselectedCourse="ai" /></div>
      </div>
    </section>

    <section className="section-padding bg-background"><div className="container mx-auto px-4 grid lg:grid-cols-[1fr_.8fr] gap-12">
      <div><span className="text-primary font-semibold">Career-focused learning</span><h2 className="text-3xl font-bold font-heading mt-2 mb-5">Courses available for learners in {location.name}</h2><p className="text-muted-foreground leading-relaxed mb-7">Build practical skills through guided lessons, assignments and portfolio-ready projects. Choose AI, programming, ERP, management or internship programmes based on your career goal.</p>
        <div className="grid sm:grid-cols-2 gap-4">{locationTopics.map((topic) => <Link key={topic.slug} to={topicPath(location, topic)} className="flex items-center justify-between rounded-xl border border-border p-4 font-semibold hover:border-primary hover:text-primary">{topic.name}<ArrowRight className="h-4 w-4" /></Link>)}{courseLinks.slice(1, 2).map((course) => <Link key={course.href} to={course.href} className="flex items-center justify-between rounded-xl border border-border p-4 font-semibold hover:border-primary hover:text-primary">{course.label}<ArrowRight className="h-4 w-4" /></Link>)}</div>
      </div>
      <div className="rounded-2xl bg-muted/50 p-7"><h2 className="text-2xl font-bold font-heading mb-5">How you can learn</h2><ul className="space-y-4">{[
        isLocal ? 'Attend classroom sessions near Technopark Phase 1' : 'Join live, instructor-led online sessions from your city',
        'Complete practical assignments and guided projects', 'Learn with trainer feedback and doubt-clearing support', 'Get course and career guidance from the admissions team',
      ].map((item) => <li key={item} className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /><span>{item}</span></li>)}</ul></div>
    </div></section>

    <section className="section-padding bg-muted/30"><div className="container mx-auto px-4"><span className="text-primary font-semibold">Complete catalogue</span><h2 className="text-3xl font-bold font-heading mt-2 mb-3">All {courses.length || 51} courses available in {location.name}</h2><p className="text-muted-foreground max-w-3xl mb-7">Open any course to see its location-specific learning option, syllabus, projects, tools and admission form.</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{courses.map((course) => <Link key={course.slug} to={localizedCoursePath(location, course.slug)} className="group rounded-2xl border border-border bg-background p-5 hover-lift"><span className="text-xs font-semibold text-primary">{course.categoryLabel}</span><h3 className="text-lg font-bold mt-2 group-hover:text-primary">{course.title}</h3><p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p><div className="flex justify-between items-center mt-4 pt-4 border-t border-border text-xs text-muted-foreground"><span>{course.duration}</span><ArrowRight className="h-4 w-4" /></div></Link>)}</div></div></section>

    <section className="section-padding bg-muted/30"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold font-heading mb-6">Popular searches in {location.name}</h2><div className="flex flex-wrap gap-3">{location.keywords.map((keyword) => <span key={keyword} className="rounded-full bg-background border border-border px-4 py-2 text-sm">{keyword}</span>)}</div></div></section>

    <section className="section-padding bg-background"><div className="container mx-auto px-4"><div className="flex items-center justify-between gap-4 mb-6"><div><span className="text-primary font-semibold">Explore Kerala</span><h2 className="text-3xl font-bold font-heading mt-1">Other course locations</h2></div><Link to="/locations/kerala" className="hidden sm:flex items-center gap-2 text-primary font-semibold">All locations <Route className="h-4 w-4" /></Link></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{nearby.map((item) => <Link key={item.slug} to={districtPath(item)} className="rounded-xl border border-border p-5 hover-lift"><MapPin className="h-5 w-5 text-primary" /><h3 className="font-bold mt-3">{item.name}</h3><span className="text-sm text-muted-foreground">{item.delivery}</span></Link>)}</div></div></section>
  </main>;
};

export default LocationDetail;
