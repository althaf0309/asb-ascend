import AdminCatalogue, { type AdminCatalogueConfig } from '@/components/admin/AdminCatalogue';

const config: AdminCatalogueConfig = {
  apiPath: 'training',
  title: 'Training',
  singular: 'Programme',
  publicPrefix: '/training',
  defaultCategory: 'corporate',
  categories: [
    { id: 'corporate', label: 'Corporate Training' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'certification', label: 'Certification Tracks' },
    { id: 'bootcamp', label: 'Bootcamps' },
    { id: 'online', label: 'Live Online' },
  ],
};

const AdminTraining = () => <AdminCatalogue config={config} />;

export default AdminTraining;
