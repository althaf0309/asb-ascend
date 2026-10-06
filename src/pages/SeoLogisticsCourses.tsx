import { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Boxes, CheckCircle, MapPin, Route, Warehouse } from 'lucide-react';
import pages from '@/data/seoLogisticsPages.json';
import { logisticsFamilies, logisticsFamilyFromSegment, logisticsFamilyPath, logisticsPageHeroImage, logisticsPageImage, logisticsPagePath, movedLogisticsPagePath, type LogisticsSeoPage } from '@/data/logisticsSeo';
import InquiryForm from '@/components/InquiryForm';
import LogisticsGuideHub from '@/components/LogisticsGuideHub';
import LongLogisticsContent from '@/components/LongLogisticsContent';
import { absoluteUrl, removeJsonLd, setJsonLd, setPageSeo, truncateForSerp } from '@/lib/seo';

const allPages = pages as LogisticsSeoPage[];

export default function SeoLogisticsCourses() {
  const { family: familySegment, slug } = useParams();
  const family = logisticsFamilyFromSegment(familySegment);
  const details = family ? logisticsFamilies[family] : undefined;
  const list = useMemo(() => family ? allPages.filter((item) => item.family === family) : [], [family]);
  const page = useMemo(() => {
    if (!details) return undefined;
    return list.find((item) => item.slug === (slug || details.primarySlug));
  }, [details, list, slug]);
  const isGuideHub = Boolean(family && details && !slug && familySegment?.toLowerCase() === details.legacySegment);
  const canonicalPath = isGuideHub && family ? `/course-training/${family}` : page ? logisticsPagePath(page) : '/courses/management';
  const image = page ? logisticsPageImage(page) : details?.defaultImage || '/images/logistics-supply-chain-course-hero.webp';
  const heroImage = page ? logisticsPageHeroImage(page) : image;
  const description = isGuideHub && family
    ? family === 'warehouse'
      ? 'Explore original warehouse management, inventory, safety, systems, career and course-selection guides before choosing a formal training pathway.'
      : 'Explore original logistics, supply chain, career, course-selection and operations guides before choosing a formal diploma training pathway.'
    : page && details
    ? `${page.title}: practical ${details.label.toLowerCase()} guidance covering applied operations, projects, career preparation and current admission support${page.location ? ` for learners in ${page.location}` : ''}.`
    : 'Browse practical logistics, supply chain, warehouse and inventory management courses.';

  useEffect(() => {
    if (!family || !details || !page) {
      setPageSeo({ title: 'Logistics Course Page Not Found', description, keywords: 'logistics courses Kerala', path: '/courses/management', noindex: true });
      return;
    }
    const seoTitle = isGuideHub
      ? `${family === 'warehouse' ? 'Warehouse Management' : 'Logistics and Supply Chain'} Learning Guides | ASB`
      : `${page.title} | ASB Training Hub`;
    setPageSeo({ title: seoTitle, description: truncateForSerp(description), keywords: isGuideHub ? `${details.label} guides, course comparison Kerala, operations careers` : `${page.title}, ${details.label} course Kerala, job oriented management training`, path: canonicalPath, image });
    const structured = isGuideHub
      ? { '@context': 'https://schema.org', '@type': 'CollectionPage', name: seoTitle, description, url: absoluteUrl(canonicalPath), mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.slice(0, 100).map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: absoluteUrl(logisticsPagePath(item)) })) } }
      : page.question
      ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: page.title, acceptedAnswer: { '@type': 'Answer', text: description } }] }
      : { '@context': 'https://schema.org', '@type': 'Course', name: page.title, description, url: absoluteUrl(canonicalPath), provider: { '@type': 'EducationalOrganization', '@id': `${absoluteUrl('/')}#organization`, name: 'ASB Training Hub' }, hasCourseInstance: [{ '@type': 'CourseInstance', courseMode: 'blended' }] };
    const crumbs = isGuideHub ? [['Home', '/'], [seoTitle, canonicalPath]] : [['Home', '/'], [details.label, logisticsFamilyPath(family)], [page.title, canonicalPath]];
    setJsonLd('seo-logistics-course', [structured, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, item], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(item) })) }]);
    return () => removeJsonLd('seo-logistics-course');
  }, [canonicalPath, description, details, family, image, isGuideHub, list, page]);

  const movedPath = family && slug ? movedLogisticsPagePath(family, slug) : undefined;
  if (movedPath) return <Navigate replace to={movedPath} />;
  if (!family || !details || !page) return <main className="min-h-[60vh] pt-32 text-center"><h1>Page not found</h1><Link to="/courses/management">Browse management courses</Link></main>;
  if (isGuideHub) return <LogisticsGuideHub family={family} pages={list}/>;
  if (familySegment?.toLowerCase() === details.legacySegment) return <Navigate replace to={canonicalPath} />;

  const related = list.filter((item) => item.slug !== page.slug && (page.location ? item.location === page.location : item.intent === page.intent)).slice(0, 8);
  const skills = page.family === 'warehouse'
    ? ['Receiving, put-away and location control', 'Inventory accuracy and cycle counting', 'Picking, packing, dispatch and returns', 'Warehouse safety and operational reporting']
    : ['Procurement and supply-chain flow', 'Warehouse and inventory coordination', 'Transport and distribution planning', 'Operational records and performance measures'];
  const isPrimary = page.slug === details.primarySlug;

  return <main>
    <section className="relative flex min-h-[590px] items-center overflow-hidden pt-28 text-white"><img src={heroImage} alt={`${page.title} practical training illustration`} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/45"/><div className="container relative mx-auto grid items-center gap-10 px-4 py-12 lg:grid-cols-[1.15fr_.85fr]"><div><span className="font-semibold text-orange-300">{page.location ? <><MapPin className="inline h-4 w-4"/> {page.location}</> : 'Career-focused operations learning'}</span><h1 className="mt-4 text-4xl font-bold md:text-6xl">{page.title}</h1><p className="mt-5 text-lg text-gray-200">{description}</p></div><div className="rounded-2xl bg-background p-6 text-foreground"><h2 className="text-2xl font-bold">Request course details</h2><p className="my-3 text-sm text-muted-foreground">Ask about syllabus, eligibility, fees, duration and upcoming batches.</p><InquiryForm stacked preselectedCourse="management"/></div></div></section>
    <section className="section-padding"><div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2"><article><h2 className="text-3xl font-bold">{page.question ? 'A clear, practical answer' : 'Course overview'}</h2><p className="mt-4 text-lg leading-relaxed text-muted-foreground">{details.intro} This guide addresses {page.title} with realistic learning outcomes, operational examples and enrolment checks.</p><h2 className="mt-9 text-2xl font-bold">Skills covered</h2><ul className="mt-5 space-y-3">{skills.map((skill) => <li className="flex gap-2" key={skill}><CheckCircle className="h-5 w-5 shrink-0 text-primary"/>{skill}</li>)}</ul></article><aside className="rounded-2xl bg-muted/40 p-7"><h2 className="flex gap-2 text-2xl font-bold">{page.family === 'warehouse' ? <Warehouse className="text-primary"/> : <Route className="text-primary"/>}Practical learning format</h2><p className="mt-4 text-muted-foreground">Instructor explanations, operational examples, supervised exercises, project reviews and career preparation. Current classroom, online and blended availability depends on the batch schedule.</p><h2 className="mt-8 flex gap-2 text-xl font-bold"><Boxes className="text-primary"/>Related course searches</h2><div className="mt-4 space-y-3">{related.map((item) => <Link key={item.slug} to={logisticsPagePath(item)} className="flex gap-2 border-b pb-3 hover:text-primary">{item.title}<ArrowRight className="h-4 w-4 shrink-0"/></Link>)}</div></aside></div></section>
    <LongLogisticsContent title={page.title} slug={page.slug} label={page.label} family={page.family} intent={page.intent} location={page.location}/>
    {isPrimary && <section className="section-padding"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold">Explore focused {details.label} guides</h2><p className="mt-3 max-w-3xl text-muted-foreground">Browse course, fee, admission, career, certification and location-specific guidance within this diploma pathway.</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.filter((item) => item.slug !== page.slug).map((item) => <Link key={item.slug} to={logisticsPagePath(item)} className="rounded-xl border p-5 hover-lift"><span className="text-xs font-semibold text-primary">{item.question ? 'Direct answer' : item.location || 'Course guide'}</span><h3 className="mt-2 font-bold">{item.title}</h3></Link>)}</div></div></section>}
  </main>;
}
