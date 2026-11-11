import { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Code2, Layers, MapPin } from 'lucide-react';
import pages from '@/data/seoPythonPages.json';
import { PYTHON_HERO, PYTHON_LABEL, PYTHON_PRIMARY_SLUG, PYTHON_SEGMENT, pythonDescription, pythonPageHeroImage, pythonPagePath, pythonPageSections, pythonSkills } from '@/data/pythonContent.js';
import CourseAnswers from '@/components/CourseAnswers';
import InquiryForm from '@/components/InquiryForm';
import { absoluteUrl, removeJsonLd, seoPageTitle, setJsonLd, setPageSeo, truncateForSerp } from '@/lib/seo';
import { highFetchPriority } from '@/lib/utils';

type PythonPage = { family: 'python'; slug: string; title: string; label: string; intent: string; location: string; question: boolean };
const allPages = pages as PythonPage[];
const hubPath = `/course-training/${PYTHON_SEGMENT}`;

/** One landing page per Python keyword; the server renders the same copy for crawlers. */
export default function SeoPythonCourses() {
  const { slug } = useParams();
  const page = useMemo(() => allPages.find((item) => item.slug === (slug || PYTHON_PRIMARY_SLUG)), [slug]);
  const isPrimary = page?.slug === PYTHON_PRIMARY_SLUG;
  const canonicalPath = page ? pythonPagePath(page) : hubPath;
  const description = page ? pythonDescription(page) : 'Python full stack course guides from ASB Training Hub.';

  useEffect(() => {
    if (!page) {
      setPageSeo({ title: 'Python Course Page Not Found', description, keywords: 'Python course Kerala', path: hubPath, noindex: true });
      return;
    }
    setPageSeo({ title: seoPageTitle(page.title), description: truncateForSerp(description), keywords: `${page.title}, Python full stack course Kerala, Django training`, path: canonicalPath, image: PYTHON_HERO });
    const structured = page.question
      ? []
      : [{ '@context': 'https://schema.org', '@type': 'Course', name: page.title, description, url: absoluteUrl(canonicalPath), teaches: pythonSkills(page), provider: { '@type': 'EducationalOrganization', '@id': `${absoluteUrl('/')}#organization`, name: 'ASB Training Hub' }, hasCourseInstance: [{ '@type': 'CourseInstance', courseMode: 'blended' }] }];
    const crumbs: Array<[string, string]> = isPrimary ? [['Home', '/'], [PYTHON_LABEL, hubPath]] : [['Home', '/'], [PYTHON_LABEL, hubPath], [page.title, canonicalPath]];
    setJsonLd('seo-python-course', [...structured, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, item], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(item) })) }]);
    return () => removeJsonLd('seo-python-course');
  }, [canonicalPath, description, isPrimary, page]);

  if (slug === PYTHON_PRIMARY_SLUG) return <Navigate replace to={hubPath}/>;
  if (!page) return <main className="min-h-[60vh] pt-32 text-center"><h1>Page not found</h1><Link to={hubPath}>Browse Python course guides</Link></main>;

  const others = allPages.filter((item) => item.slug !== page.slug);
  const local = page.location && page.location !== 'Kerala';
  const nearby = others.filter((item) => (local ? item.location === page.location : item.intent === page.intent)).slice(0, 8);
  const related = nearby.length >= 4 ? nearby : [...nearby, ...others.filter((item) => item.intent === page.intent && !nearby.includes(item)).slice(0, 8 - nearby.length)];
  const sections = pythonPageSections(page);

  return <main>
    <section className="relative flex min-h-[590px] items-center overflow-hidden pt-28 text-white"><img src={PYTHON_HERO} alt="Student writing Python code at ASB Training Hub" width={1672} height={941} {...highFetchPriority} decoding="async" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25"/><div className="container relative mx-auto grid items-center gap-10 px-4 py-12 lg:grid-cols-[1.15fr_.85fr]"><div><span className="font-semibold text-orange-300">{local ? <><MapPin className="inline h-4 w-4"/> {page.location}</> : 'Python full stack development'}</span><h1 className="mt-4 text-4xl font-bold md:text-6xl">{page.title}</h1><p className="mt-5 text-lg text-gray-200">{description}</p></div><div className="rounded-2xl bg-background p-6 text-foreground"><h2 className="text-2xl font-bold">Request course details</h2><p className="my-3 text-sm text-muted-foreground">Ask about the syllabus, eligibility, fees, duration and the next Python batch.</p><InquiryForm stacked preselectedCourse="programming"/></div></div></section>
    <section className="section-padding"><div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2"><article><h2 className="text-3xl font-bold">{sections[0].heading}</h2><p className="mt-4 text-lg leading-relaxed text-muted-foreground">{sections[0].text}</p><h2 className="mt-9 text-2xl font-bold">Skills covered</h2><ul className="mt-5 space-y-3">{pythonSkills(page).map((skill: string) => <li className="flex gap-2" key={skill}><CheckCircle className="h-5 w-5 shrink-0 text-primary"/>{skill}</li>)}</ul><figure className="mt-9 overflow-hidden rounded-2xl shadow-lg"><img src={pythonPageHeroImage(page)} alt={`${page.title} illustration`} width={1600} height={900} loading="lazy" decoding="async" className="h-auto w-full"/></figure></article><aside className="rounded-2xl bg-muted/40 p-7"><h2 className="flex gap-2 text-2xl font-bold"><Code2 className="text-primary"/>Practical learning format</h2><p className="mt-4 text-muted-foreground">Instructor-led classes with live coding, guided exercises, code reviews, an internship and a capstone project. Classroom near Technopark, Kazhakootam, and live-online batches across Kerala.</p><Link to="/course/python-full-stack" className="mt-4 inline-flex gap-2 font-semibold text-primary">Python Full Stack course details<ArrowRight className="h-4 w-4"/></Link><h2 className="mt-8 flex gap-2 text-xl font-bold"><Layers className="text-primary"/>Related Python searches</h2><div className="mt-4 space-y-3">{related.map((item) => <Link key={item.slug} to={pythonPagePath(item)} className="flex gap-2 border-b pb-3 hover:text-primary">{item.title}<ArrowRight className="h-4 w-4 shrink-0"/></Link>)}{!isPrimary && <Link to={hubPath} className="flex gap-2 border-b pb-3 hover:text-primary">Python full stack development course in Kerala<ArrowRight className="h-4 w-4 shrink-0"/></Link>}</div></aside></div></section>
    <CourseAnswers path={`python/${page.slug}`}/>
    <section className="section-padding bg-muted/30"><div className="container mx-auto max-w-4xl space-y-10 px-4">{sections.slice(1).map((section: { heading: string; text: string }) => <section key={section.heading}><h2 className="text-2xl font-bold">{section.heading}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{section.text}</p></section>)}</div></section>
    {isPrimary && <section className="section-padding"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold">Python course guides by place, fee, career and question</h2><p className="mt-3 max-w-3xl text-muted-foreground">Every guide below answers one search directly: Python courses in Kerala towns, fees, internships, Django training, careers and common questions.</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{others.map((item) => <Link key={item.slug} to={pythonPagePath(item)} className="rounded-xl border p-5 hover-lift"><span className="text-xs font-semibold text-primary">{item.question ? 'Direct answer' : item.location || 'Course guide'}</span><h3 className="mt-2 font-bold">{item.title}</h3></Link>)}</div></div></section>}
  </main>;
}
