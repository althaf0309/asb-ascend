import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InquiryForm from '@/components/InquiryForm';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Contact = () => (
  <main>
    <section className="gradient-bg pt-28 pb-16">
      <div className="container mx-auto px-4 text-center">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Contact Us</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">Get In Touch</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">Visit our campus near Technopark, call us, or drop a message. We're here to help you start your career journey.</p>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <ScrollReveal>
              <h2 className="text-2xl font-bold font-heading mb-6">Contact Information</h2>
            </ScrollReveal>
            <div className="space-y-6 mb-8">
              {[
                { icon: MapPin, label: 'Address', value: '105-2, The Atomic, Near Technopark Phase 1, Kazhakootam, Trivandrum, Kerala, 695581' },
                { icon: Phone, label: 'Phone / WhatsApp', value: '+91 8714773304', href: 'tel:+918714773304' },
                { icon: Mail, label: 'Email', value: 'info@asbtraininghub.com', href: 'mailto:info@asbtraininghub.com' },
                { icon: Clock, label: 'Office Hours', value: 'Mon - Sat: 9:00 AM - 6:00 PM' },
              ].map((item, i) => (
                <ScrollReveal key={item.label} delay={i * 100}>
                  <div className="flex gap-4 items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      {item.href ? <a href={item.href} className="text-sm text-muted-foreground hover:text-primary">{item.value}</a> : <div className="text-sm text-muted-foreground">{item.value}</div>}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={400}>
              <a href="https://wa.me/918714773304" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
                  <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
                </Button>
              </a>
            </ScrollReveal>
            <ScrollReveal delay={500}>
              <div className="mt-8 rounded-xl overflow-hidden border border-border h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.8!2d76.86!3d8.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sKazhakootam%2C+Trivandrum!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ASB Training Hub Location"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={200}>
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h3 className="text-xl font-bold font-heading mb-2">Send Us a Message</h3>
              <p className="text-sm text-muted-foreground mb-6">Fill out the form and our admissions team will get back to you within 24 hours.</p>
              <InquiryForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  </main>
);

export default Contact;
