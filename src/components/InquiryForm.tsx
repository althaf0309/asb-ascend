import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courseCategories } from '@/data/courseCategories';
import { Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitInquiry } from '@/lib/api';

interface InquiryFormProps {
  variant?: 'light' | 'dark';
  preselectedCourse?: string;
}

const InquiryForm = ({ variant = 'light', preselectedCourse }: InquiryFormProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: preselectedCourse || '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const isDark = variant === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry(form);
      toast({ title: 'Inquiry Submitted!', description: 'Our team will contact you shortly.' });
      setForm({ name: '', email: '', phone: '', course: preselectedCourse || '', message: '' });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : '';

  // Ids are instance-scoped because the form is mounted more than once per page
  // (hero and footer), and duplicate ids would break label association.
  const fieldId = useId();
  const id = (field: string) => `${fieldId}-${field}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id('name')} className="sr-only">Full name (required)</label>
          <Input
            id={id('name')}
            name="name"
            autoComplete="name"
            placeholder="Full Name *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor={id('email')} className="sr-only">Email address</label>
          <Input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id('phone')} className="sr-only">Phone number (required)</label>
          <Input
            id={id('phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor={id('course')} className="sr-only">Course interest</label>
          <Select value={form.course} onValueChange={v => setForm({ ...form, course: v })}>
            <SelectTrigger id={id('course')} aria-label="Course interest" className={inputClass}>
              <SelectValue placeholder="Select Course Interest" />
            </SelectTrigger>
            <SelectContent>
              {courseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label htmlFor={id('message')} className="sr-only">Your message (optional)</label>
        <Textarea
          id={id('message')}
          name="message"
          placeholder="Your Message (optional)"
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          className={`min-h-[80px] ${inputClass}`}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={submitting} className="gradient-primary border-0 text-white font-semibold flex-1">
          <Send className="h-4 w-4 mr-2" /> {submitting ? 'Submitting...' : 'Submit Inquiry'}
        </Button>
        <a
          href="https://wa.me/918714773304?text=Hi%20ASB%20Training%20Hub%2C%20I%20would%20like%20to%20know%20more%20about%20your%20courses."
          target="_blank"
          rel="noopener noreferrer"
         className="inline-flex self-center">
          <Button type="button" variant="outline" className={`w-full ${isDark ? 'border-green-500 text-green-400 hover:bg-green-500/10' : 'border-green-700 text-green-700 hover:bg-green-50'}`}>
            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us
          </Button>
        </a>
      </div>
    </form>
  );
};

export default InquiryForm;
