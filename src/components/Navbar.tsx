import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const courseMenuItems = [
  { label: 'ERP / SAP Courses', path: '/courses/erp' },
  { label: 'Programming Courses', path: '/courses/programming' },
  { label: 'AI Trainings', path: '/courses/ai' },
  { label: 'Management Courses', path: '/courses/management' },
  { label: 'Internship Programs', path: '/courses/internship' },
];

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses', children: courseMenuItems },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-white px-2 py-1.5">
            <img src={logo} alt="ASB Training Hub" className="h-7 w-auto" />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold text-white font-heading leading-tight">ASB Training Hub</span>
            <span className="block text-[10px] text-blue-300 leading-none">Career-Focused Learning</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div key={link.path} className="relative group">
              <Link
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                  location.pathname === link.path ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {link.children && <ChevronDown className="h-3 w-3" />}
              </Link>
              {link.children && (
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="glass-dark rounded-xl p-2 min-w-[240px] shadow-xl border border-white/10">
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                    <Link
                      to="/courses"
                      className="block px-4 py-2.5 text-sm font-medium text-primary hover:bg-white/10 rounded-lg transition-colors border-t border-white/10 mt-1 pt-3"
                    >
                      View All Courses →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a href="tel:+918714773304" className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors">
            <Phone className="h-4 w-4" />
            <span>+91 8714773304</span>
          </a>
          <Link to="/apply">
            <Button className="gradient-primary border-0 text-white font-semibold hover:opacity-90">
              Apply Now
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-white p-2">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden glass-dark border-t border-white/10 px-4 pb-4 animate-fade-in">
          {navLinks.map((link) => (
            <div key={link.path}>
              {link.children ? (
                <>
                  <button
                    onClick={() => setCourseOpen(!courseOpen)}
                    className="flex w-full items-center justify-between py-3 text-sm text-gray-300 hover:text-white"
                  >
                    {link.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${courseOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {courseOpen && (
                    <div className="pl-4 space-y-1">
                      {link.children.map((child) => (
                        <Link key={child.path} to={child.path} onClick={() => setOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link to={link.path} onClick={() => setOpen(false)} className="block py-3 text-sm text-gray-300 hover:text-white">
                  {link.label}
                </Link>
              )}
            </div>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <a href="tel:+918714773304" className="flex items-center justify-center gap-2 py-2 text-sm text-gray-300">
              <Phone className="h-4 w-4" /> +91 8714773304
            </a>
            <Link to="/apply" onClick={() => setOpen(false)}>
              <Button className="w-full gradient-primary border-0 text-white">Apply Now</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
