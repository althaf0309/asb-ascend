import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Monitor } from 'lucide-react';
import { districtPath, locations } from '@/data/locations';
import { setPageSeo } from '@/lib/seo';

const regions = ['Trivandrum area', 'South Kerala', 'Central Kerala', 'North Kerala'] as const;

const Locations = () => {
  useEffect(() => setPageSeo({
    title: 'AI Course Locations in Kerala | ASB Training Hub',
    description: 'Find Generative AI, Agentic AI and job-oriented technology training for Trivandrum, Kochi, Kozhikode, Thrissur and other Kerala locations.',
    keywords: 'AI courses Kerala, Generative AI course Kerala, Agentic AI course Kerala, AI training locations Kerala',
    path: '/locations/kerala',
  }), []);

  return <main>
    <section className="gradient-bg pt-28 pb-16 text-center">
      <div className="container mx-auto px-4">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Learn Across Kerala</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">AI Course Locations in Kerala</h1>
        <p className="text-gray-300 max-w-3xl mx-auto">Classroom training near Technopark in Trivandrum and instructor-led online programmes for learners across Kerala.</p>
      </div>
    </section>
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 space-y-12">
        {regions.map((region) => {
          const items = locations.filter((item) => item.region === region);
          return <section key={region} aria-labelledby={`region-${region.replace(/\s+/g, '-').toLowerCase()}`}>
            <h2 id={`region-${region.replace(/\s+/g, '-').toLowerCase()}`} className="text-2xl font-bold font-heading mb-5">{region}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => <Link key={item.slug} to={districtPath(item)} className="group rounded-2xl border border-border bg-card p-6 hover-lift">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-xl bg-primary/10 p-3 text-primary"><MapPin className="h-5 w-5" /></span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold font-heading mt-4 group-hover:text-primary">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{item.description}</p>
                <span className="flex items-center gap-2 text-xs text-muted-foreground mt-4"><Monitor className="h-4 w-4" />{item.delivery}</span>
              </Link>)}
            </div>
          </section>;
        })}
      </div>
    </section>
  </main>;
};

export default Locations;
