import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SmartImage from '@/components/SmartImage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { setPageSeo, setJsonLd, removeJsonLd, absoluteUrl } from '@/lib/seo';
import { fetchTrainingSummaries, type CatalogueSummary } from '@/lib/api';

/** Presentation metadata; counts come from the API so they never drift. */
const TRAINING_CATEGORIES = [
  { id: 'corporate', label: 'Corporate Training', color: 'from-orange-500 to-amber-500' },
  { id: 'workshop', label: 'Workshops', color: 'from-green-500 to-emerald-500' },
  { id: 'certification', label: 'Certification Tracks', color: 'from-amber-500 to-orange-600' },
  { id: 'bootcamp', label: 'Bootcamps', color: 'from-rose-500 to-red-500' },
  { id: 'online', label: 'Live Online', color: 'from-violet-500 to-purple-500' },
];

const SEO_BY_CATEGORY: Record<string, { title: string; description: string; keywords: string }> = {
  corporate: {
    title: 'Corporate Training in Kerala | ASB Training Hub',
    description:
      'In-house corporate training delivered on-site or online across Kerala, built around your own workflows and finishing with working tools.',
    keywords: 'corporate training Kerala, in-house team training, on-site training Trivandrum',
  },
  workshop: {
    title: 'Weekend Workshops in Trivandrum | ASB Training Hub',
    description:
      'Short, hands-on weekend workshops in AI, ERP and programming. Build and deploy something real in two days.',
    keywords: 'weekend workshop Trivandrum, AI workshop Kerala, hands-on training',
  },
  certification: {
    title: 'Certification Tracks | ASB Training Hub',
    description:
      'Structured certification preparation for working professionals, with sandbox access, mock exams and evening or weekend batches.',
    keywords: 'certification training Kerala, ERP certification, evening batches Trivandrum',
  },
  bootcamp: {
    title: 'Intensive Bootcamps in Kerala | ASB Training Hub',
    description:
      'Full-time intensive bootcamps that take you from fundamentals to a deployed portfolio in weeks rather than months.',
    keywords: 'bootcamp Kerala, intensive training Trivandrum, full-time coding bootcamp',
  },
  online: {
    title: 'Live Online Training | ASB Training Hub',
    description:
      'Live, instructor-led online training with the same trainers and project work as our classroom batches.',
    keywords: 'live online training Kerala, instructor-led online course, remote training India',
  },
};

const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Training = () => {
  const { category } = useParams<{ category?: string }>();
  const [search, setSearch] = useState('');
  const [programmes, setProgrammes] = useState<CatalogueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchTrainingSummaries()
      .then((list) => { if (!cancelled) setProgrammes(list); })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Unable to load programmes.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const activeCategory = category && TRAINING_CATEGORIES.some((c) => c.id === category) ? category : '';

  const filtered = useMemo(() => {
    let list = activeCategory ? programmes.filter((p) => p.category === activeCategory) : programmes;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        [p.title, p.description, p.categoryLabel].some((f) => String(f || '').toLowerCase().includes(q)),
      );
    }
    return list;
  }, [programmes, activeCategory, search]);

  const countFor = (id: string) => programmes.filter((p) => p.category === id).length;
  const current = TRAINING_CATEGORIES.find((c) => c.id === activeCategory);
  const heading = current ? current.label : 'Training Programmes';

  useEffect(() => {
    const seo = activeCategory
      ? SEO_BY_CATEGORY[activeCategory]
      : {
          title: 'Training Programmes | ASB Training Hub Kerala',
          description:
            'Corporate training, weekend workshops, certification tracks and bootcamps from ASB Training Hub, Trivandrum. On-site, online and hybrid delivery.',
          keywords: 'corporate training Kerala, workshops Trivandrum, certification training, bootcamp Kerala',
        };

    setPageSeo({
      ...seo,
      path: activeCategory ? `/training/category/${activeCategory}` : '/training',
    });

    setJsonLd('training-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Training', item: absoluteUrl('/training') },
        ...(current
          ? [{
              '@type': 'ListItem',
              position: 3,
              name: current.label,
              item: absoluteUrl(`/training/category/${current.id}`),
            }]
          : []),
      ],
    });

    return () => removeJsonLd('training-breadcrumb');
  }, [activeCategory, current]);

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Training</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">{heading}</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {current
              ? SEO_BY_CATEGORY[current.id].description
              : 'Corporate programmes, weekend workshops, certification tracks and bootcamps — delivered on-site, online, or a mix of both.'}
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <label htmlFor="training-search" className="sr-only">Search training programmes</label>
              <Input
                id="training-search"
                type="search"
                placeholder="Search programmes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Link to="/training" title="All ASB Training Hub programmes" className="inline-flex self-center">
              <Button
                variant={!activeCategory ? 'default' : 'outline'}
                size="sm"
                className={!activeCategory ? 'gradient-primary border-0 text-white' : 'bg-transparent'}
              >
                All ({programmes.length})
              </Button>
            </Link>
            {TRAINING_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/training/category/${cat.id}`}
                title={`${cat.label} | ASB Training Hub`}
                className="inline-flex self-center"
              >
                <Button
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  className={activeCategory === cat.id ? 'gradient-primary border-0 text-white' : 'bg-transparent'}
                >
                  {cat.label} ({countFor(cat.id)})
                </Button>
              </Link>
            ))}
          </div>

          <h2 className="text-2xl font-bold font-heading mb-6">
            {search.trim()
              ? `${filtered.length} ${filtered.length === 1 ? 'programme' : 'programmes'} matching "${search.trim()}"`
              : current
                ? `${current.label}`
                : 'All programmes'}
          </h2>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground" role="status">Loading programmes...</div>
          ) : loadError ? (
            <div className="text-center py-16 text-destructive" role="alert">{loadError}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No programmes found. <Link to="/contact" className="text-primary hover:underline">Ask us about a custom programme</Link>.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((programme, i) => (
                <ScrollReveal key={programme.slug} delay={(i % 6) * 80}>
                  <Link
                    to={`/training/${programme.slug}`}
                    title={`${programme.title} | ASB Training Hub`}
                    className="group block h-full"
                  >
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full flex flex-col">
                      <div className="h-36 relative overflow-hidden">
                        {programme.imageUrl ? (
                          <SmartImage
                            src={programme.imageUrl}
                            alt={programme.imageAlt || programme.title}
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            wrapperClassName="absolute inset-0"
                            className="group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${
                              TRAINING_CATEGORIES.find((c) => c.id === programme.category)?.color ||
                              'from-primary to-secondary'
                            }`}
                            aria-hidden
                          />
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <span className="text-xs font-medium text-primary">{programme.categoryLabel}</span>
                        <h3 className="text-lg font-bold font-heading mt-1 mb-2 group-hover:text-primary transition-colors">
                          {programme.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-3">
                          {programme.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" aria-hidden /> {programme.duration}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" aria-hidden /> {programme.mode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Training;
