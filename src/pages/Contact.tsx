import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import InquiryForm from '@/components/InquiryForm';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { setPageSeo } from '@/lib/seo';

const socialLinks = [
  {
    label: 'Facebook', color: 'hover:bg-blue-600', href: 'https://www.facebook.com/share/1CsFkSP9E2/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
  },
  {
    label: 'Instagram', color: 'hover:bg-pink-600', href: 'https://www.instagram.com/asbtraininghub',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
  },
  {
    label: 'Threads', color: 'hover:bg-gray-800', href: 'https://www.threads.com/@asbtraininghub',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.024c.026-3.576.876-6.43 2.521-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.02-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.594 12c.022 3.086.713 5.496 2.051 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.541-.02 4.495-.624 5.807-1.799 1.504-1.336 2.257-3.334 2.257-5.942v-.323H12.18v-2.08H22.3v2.402c0 3.237-1.017 5.81-2.984 7.455-1.672 1.42-3.975 2.156-6.809 2.156z" /></svg>,
  },
  {
    label: 'LinkedIn', color: 'hover:bg-blue-700', href: 'https://www.linkedin.com/company/asb-training-hub/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>,
  },
  {
    label: 'X (Twitter)', color: 'hover:bg-black', href: 'https://x.com/Asbtraininghub',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    label: 'YouTube', color: 'hover:bg-red-600', href: 'https://www.youtube.com/@ASBTrainingHub',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" /></svg>,
  },
];

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Contact = () => {
  useEffect(() => {
    setPageSeo({
      title: 'Contact ASB Training Hub | Training Institute Near Technopark',
      description: 'Contact ASB Training Hub in Kazhakootam, Trivandrum for ERP/SAP, AI, programming, management, and internship course admissions, counseling, and demo classes.',
      keywords: 'contact ASB Training Hub, training institute Kazhakootam, training institute near Technopark, course admission Trivandrum, ASB Training Hub phone number',
      path: '/contact',
    });
  }, []);

  return (
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
                      {item.href ? <a href={item.href} title={`${item.label} ASB Training Hub`} className="text-sm text-muted-foreground hover:text-primary">{item.value}</a> : <div className="text-sm text-muted-foreground">{item.value}</div>}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={400}>
              <a href="https://wa.me/918714773304" target="_blank" rel="noopener noreferrer" title="Chat with ASB Training Hub on WhatsApp">
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
                  <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
                </Button>
              </a>
            </ScrollReveal>
            <ScrollReveal delay={480}>
              <div className="mt-6">
                <div className="text-sm font-semibold mb-3">Follow Us</div>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={`ASB Training Hub on ${s.label}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground transition-colors ${s.color} hover:text-white hover:border-transparent`}>
                      {s.icon}
                      <span>{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
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
};

export default Contact;
