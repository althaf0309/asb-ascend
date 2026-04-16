import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, Briefcase, Star, ChevronDown, Sparkles, Brain, Code2, GraduationCap, Database, CheckCircle, TrendingUp, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { courseCategories, courses } from '@/data/courses';
import InquiryForm from '@/components/InquiryForm';
import { useScrollReveal, useAnimatedCounter } from '@/hooks/useScrollReveal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const categoryIcons: Record<string, React.ReactNode> = {
  Database: <Database className="h-8 w-8" />,
  Code2: <Code2 className="h-8 w-8" />,
  Brain: <Brain className="h-8 w-8" />,
  GraduationCap: <GraduationCap className="h-8 w-8" />,
  Briefcase: <Briefcase className="h-8 w-8" />,
};

const stats = [
  { label: 'Students Trained', value: 5000, suffix: '+', icon: Users },
  { label: 'Active Programs', value: 50, suffix: '+', icon: BookOpen },
  { label: 'Career Placements', value: 2500, suffix: '+', icon: Briefcase },
  { label: 'Expert Trainers', value: 35, suffix: '+', icon: Award },
];

const whyChoose = [
  { icon: CheckCircle, title: 'Industry-Expert Trainers', desc: 'Learn from professionals with 10+ years of real-world experience in top companies.' },
  { icon: Briefcase, title: 'Placement Support', desc: 'Dedicated placement cell with 200+ hiring partners and career counseling.' },
  { icon: BookOpen, title: 'Practical Learning', desc: 'Hands-on projects, live case studies, and real-world simulations — not just theory.' },
  { icon: Award, title: 'Recognized Certifications', desc: 'Industry-recognized certificates that add weight to your resume.' },
  { icon: TrendingUp, title: 'Career Growth Focus', desc: 'Structured career roadmaps, mock interviews, and resume building workshops.' },
  { icon: Zap, title: 'Flexible Learning', desc: 'Online and offline modes with weekend batches for working professionals.' },
];

const testimonials = [
  { name: 'Arun Kumar', role: 'SAP FICO Consultant at TCS', rating: 5, text: 'ASB Training Hub transformed my career. The SAP FICO training was practical, and I got placed within 2 months of completing the course.' },
  { name: 'Priya Nair', role: 'Python Developer at Infosys', rating: 5, text: 'The Python Full Stack course was comprehensive. The internship experience gave me the confidence to crack interviews at top MNCs.' },
  { name: 'Rahul Menon', role: 'AI Engineer at Wipro', rating: 5, text: 'Best AI training institute in Trivandrum! The hands-on projects and mentor support were exceptional.' },
  { name: 'Sneha Das', role: 'HR Manager at UST', rating: 5, text: 'The HR Management diploma helped me transition from a fresher to an HR professional in just 6 months.' },
];

const faqs = [
  { q: 'What makes ASB Training Hub different from other institutes?', a: 'We focus on practical, job-oriented training with industry-expert trainers, real projects, internship support, and dedicated placement assistance. Our curriculum is constantly updated to match industry demands.' },
  { q: 'Do you offer online classes?', a: 'Yes! We offer both online and offline modes. Our online classes are live and interactive with the same quality as in-person sessions.' },
  { q: 'Is there any placement guarantee?', a: 'We provide dedicated placement support including resume building, mock interviews, and connections with 200+ hiring partners. While we don\'t guarantee placement, our track record speaks for itself.' },
  { q: 'Can working professionals join?', a: 'Absolutely! We have weekend and evening batches designed specifically for working professionals looking to upskill.' },
];

const StatCounter = ({ stat }: { stat: typeof stats[0] }) => {
  const { ref, count } = useAnimatedCounter(stat.value);
  return (
    <div ref={ref} className="text-center">
      <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
      <div className="text-3xl md:text-4xl font-bold text-white font-heading">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
    </div>
  );
};

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Index = () => {
  const popularCourses = courses.slice(0, 6);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center gradient-bg overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 mb-6 text-sm text-gray-300">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Best Training Institute in Trivandrum, Kerala</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-heading leading-tight mb-6 animate-fade-in">
              Transform Your Career with{' '}
              <span className="gradient-text">Industry-Focused Training</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Master ERP/SAP, AI, Programming, Management & more with expert-led practical training, internship support, and career-oriented learning at ASB Training Hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/courses">
                <Button size="lg" className="gradient-primary border-0 text-white font-semibold text-lg px-8 py-6 hover:opacity-90">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="https://wa.me/918714773304?text=Hi%20ASB%20Training%20Hub%2C%20I%20want%20to%20know%20about%20courses" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 text-lg px-8 py-6">
                  WhatsApp Now
                </Button>
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-10 container mx-auto px-4">
        <div className="glass-dark rounded-2xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => <StatCounter key={stat.label} stat={stat} />)}
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Programs</span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">Featured Course Categories</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Choose from 50+ industry-focused courses designed to launch or accelerate your career.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseCategories.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 100}>
                <Link to={`/courses/${cat.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover-lift h-full">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white mb-4`}>
                      {categoryIcons[cat.icon]}
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">{cat.label}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">{cat.count} Courses</span>
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="section-padding gradient-bg">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Why ASB</span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mt-2">Why Choose ASB Training Hub?</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
                <div className="glass-card rounded-2xl p-6 hover-lift h-full">
                  <item.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-white font-heading mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Trending</span>
                <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">Popular Courses</h2>
              </div>
              <Link to="/courses" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map((course, i) => (
              <ScrollReveal key={course.id} delay={i * 100}>
                <Link to={`/course/${course.slug}`} className="group block">
                  <div className="rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full">
                    <div className="h-40 gradient-primary flex items-center justify-center relative">
                      <Code2 className="h-16 w-16 text-white/30" />
                      {course.internship && (
                        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Internship</span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-medium text-primary">{course.categoryLabel}</span>
                      <h3 className="text-lg font-bold font-heading mt-1 mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{course.duration}</span>
                        <span>{course.mode}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Internship Banner */}
      <section className="section-padding">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-14 text-center">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,hsla(0,0%,100%,0.1),transparent_50%)]" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">Internship + Placement Support</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">Get hands-on industry experience with our internship programs. We partner with 200+ companies to ensure your career takes off.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/courses/internship"><Button size="lg" className="bg-white text-foreground font-semibold hover:bg-white/90">Explore Internships</Button></Link>
                  <Link to="/apply"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Apply Now</Button></Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding gradient-bg">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Success Stories</span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mt-2">What Our Students Say</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100}>
                <div className="glass-card rounded-2xl p-6 hover-lift h-full flex flex-col">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-sm text-gray-300 flex-1 mb-4">"{t.text}"</p>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/reviews"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Read More Reviews <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">Frequently Asked Questions</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4 bg-card">
                  <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
          <div className="text-center mt-6">
            <Link to="/faq" className="text-primary font-semibold hover:underline text-sm">View All FAQs →</Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding gradient-bg">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Get Started</span>
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mt-2 mb-4">Ready to Transform Your Career?</h2>
                <p className="text-gray-400 mb-6">Fill out the inquiry form and our team will get back to you within 24 hours. Or simply WhatsApp us for instant support.</p>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Free career counseling session</div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Flexible EMI payment options</div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> 100% placement assistance</div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Certificate on completion</div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-bold text-white font-heading mb-4">Enquire Now</h3>
                <InquiryForm variant="dark" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
