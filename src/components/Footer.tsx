import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/logo.webp';
import { useToast } from '@/hooks/use-toast';
import { submitNewsletter } from '@/lib/api';

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1CsFkSP9E2/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/asbtraininghub',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Threads',
    href: 'https://www.threads.com/@asbtraininghub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.024c.026-3.576.876-6.43 2.521-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.02-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.594 12c.022 3.086.713 5.496 2.051 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.541-.02 4.495-.624 5.807-1.799 1.504-1.336 2.257-3.334 2.257-5.942v-.323H12.18v-2.08H22.3v2.402c0 3.237-1.017 5.81-2.984 7.455-1.672 1.42-3.975 2.156-6.809 2.156z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/asb-training-hub/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/Asbtraininghub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@ASBTrainingHub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
      </svg>
    ),
  },
];

const NewsletterForm = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      toast({ title: 'Please enter your email', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await submitNewsletter({ email });
      toast({ title: 'Subscribed!', description: 'Thank you for subscribing to ASB Training Hub updates.' });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
        required
      />
      <Button type="submit" size="sm" disabled={submitting} className="gradient-primary border-0 text-white shrink-0">
        {submitting ? 'Sending...' : 'Subscribe'}
      </Button>
    </form>
  );
};

const Footer = () => (
  <footer className="gradient-bg text-gray-300">
    <div className="container mx-auto px-4 py-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link
            to="/"
            title="ASB Training Hub home"
            className="flex items-center gap-3 mb-4"
          >
            <span className="sr-only">ASB Training Hub home</span>
            <div className="flex items-center justify-center rounded-lg bg-white px-2 py-1.5 sm:px-2.5 sm:py-2">
              <img
                src={logo}
                alt=""
                aria-hidden
                width={160}
                height={44}
                className="h-7 w-auto max-w-[130px] sm:h-8 sm:max-w-[150px] lg:h-9 lg:max-w-[170px] block"
              />
            </div>
            <span className="text-base sm:text-lg font-bold text-white font-heading" aria-hidden>ASB Training Hub</span>
          </Link>
          <p className="text-sm leading-relaxed mb-4">
            Expert-led, job-oriented training institute offering practical learning, industry-focused upskilling, career support, and placement-oriented programs in Trivandrum, Kerala.
          </p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={`ASB Training Hub on ${s.label}`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-primary transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-heading font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[['About Us', '/about'], ['All Courses', '/courses'], ['Reviews', '/reviews'], ['Blog', '/blog'], ['FAQ', '/faq'], ['Contact', '/contact'], ['Apply Now', '/apply'], ['Terms & Conditions', '/terms-and-conditions']].map(([label, path]) => (
              <li key={path}><Link to={path} title={`${label} | ASB Training Hub`} className="hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="h-3 w-3" />{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Course Categories */}
        <div>
          <h3 className="text-white font-heading font-semibold mb-4">Course Categories</h3>
          <ul className="space-y-2 text-sm">
            {[['ERP / SAP Courses', '/courses/erp'], ['Programming Languages', '/courses/programming'], ['AI Trainings', '/courses/ai'], ['Management Courses', '/courses/management'], ['Internship Programs', '/courses/internship']].map(([label, path]) => (
              <li key={path}><Link to={path} title={`${label} | ASB Training Hub`} className="hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="h-3 w-3" />{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div>
          <h3 className="text-white font-heading font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>105-2, The Atomic, Near Technopark Phase 1, Kazhakootam, Trivandrum, Kerala, 695581</span></div>
            <a href="tel:+918714773304" title="Call ASB Training Hub" className="flex gap-2 hover:text-white"><Phone className="h-4 w-4" />+91 8714773304</a>
            <a href="mailto:info@asbtraininghub.com" title="Email ASB Training Hub" className="flex gap-2 hover:text-white"><Mail className="h-4 w-4" />info@asbtraininghub.com</a>
          </div>
          <h4 className="text-white text-sm font-semibold mb-2">Newsletter</h4>
          <NewsletterForm />
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} ASB Training Hub. All rights reserved. | Best Training Institute in Trivandrum, Kerala
    </div>
  </footer>
);

export default Footer;
