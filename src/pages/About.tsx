import { CheckCircle, Target, Eye, BookOpen, Users, Award, MapPin, Calendar, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import InquiryForm from '@/components/InquiryForm';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { setPageSeo } from '@/lib/seo';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const timeline = [
  { year: '2018', title: 'Founded', desc: 'ASB Training Hub established in Trivandrum with a vision for career-focused education.' },
  { year: '2019', title: 'SAP Programs Launched', desc: 'Introduced comprehensive SAP/ERP training programs with industry-certified trainers.' },
  { year: '2020', title: 'Online Platform', desc: 'Expanded to online learning, reaching students across Kerala and beyond.' },
  { year: '2021', title: 'AI & Programming', desc: 'Added cutting-edge AI, Machine Learning, and full-stack programming courses.' },
  { year: '2022', title: 'Internship Programs', desc: 'Launched internship partnerships with 100+ companies for hands-on experience.' },
  { year: '2023', title: '5000+ Alumni', desc: 'Crossed 5000 trained students with 85%+ placement rate.' },
  { year: '2024', title: 'Expansion', desc: 'Expanded course catalog to 50+ programs including Agentic AI and GenAI.' },
];

const About = () => {
  useEffect(() => {
    setPageSeo({
      title: 'About ASB Training Hub | Career Training Institute in Trivandrum',
      description: 'Learn about ASB Training Hub, a career-focused training institute near Technopark, Trivandrum offering practical ERP, programming, AI, management, and internship programs.',
      keywords: 'about ASB Training Hub, career training institute Trivandrum, professional training Kerala, job oriented courses Trivandrum, Technopark training institute',
      path: '/about',
    });
  }, []);

  return (
  <main>
    {/* Hero */}
    <section className="gradient-bg pt-28 pb-16">
      <div className="container mx-auto px-4 text-center">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">About Us</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">Empowering Careers Through <span className="gradient-text">Practical Training</span></h1>
        <p className="text-gray-300 max-w-2xl mx-auto">We are Trivandrum's premier training institute, dedicated to bridging the gap between education and industry through expert-led, job-oriented programs.</p>
      </div>
    </section>

    {/* Story */}
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl font-bold font-heading mt-2 mb-4">From a Vision to Kerala's Leading Training Hub</h2>
              <p className="text-muted-foreground mb-4">ASB Training Hub was founded with a simple belief — quality education should be practical, industry-relevant, and career-focused. Located near Technopark in Kazhakootam, we bring together top industry professionals as trainers, cutting-edge curriculum, and a supportive learning environment.</p>
              <p className="text-muted-foreground mb-6">Our programs span ERP/SAP, Programming, AI, Management, and Internship tracks — all designed with one goal: making our students job-ready from day one.</p>
              <Link to="/courses" title="Explore ASB Training Hub courses"><Button className="gradient-primary border-0 text-white">Explore Our Courses <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: '5000+', desc: 'Students Trained' },
                { icon: BookOpen, label: '50+', desc: 'Active Programs' },
                { icon: Award, label: '85%+', desc: 'Placement Rate' },
                { icon: MapPin, label: 'Trivandrum', desc: 'Kerala, India' },
              ].map((item) => (
                <div key={item.desc} className="rounded-xl border border-border bg-card p-5 text-center hover-lift">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold font-heading">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="section-padding gradient-bg">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-8">
              <Target className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-white font-heading mb-3">Our Mission</h3>
              <p className="text-gray-400">To provide world-class, practical training that transforms students into industry-ready professionals through expert mentorship, hands-on projects, and guaranteed career support.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="glass-card rounded-2xl p-8">
              <Eye className="h-10 w-10 text-secondary mb-4" />
              <h3 className="text-2xl font-bold text-white font-heading mb-3">Our Vision</h3>
              <p className="text-gray-400">To become India's most trusted career training institute, known for producing skilled professionals who drive innovation across industries globally.</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="section-padding bg-background">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl font-bold font-heading mt-2">The ASB Training Hub Story</h2>
          </div>
        </ScrollReveal>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />
          {timeline.map((item, i) => (
            <ScrollReveal key={item.year} delay={i * 100}>
              <div className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="hidden md:block flex-1" />
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-xs font-bold">
                  {item.year.slice(2)}
                </div>
                <div className="flex-1 rounded-xl border border-border bg-card p-4 hover-lift">
                  <div className="text-xs font-semibold text-primary">{item.year}</div>
                  <h4 className="font-bold font-heading">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section-padding gradient-bg">
      <div className="container mx-auto text-center max-w-2xl">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-white font-heading mb-4">Join ASB Training Hub Today</h2>
          <p className="text-gray-400 mb-6">Take the first step toward a rewarding career. Talk to our advisors or apply now.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply" title="Apply for admission at ASB Training Hub"><Button size="lg" className="gradient-primary border-0 text-white font-semibold">Apply for Admission</Button></Link>
            <Link to="/contact" title="Talk to an ASB Training Hub advisor"><Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">Talk to an Advisor</Button></Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </main>
  );
};

export default About;
