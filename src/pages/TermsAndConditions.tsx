import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setJsonLd, setPageSeo } from '@/lib/seo';

const termsSections = [
  {
    title: '1. Enrollment & Fees',
    items: [
      'Enrollment in any course is subject to seat availability and confirmation by ASB Training Hub.',
      'The full course fee must be paid before training begins unless a written payment arrangement has been approved by ASB Training Hub.',
      'Course fees are non-refundable and non-transferable under any circumstances.',
    ],
  },
  {
    title: '2. Placement Support',
    items: [
      'ASB Training Hub provides professional training to improve student knowledge, confidence, and job readiness, but does not guarantee job placement.',
      'Placement-related assistance such as resume guidance, interview preparation, and referrals is optional support and does not represent a job guarantee.',
    ],
  },
  {
    title: '3. Training & Course Material',
    items: [
      'Course materials shared during training are for personal learning use only.',
      'Students must not copy, reproduce, distribute, sell, or share course materials without prior written permission from ASB Training Hub.',
      'Training schedules, curriculum, batch timings, and instructors may be changed at the institute’s discretion.',
    ],
  },
  {
    title: '4. Attendance & Conduct',
    items: [
      'Students are expected to attend classes regularly and maintain discipline throughout the course.',
      'Repeated absenteeism may result in removal from the course without a refund.',
      'Misconduct, inappropriate behavior, or violation of institute policies may lead to immediate dismissal without a refund.',
    ],
  },
  {
    title: '5. No Refund Policy',
    items: [
      'Once enrollment is completed, course fees will not be refunded for personal reasons, dissatisfaction, inability to continue, or any other circumstance.',
      'If ASB Training Hub cancels a batch due to unforeseen circumstances, an alternative batch or rescheduling option may be provided at the institute’s discretion.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    items: [
      'ASB Training Hub is not liable for direct, indirect, incidental, or consequential damages arising from the training provided.',
      'The institute is not responsible for outcomes or consequences that arise from how students apply the knowledge gained during training.',
    ],
  },
  {
    title: '7. Amendments',
    items: [
      'ASB Training Hub may modify or update these terms and conditions at any time without prior notice.',
      'Continued enrollment or participation in a course indicates acceptance of any updated terms.',
    ],
  },
];

const TermsAndConditions = () => {
  useEffect(() => {
    setPageSeo({
      title: 'Terms and Conditions | ASB Training Hub',
      description:
        'Read ASB Training Hub terms and conditions covering enrollment, fees, placement support, course material, attendance, refund policy, liability, and amendments.',
      keywords:
        'ASB Training Hub terms and conditions, ASB refund policy, course enrollment terms, training institute policy Trivandrum',
      path: '/terms-and-conditions',
    });
    setJsonLd('terms-page', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Terms and Conditions',
      url: 'https://www.asbtraininghub.com/terms-and-conditions',
      isPartOf: {
        '@type': 'WebSite',
        name: 'ASB Training Hub',
        url: 'https://www.asbtraininghub.com/',
      },
      about: termsSections.map((section) => section.title),
    });
  }, []);

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm text-gray-300 mb-6">
              <FileText className="h-4 w-4 text-primary" />
              <span>ASB Training Hub Policy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">Terms and Conditions</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Please read these terms carefully before enrolling in any course at ASB Training Hub.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-8">
            <p className="text-muted-foreground leading-7">
              By enrolling in any course at ASB Training Hub, you confirm that you have read, understood, and agreed to these terms and conditions.
            </p>
          </div>

          <div className="space-y-6">
            {termsSections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <h2 className="text-2xl font-bold font-heading mb-4">{section.title}</h2>
                <ul className="space-y-3 text-muted-foreground leading-7">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="text-2xl font-bold font-heading mb-3">Company Information</h2>
            <p className="text-muted-foreground leading-7">
              ASB Training Hub is under WEBSER Technologies Pvt. Ltd.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" title="Contact ASB Training Hub">
              <Button className="gradient-primary border-0 text-white">Contact Us</Button>
            </Link>
            <Link to="/apply" title="Apply for ASB Training Hub courses">
              <Button variant="outline">Apply Now</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermsAndConditions;
