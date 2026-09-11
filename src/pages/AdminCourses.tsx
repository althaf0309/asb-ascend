import AdminCatalogue, { type AdminCatalogueConfig } from '@/components/admin/AdminCatalogue';

const config: AdminCatalogueConfig = {
  apiPath: 'courses',
  title: 'Courses',
  singular: 'Course',
  publicPrefix: '/course',
  defaultCategory: 'erp',
  categories: [
    { id: 'erp', label: 'ERP Modules' },
    { id: 'programming', label: 'Programming Languages' },
    { id: 'ai', label: 'AI Trainings' },
    { id: 'management', label: 'Management Courses' },
    { id: 'internship', label: 'Internship Programs' },
  ],
};

const AdminCourses = () => <AdminCatalogue config={config} />;

export default AdminCourses;
