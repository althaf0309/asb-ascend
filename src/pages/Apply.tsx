import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courses } from '@/data/courses';
import { Send, MessageCircle, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Apply = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', course: '', qualification: '', experience: '', message: '', preferredMode: '', callbackTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.course) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    toast({ title: 'Application Submitted!', description: 'Our admissions team will contact you within 24 hours.' });
    setForm({ name: '', email: '', phone: '', course: '', qualification: '', experience: '', message: '', preferredMode: '', callbackTime: '' });
  };

  return (
    <main>
      <section className="gradient-bg pt-28 pb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Apply Now</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 mb-4">Start Your <span className="gradient-text">Career Journey</span></h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Fill out the application form and our admissions team will get back to you within 24 hours.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <h2 className="text-2xl font-bold font-heading mb-6">Application Form</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                      <Input placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Phone Number *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                      <Select value={form.course} onValueChange={v => setForm({ ...form, course: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Course *" /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Highest Qualification" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
                      <Input placeholder="Work Experience (if any)" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Select value={form.preferredMode} onValueChange={v => setForm({ ...form, preferredMode: v })}>
                        <SelectTrigger><SelectValue placeholder="Preferred Mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline (Classroom)</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Preferred Callback Time" value={form.callbackTime} onChange={e => setForm({ ...form, callbackTime: e.target.value })} />
                    </div>
                    <Textarea placeholder="Any message or questions?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="min-h-[80px]" />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" size="lg" className="gradient-primary border-0 text-white font-semibold flex-1">
                        <Send className="h-4 w-4 mr-2" /> Submit Application
                      </Button>
                      <a href="https://wa.me/918714773304" target="_blank" rel="noopener noreferrer">
                        <Button type="button" size="lg" variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                          <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us
                        </Button>
                      </a>
                    </div>
                  </form>
                </div>
              </ScrollReveal>
            </div>

            <div className="space-y-6">
              <ScrollReveal delay={200}>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-bold font-heading mb-4">Why Apply?</h3>
                  <div className="space-y-3 text-sm">
                    {['Free career counseling', 'Flexible EMI options', '100% placement assistance', 'Industry-recognized certificates', 'Hands-on practical training', 'Internship opportunities'].map(item => (
                      <div key={item} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" />{item}</div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={300}>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-bold font-heading mb-4">Contact Admissions</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <a href="tel:+918714773304" className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4" />+91 8714773304</a>
                    <a href="mailto:info@asbtraininghub.com" className="flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4" />info@asbtraininghub.com</a>
                    <div className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" />Near Technopark, Kazhakootam, Trivandrum</div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Apply;
