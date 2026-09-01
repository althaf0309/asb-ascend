// GENERATED from courses.ts - do not edit by hand.
// Split out so landing pages and the inquiry form can render the category tiles
// without pulling the full 100KB+ catalogue into the entry chunk.
export type CourseCategory = 'erp' | 'programming' | 'ai' | 'management' | 'internship';

export const courseCategories = [
  { id: 'erp', label: 'ERP Modules', icon: 'Database', count: 13, description: 'Enterprise Resource Planning — finance, supply chain, HR, manufacturing and beyond', color: 'from-orange-500 to-amber-500' },
  { id: 'programming', label: 'Programming Languages', icon: 'Code2', count: 12, description: 'Master modern programming languages and full-stack development', color: 'from-green-500 to-emerald-500' },
  { id: 'ai', label: 'AI Trainings', icon: 'Brain', count: 9, description: 'Artificial Intelligence, Machine Learning, Deep Learning & Generative AI', color: 'from-amber-500 to-orange-600' },
  { id: 'management', label: 'Management Courses', icon: 'GraduationCap', count: 7, description: 'Professional diploma programs in logistics, HR, finance & IT management', color: 'from-orange-500 to-amber-500' },
  { id: 'internship', label: 'Internship Programs', icon: 'Briefcase', count: 10, description: 'Industry-ready training programs with guaranteed internship experience', color: 'from-rose-500 to-red-500' },
] as const;
