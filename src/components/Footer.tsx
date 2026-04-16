import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, ArrowRight, Globe, MessageSquare, Users, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => (
  <footer className="gradient-bg text-gray-300">
    <div className="container mx-auto px-4 py-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold text-white font-heading">ASB Training Hub</span>
          </Link>
          <p className="text-sm leading-relaxed mb-4">
            Expert-led, job-oriented training institute offering practical learning, industry-focused upskilling, career support, and placement-oriented programs in Trivandrum, Kerala.
          </p>
          <div className="flex gap-3">
            {[Globe, MessageSquare, Users, BookOpen, Star].map((Icon, i) => (
              <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-primary transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-heading font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[['About Us', '/about'], ['All Courses', '/courses'], ['Reviews', '/reviews'], ['Gallery', '/gallery'], ['Blog', '/blog'], ['FAQ', '/faq'], ['Contact', '/contact'], ['Apply Now', '/apply']].map(([label, path]) => (
              <li key={path}><Link to={path} className="hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="h-3 w-3" />{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Course Categories */}
        <div>
          <h3 className="text-white font-heading font-semibold mb-4">Course Categories</h3>
          <ul className="space-y-2 text-sm">
            {[['ERP / SAP Courses', '/courses/erp'], ['Programming Languages', '/courses/programming'], ['AI Trainings', '/courses/ai'], ['Management Courses', '/courses/management'], ['Internship Programs', '/courses/internship']].map(([label, path]) => (
              <li key={path}><Link to={path} className="hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="h-3 w-3" />{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div>
          <h3 className="text-white font-heading font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>105-2, The Atomic, Near Technopark Phase 1, Kazhakootam, Trivandrum, Kerala, 695581</span></div>
            <a href="tel:+918714773304" className="flex gap-2 hover:text-white"><Phone className="h-4 w-4" />+91 8714773304</a>
            <a href="mailto:info@asbtraininghub.com" className="flex gap-2 hover:text-white"><Mail className="h-4 w-4" />info@asbtraininghub.com</a>
          </div>
          <h4 className="text-white text-sm font-semibold mb-2">Newsletter</h4>
          <div className="flex gap-2">
            <Input placeholder="Your email" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm" />
            <Button size="sm" className="gradient-primary border-0 text-white shrink-0">Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} ASB Training Hub. All rights reserved. | Best Training Institute in Trivandrum, Kerala
    </div>
  </footer>
);

export default Footer;
