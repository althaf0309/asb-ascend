import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Boxes, CheckCircle, MapPin, Route, Warehouse } from 'lucide-react';
import pages from '@/data/seoLogisticsPages.json';
import InquiryForm from '@/components/InquiryForm';
import LongLogisticsContent from '@/components/LongLogisticsContent';
import { absoluteUrl, removeJsonLd, setJsonLd, setPageSeo, truncateForSerp } from '@/lib/seo';

type Family = 'logistics' | 'warehouse';
type Page = { family: Family; slug: string; title: string; label: string; intent: string; location: string; question: boolean };
const all = pages as Page[];
const familyDetails = {
  logistics: { label: 'Logistics and Supply Chain Management', hero: '/images/logistics-supply-chain-course-hero.webp', intro: 'Learn how purchasing, inventory, transport, warehousing and customer service connect across a modern supply chain.' },
  warehouse: { label: 'Warehouse and Inventory Management', hero: '/images/warehouse-inventory-course-hero.webp', intro: 'Build practical knowledge of receiving, storage, stock accuracy, fulfilment, safety and warehouse operations.' },
};

export default function SeoLogisticsCourses() {
  const { family, slug } = useParams();
  const valid = family === 'logistics' || family === 'warehouse';
  const details = valid ? familyDetails[family as Family] : familyDetails.logistics;
  // Memoised because it is a useEffect dependency: a fresh array each render
  // re-ran the SEO effect on every render and rewrote the JSON-LD each time.
  const list = useMemo(
    () => (valid ? all.filter((item) => item.family === family) : []),
    [valid, family],
  );
  const page = slug ? list.find((item) => item.slug === slug) : undefined;
  const base = `/course-training/${family}`;
  const description = page
    ? `${page.title}: practical course guidance covering operations, applied projects, career preparation and current admission support from ASB Training Hub${page.location ? ` for learners in ${page.location}` : ''}.`
    : `Explore ${list.length} focused ${details.label} course, career, admission, fee and Kerala location pages.`;

  useEffect(() => {
    if (!valid || (slug && !page)) {
      setPageSeo({ title: 'Logistics Course Page Not Found', description: 'Browse logistics and warehouse management courses.', keywords: 'logistics courses Kerala', path: '/courses/management', noindex: true });
      return;
    }
    const path = page ? `${base}/${page.slug}` : base;
    const pageTitle = page ? page.title : `${details.label} Course Pages`;
    setPageSeo({ title: `${pageTitle} | ASB Training Hub`, description: truncateForSerp(description), keywords: page ? `${page.title}, ${details.label} course Kerala, job oriented management training` : `${details.label} course Kerala, logistics training`, path, image: details.hero });
    const structured = page?.question
      ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: page.title, acceptedAnswer: { '@type': 'Answer', text: description } }] }
      : page ? { '@context': 'https://schema.org', '@type': 'Course', name: page.title, description, url: absoluteUrl(path), provider: { '@type': 'EducationalOrganization', '@id': `${absoluteUrl('/')}#organization`, name: 'ASB Training Hub' }, hasCourseInstance: [{ '@type': 'CourseInstance', courseMode: 'blended' }] } : null;
    setJsonLd('seo-logistics-course', page ? [structured, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], [details.label, base], [page.title, path]].map(([name, item], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(item) })) }] : { '@context': 'https://schema.org', '@type': 'ItemList', name: pageTitle, numberOfItems: list.length, itemListElement: list.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: absoluteUrl(`${base}/${item.slug}`) })) });
    return () => removeJsonLd('seo-logistics-course');
  }, [base, description, details.hero, details.label, list, page, slug, valid]);

  if (!valid || (slug && !page)) return <main className="min-h-[60vh] pt-32 text-center"><h1>Page not found</h1><Link to="/courses/management">Browse management courses</Link></main>;
  if (!page) return <main><section className="relative pb-24 pt-32 text-white"><img src={details.hero} alt={`${details.label} professional course`} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-black/70"/><div className="container relative mx-auto px-4"><h1 className="max-w-4xl text-4xl font-bold md:text-6xl">{details.label} Course Guide</h1><p className="mt-5 max-w-3xl text-lg text-gray-200">{details.intro} Browse {list.length} dedicated search guides below.</p></div></section><section className="section-padding"><div className="container mx-auto grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">{list.map((item) => <Link key={item.slug} to={`${base}/${item.slug}`} className="rounded-xl border p-5 hover-lift"><span className="text-xs font-semibold text-primary">{item.question ? 'Course answer' : item.location || 'Course pathway'}</span><h2 className="mt-2 font-bold">{item.title}</h2><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">View guide <ArrowRight className="h-4 w-4"/></span></Link>)}</div></section></main>;

  const related = list.filter((item) => item.slug !== page.slug && (page.location ? item.location === page.location : item.intent === page.intent)).slice(0, 6);
  const skills = page.family === 'warehouse' ? ['Receiving, put-away and location control', 'Inventory accuracy and cycle counting', 'Picking, packing, dispatch and returns', 'Warehouse safety and operational reporting'] : ['Procurement and supply-chain flow', 'Warehouse and inventory coordination', 'Transport and distribution planning', 'Operational records and performance measures'];
  return <main><section className="relative flex min-h-[590px] items-center pt-28 text-white"><img src={details.hero} alt={`${page.title} practical training`} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-black/75"/><div className="container relative mx-auto grid items-center gap-10 px-4 py-12 lg:grid-cols-[1.15fr_.85fr]"><div><span className="font-semibold text-orange-300">{page.location ? <><MapPin className="inline h-4 w-4"/> {page.location}</> : 'Career-focused operations learning'}</span><h1 className="mt-4 text-4xl font-bold md:text-6xl">{page.title}</h1><p className="mt-5 text-lg text-gray-200">{description}</p></div><div className="rounded-2xl bg-background p-6 text-foreground"><h2 className="text-2xl font-bold">Request course details</h2><p className="my-3 text-sm text-muted-foreground">Ask about syllabus, eligibility, fees, duration and upcoming batches.</p><InquiryForm stacked preselectedCourse="management"/></div></div></section><section className="section-padding"><div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2"><article><h2 className="text-3xl font-bold">{page.question ? 'A clear, practical answer' : 'Course overview'}</h2><p className="mt-4 text-lg leading-relaxed text-muted-foreground">{details.intro} This guide addresses the specific search for {page.title} while explaining realistic learning outcomes and enrolment checks.</p><h2 className="mt-9 text-2xl font-bold">Skills covered</h2><ul className="mt-5 space-y-3">{skills.map((skill) => <li className="flex gap-2" key={skill}><CheckCircle className="h-5 w-5 shrink-0 text-primary"/>{skill}</li>)}</ul></article><aside className="rounded-2xl bg-muted/40 p-7"><h2 className="flex gap-2 text-2xl font-bold">{page.family === 'warehouse' ? <Warehouse className="text-primary"/> : <Route className="text-primary"/>}Practical learning format</h2><p className="mt-4 text-muted-foreground">Instructor explanations, operational examples, supervised exercises, project reviews and career preparation. Current classroom, online and blended availability depends on the batch schedule.</p><h2 className="mt-8 flex gap-2 text-xl font-bold"><Boxes className="text-primary"/>Related course searches</h2><div className="mt-4 space-y-3">{related.map((item) => <Link key={item.slug} to={`${base}/${item.slug}`} className="flex gap-2 border-b pb-3 hover:text-primary">{item.title}<ArrowRight className="h-4 w-4 shrink-0"/></Link>)}</div></aside></div></section><LongLogisticsContent title={page.title} label={page.label} family={page.family} intent={page.intent} location={page.location}/></main>;
}
