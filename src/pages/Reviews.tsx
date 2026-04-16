import { Star, Quote } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const reviews = [
  { name: 'Arun Kumar', role: 'SAP FICO Consultant at TCS', rating: 5, text: 'ASB Training Hub transformed my career completely. The SAP FICO training was deeply practical with real-time projects. I secured a position at TCS within 2 months of completing the course. The trainers are incredibly experienced and supportive.' },
  { name: 'Priya Nair', role: 'Python Developer at Infosys', rating: 5, text: 'The Python Full Stack course was the best investment I made. From basics to deployment, everything was covered. The internship experience gave me the portfolio and confidence needed to crack interviews at Infosys.' },
  { name: 'Rahul Menon', role: 'AI Engineer at Wipro', rating: 5, text: 'Best AI training institute in Trivandrum! The hands-on projects with real datasets, mentor support, and career guidance were exceptional. The GenAI module was cutting-edge and helped me land my dream role.' },
  { name: 'Sneha Das', role: 'HR Manager at UST', rating: 5, text: 'The HR Management diploma transformed me from a fresher to a confident HR professional in just 6 months. The curriculum covers everything from recruitment to compliance. Placement support was outstanding.' },
  { name: 'Vishnu Prasad', role: 'SAP MM Consultant', rating: 5, text: 'Excellent SAP training with real ERP system access. The practical approach at ASB made all the difference. Highly recommend for anyone looking to build a career in SAP.' },
  { name: 'Anjali Krishnan', role: 'Data Scientist at Tata Elxsi', rating: 5, text: 'The Data Science + AI program was comprehensive. I learned everything from statistics to deep learning with real projects. The placement cell connected me with top companies in Technopark.' },
  { name: 'Mohammed Faisal', role: 'Full Stack Developer at QBurst', rating: 5, text: 'ASB Training Hub\'s coding bootcamp is world-class. The project-based learning approach, code reviews, and interview prep were instrumental in my career transition to tech.' },
  { name: 'Lakshmi Devi', role: 'Logistics Manager at DHL', rating: 5, text: 'The Logistics Management diploma gave me the skills and confidence to advance in my career. The trainers brought real industry experience and the curriculum was up-to-date.' },
];

const Reviews = () => (
  <main>
    <section className="gradient-bg pt-28 pb-16">
      <div className="container mx-auto px-4 text-center">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Testimonials</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">Student <span className="gradient-text">Success Stories</span></h1>
        <p className="text-gray-300 max-w-2xl mx-auto">Real stories from real students who transformed their careers with ASB Training Hub.</p>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <ScrollReveal key={r.name} delay={(i % 6) * 100}>
              <div className="rounded-2xl border border-border bg-card p-6 hover-lift h-full flex flex-col">
                <Quote className="h-8 w-8 text-primary/20 mb-3" />
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground flex-1 mb-4">"{r.text}"</p>
                <div className="border-t border-border pt-3">
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding gradient-bg text-center">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold text-white font-heading mb-4">Write Your Own Success Story</h2>
        <p className="text-gray-400 mb-6">Join thousands of students who have transformed their careers with ASB Training Hub.</p>
        <Link to="/apply"><Button size="lg" className="gradient-primary border-0 text-white font-semibold">Apply Now</Button></Link>
      </div>
    </section>
  </main>
);

export default Reviews;
