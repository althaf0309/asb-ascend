import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const tabs = [
  { to: '/admin/blog', label: 'Blog posts' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/training', label: 'Training' },
];

/** Shared header for the admin pages: section links plus sign-out. */
const AdminNav = ({ onLogout, children }: { onLogout: () => void; children?: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3 mb-6">
    <nav className="flex flex-wrap gap-2" aria-label="Admin sections">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className="inline-flex self-center">
          {({ isActive }) => (
            <Button
              type="button"
              variant={isActive ? 'default' : 'outline'}
              className={isActive ? 'gradient-primary border-0 text-white' : 'bg-transparent'}
            >
              {tab.label}
            </Button>
          )}
        </NavLink>
      ))}
      {children}
    </nav>

    <Button
      variant="outline"
      className="bg-transparent border-white/20 text-white hover:bg-white/10 ml-auto"
      onClick={onLogout}
    >
      <LogOut className="h-4 w-4 mr-2" aria-hidden /> Sign out
    </Button>
  </div>
);

export default AdminNav;
