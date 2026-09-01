import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { setJsonLd, setPageSeo } from '@/lib/seo';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const faqSections = [
  { title: 'General', faqs: [
    { q: 'What is ASB Training Hub?', a: 'ASB Training Hub is a premier professional training institute located near Technopark, Trivandrum, offering industry-focused courses in ERP/SAP, Programming, AI, Management, and more.' },
    { q: 'Where is ASB Training Hub located?', a: '105-2, The Atomic, Near Technopark Phase 1, Kazhakootam, Trivandrum, Kerala, 695581.' },
    { q: 'What are the office hours?', a: 'Monday to Saturday, 9:00 AM to 6:00 PM.' },
    { q: 'Do you offer online classes?', a: 'Yes! We offer both online and offline modes. Online classes are live and interactive.' },
  ]},
  { title: 'Courses & Admission', faqs: [
    { q: 'How do I enroll in a course?', a: 'You can enroll by filling out the Apply Now form on our website, calling us at +91 8714773304, or visiting our campus.' },
    { q: 'Are there any prerequisites?', a: 'Prerequisites vary by course. Most beginner courses have no prerequisites. Advanced courses may require basic knowledge in the subject area.' },
    { q: 'Can working professionals join?', a: 'Absolutely! We have weekend and evening batches designed for working professionals.' },
    { q: 'What is the class size?', a: 'We maintain small batch sizes of 15-20 students to ensure personalized attention.' },
    { q: 'Do you offer course demos?', a: 'Yes, we offer free demo sessions. Contact us to schedule one.' },
  ]},
  { title: 'Placement & Career', faqs: [
    { q: 'Do you provide placement support?', a: 'Yes, we have a dedicated placement cell with connections to 200+ hiring partners. We provide resume building, mock interviews, and job referrals.' },
    { q: 'What is the placement rate?', a: 'Our placement assistance rate is 85%+. Success depends on student effort and market conditions.' },
    { q: 'Do you offer internships?', a: 'Yes, many of our programs include internship components with real companies.' },
    { q: 'Will I get a certificate?', a: 'Yes, all students receive a course completion certificate upon successfully finishing the program.' },
  ]},
  { title: 'Fees & Payment', faqs: [
    { q: 'What are the course fees?', a: 'Fees vary by course. Contact us for detailed fee structure and any ongoing offers.' },
    { q: 'Do you offer EMI options?', a: 'Yes, we offer flexible EMI payment options to make learning accessible.' },
    { q: 'Is there any scholarship available?', a: 'We offer merit-based scholarships and early-bird discounts. Contact our admissions team for details.' },
  ]},
];

const FAQ = () => {
  useEffect(() => {
    setPageSeo({
      title: 'FAQ | ASB Training Hub Courses, Admission, Fees & Placement',
      description: 'Find answers about ASB Training Hub courses, admissions, online and offline classes, placement support, internships, certificates, fees, and EMI options.',
      keywords: 'ASB Training Hub FAQ, course fees Trivandrum, placement support training institute, online courses Kerala, internship course questions',
      path: '/faq',
    });
    setJsonLd('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqSections.flatMap((section) =>
        section.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      ),
    });
  }, []);

  return (
  <main>
    <section className="gradient-bg pt-28 pb-16">
      <div className="container mx-auto px-4 text-center">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">Find answers to common questions about courses, admissions, placements, and more.</p>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container mx-auto max-w-3xl">
        {faqSections.map((section, si) => (
          <ScrollReveal key={section.title} delay={si * 100}>
            <div className="mb-10">
              <h2 className="text-2xl font-bold font-heading mb-4">{section.title}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`${si}-${i}`} className="border rounded-xl px-4 bg-card">
                    <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollReveal>
        ))}

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" title="Contact ASB Training Hub" className="inline-flex self-center"><Button className="gradient-primary border-0 text-white">Contact Us</Button></Link>
            <a href="https://wa.me/918714773304" target="_blank" rel="noopener noreferrer" title="Chat with ASB Training Hub on WhatsApp" className="inline-flex self-center">
              <Button variant="outline">WhatsApp Us</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
  );
};

export default FAQ;
