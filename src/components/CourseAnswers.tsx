import { useEffect, useState } from 'react';
import { fetchCourseAnswers, type CourseAnswersData } from '@/lib/api';
import { applySeoSnippet } from '@/lib/seo';

/**
 * Quick facts and direct answers for a course or keyword page. The text comes
 * from /api/answers/*, the same source the server renders for crawlers, so
 * visitors and search engines always read the same thing.
 */
const CourseAnswers = ({ path }: { path: string }) => {
  const [data, setData] = useState<CourseAnswersData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    fetchCourseAnswers(path)
      .then((next) => {
        if (cancelled) return;
        setData(next);
        if (next?.seo) applySeoSnippet(next.seo);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [path]);

  // Optional section: an unexpected response must hide it, never break the page.
  if (!data?.facts?.length || !data.answers?.length) return null;

  return (
    <section className="section-padding bg-background" aria-labelledby="quick-facts-heading">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 id="quick-facts-heading" className="text-2xl md:text-3xl font-bold font-heading">Quick facts</h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.facts.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{fact.label}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-12 text-2xl md:text-3xl font-bold font-heading">Common questions</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {data.answers.map((item) => (
            <div key={item.q}>
              <h3 className="font-bold text-foreground">{item.q}</h3>
              <p className="citable-answer mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseAnswers;
