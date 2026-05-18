import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { setPageSeo } from '@/lib/seo';

import classroom1 from '@/assets/gallery/classroom-1.jpg';
import classroom2 from '@/assets/gallery/classroom-2.jpg';
import classroom3 from '@/assets/gallery/classroom-3.jpg';
import campus1 from '@/assets/gallery/campus-1.jpg';
import campus2 from '@/assets/gallery/campus-2.jpg';
import events1 from '@/assets/gallery/events-1.jpg';
import events2 from '@/assets/gallery/events-2.jpg';
import events3 from '@/assets/gallery/events-3.jpg';
import cert1 from '@/assets/gallery/cert-1.jpg';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const galleryCategories = ['All', 'Campus', 'Classroom', 'Events', 'Certifications'];
const images = [
  { src: classroom1, alt: 'Students learning coding in modern computer lab', category: 'Classroom' },
  { src: campus1, alt: 'ASB Training Hub campus near Technopark', category: 'Campus' },
  { src: events1, alt: 'Annual hackathon and tech event', category: 'Events' },
  { src: cert1, alt: 'Certificate distribution ceremony', category: 'Certifications' },
  { src: classroom2, alt: 'Collaborative coding session with laptops', category: 'Classroom' },
  { src: classroom3, alt: 'Hands-on SAP training workshop', category: 'Classroom' },
  { src: events2, alt: 'AI workshop with industry expert', category: 'Events' },
  { src: campus2, alt: 'Modern reception and lobby area', category: 'Campus' },
  { src: events3, alt: 'Industry expert guest lecture session', category: 'Events' },
];

const Gallery = () => {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const filtered = filter === 'All' ? images : images.filter(img => img.category === filter);

  useEffect(() => {
    setPageSeo({
      title: 'Gallery | ASB Training Hub Campus, Classes & Events',
      description: 'View ASB Training Hub gallery with campus, classroom, certification, and event photos from our career training institute in Trivandrum.',
      keywords: 'ASB Training Hub gallery, training institute photos Trivandrum, ASB campus, classroom training Kerala, Technopark institute gallery',
      path: '/gallery',
      noindex: true,
    });
  }, []);

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Gallery</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">Life at ASB Training Hub</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">A glimpse into our campus, classrooms, events, and student achievements.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {galleryCategories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((img, i) => (
              <ScrollReveal key={i} delay={(i % 6) * 80}>
                <button onClick={() => setLightbox(i)} className="block w-full group">
                  <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted relative">
                    <img src={img.src} alt={img.alt} title={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-end p-4">
                      <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm transition-opacity bg-foreground/50 px-3 py-1 rounded-full">{img.alt}</span>
                    </div>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}><X className="h-8 w-8" /></button>
          <img src={filtered[lightbox].src} alt={filtered[lightbox].alt} title={filtered[lightbox].alt} className="max-w-full max-h-[80vh] rounded-xl" />
        </div>
      )}
    </main>
  );
};

export default Gallery;
