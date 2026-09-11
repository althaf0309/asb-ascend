import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Award, CheckCircle, Clock, GraduationCap, MapPin, Target, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SmartImage from '@/components/SmartImage';
import InquiryForm from '@/components/InquiryForm';
import { sanitizeBlogHtml } from '@/lib/sanitize';
import { absoluteUrl, removeJsonLd, setJsonLd, setPageSeo, truncateForSerp } from '@/lib/seo';
import { fetchTrainingProgramme, type CatalogueEntry } from '@/lib/api';

/** Renders one of the structured list sections, or nothing when it is empty. */
const ListSection = ({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle;
}) => {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" aria-hidden /> {title}
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-1 shrink-0" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TrainingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [programme, setProgramme] = useState<CatalogueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setProgramme(null);

    fetchTrainingProgramme(slug)
      .then((data) => { if (!cancelled) setProgramme(data); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (loading) return;

    if (!programme) {
      setPageSeo({
        title: 'Programme Not Found | ASB Training Hub',
        description:
          'The requested ASB Training Hub training programme could not be found. Browse corporate training, workshops, certification tracks and bootcamps.',
        keywords: 'ASB Training Hub training, programme not found',
        path: slug ? `/training/${slug}` : '/training',
        noindex: true,
      });
      return;
    }

    setPageSeo({
      title: programme.metaTitle || `${programme.title} | ASB Training Hub`,
      description:
        programme.metaDescription ||
        truncateForSerp(`${programme.description} ${programme.duration}, ${programme.mode.toLowerCase()}.`),
      keywords: programme.keywords,
      path: `/training/${programme.slug}`,
      image: programme.imageUrl || '/site-logo.png',
    });

    setJsonLd('training', {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: programme.title,
      description: programme.overview || programme.description,
      url: absoluteUrl(`/training/${programme.slug}`),
      inLanguage: 'en',
      educationalCredentialAwarded: programme.certificate || undefined,
      teaches: programme.learningOutcomes?.length ? programme.learningOutcomes : undefined,
      coursePrerequisites: programme.prerequisites?.length ? programme.prerequisites : undefined,
      provider: {
        '@type': 'EducationalOrganization',
        '@id': absoluteUrl('/#organization'),
        name: 'ASB Training Hub',
        url: absoluteUrl('/'),
      },
      hasCourseInstance: [
        {
          '@type': 'CourseInstance',
          courseMode: /online/i.test(programme.mode) ? 'blended' : 'onsite',
          courseWorkload: programme.duration,
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

    setJsonLd('training-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Training', item: absoluteUrl('/training') },
        {
          '@type': 'ListItem',
          position: 3,
          name: programme.categoryLabel,
          item: absoluteUrl(`/training/category/${programme.category}`),
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: programme.title,
          item: absoluteUrl(`/training/${programme.slug}`),
        },
      ],
    });

    if (programme.faqs?.length) {
      setJsonLd('training-faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: programme.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    } else {
      removeJsonLd('training-faq');
    }

    return () => {
      removeJsonLd('training');
      removeJsonLd('training-breadcrumb');
      removeJsonLd('training-faq');
    };
  }, [programme, slug, loading]);

  if (loading) {
    return (
      <main className="min-h-screen pt-32 text-center text-muted-foreground" role="status">
        Loading programme...
      </main>
    );
  }

  if (!programme) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
        <h1 className="text-3xl font-bold font-heading mb-3">Programme not found</h1>
        <p className="text-muted-foreground mb-6">This programme may have been renamed or retired.</p>
        <Link to="/training" title="Browse all training programmes" className="inline-flex self-center">
          <Button>Browse all programmes</Button>
        </Link>
      </main>
    );
  }

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/training"
            title="Back to training programmes"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Training
          </Link>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {programme.categoryLabel}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-5">
            {programme.title}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-6">{programme.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden />{programme.duration}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{programme.mode}</span>
            {programme.certificate && (
              <span className="flex items-center gap-1.5"><Award className="h-4 w-4" aria-hidden />Certificate included</span>
            )}
          </div>
        </div>
      </section>

      {programme.imageUrl && (
        <section className="container mx-auto max-w-5xl px-4 -mt-8 relative z-10">
          <SmartImage
            src={programme.imageUrl}
            alt={programme.imageAlt || programme.title}
            sizes="(min-width: 1024px) 1024px, 100vw"
            wrapperClassName="rounded-2xl overflow-hidden aspect-[21/9] border border-border"
            eager
          />
        </section>
      )}

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 xl:gap-14 items-start">
            <article className="min-w-0 space-y-10">
              {programme.overview && (
                <p className="text-xl text-muted-foreground leading-relaxed">{programme.overview}</p>
              )}

              {programme.content && (
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(programme.content) }}
                />
              )}

              {programme.secondaryImageUrl && (
                <SmartImage
                  src={programme.secondaryImageUrl}
                  alt={programme.secondaryImageAlt || programme.title}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  wrapperClassName="rounded-2xl overflow-hidden aspect-[16/9] border border-border"
                />
              )}

              <ListSection title="What it covers" items={programme.syllabus} icon={Target} />
              <ListSection title="What you will be able to do" items={programme.learningOutcomes} icon={GraduationCap} />
              <ListSection title="Who it is for" items={programme.whoShouldJoin} icon={Users} />
              <ListSection title="What you need beforehand" items={programme.prerequisites} icon={CheckCircle} />
              <ListSection title="Tools used" items={programme.tools} icon={Target} />
              <ListSection title="Project work" items={programme.projects} icon={Award} />

              {programme.certificate && (
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" aria-hidden /> Certificate
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{programme.certificate}</p>
                </div>
              )}

              {programme.faqs?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-4">Frequently asked questions</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {programme.faqs.map((faq, i) => (
                      <AccordionItem key={faq.q} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border bg-card/40 p-5 shadow-sm lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <h2 className="text-lg font-bold font-heading mb-4">Enquire about this programme</h2>
                <InquiryForm stacked />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TrainingDetail;
