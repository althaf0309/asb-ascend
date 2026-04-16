import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useState } from 'react';
import { X } from 'lucide-react';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const galleryCategories = ['All', 'Campus', 'Classroom', 'Events', 'Certifications'];
const images = [
  { src: '/placeholder.svg', alt: 'Modern classroom with students', category: 'Classroom' },
  { src: '/placeholder.svg', alt: 'ASB Training Hub campus exterior', category: 'Campus' },
  { src: '/placeholder.svg', alt: 'Annual tech event', category: 'Events' },
  { src: '/placeholder.svg', alt: 'Certificate distribution ceremony', category: 'Certifications' },
  { src: '/placeholder.svg', alt: 'Computer lab session', category: 'Classroom' },
  { src: '/placeholder.svg', alt: 'Student group project', category: 'Classroom' },
  { src: '/placeholder.svg', alt: 'Workshop on AI', category: 'Events' },
  { src: '/placeholder.svg', alt: 'Campus reception area', category: 'Campus' },
  { src: '/placeholder.svg', alt: 'Industry expert guest lecture', category: 'Events' },
];

const Gallery = () => {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const filtered = filter === 'All' ? images : images.filter(img => img.category === filter);

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
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm transition-opacity">{img.alt}</span>
                    </div>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}><X className="h-8 w-8" /></button>
          <img src={filtered[lightbox].src} alt={filtered[lightbox].alt} className="max-w-full max-h-[80vh] rounded-xl" />
        </div>
      )}
    </main>
  );
};

export default Gallery;
