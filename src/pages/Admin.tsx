import { useTranslation } from 'react-i18next';
import { Users, BookOpen, FileText, MessageCircle } from 'lucide-react';

const Admin = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: <BookOpen className="h-12 w-12" />,
      title: t('admin.courses'),
      description: 'Manage courses and lessons',
      color: 'bg-blue-500',
    },
    {
      icon: <FileText className="h-12 w-12" />,
      title: t('admin.tests'),
      description: 'Manage tests and questions',
      color: 'bg-green-500',
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: t('admin.users'),
      description: 'View and manage users',
      color: 'bg-yellow-500',
    },
    {
      icon: <MessageCircle className="h-12 w-12" />,
      title: t('admin.support'),
      description: 'Review support messages',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('admin.title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
            >
              <div className={`${section.color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {section.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 text-sm">{section.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('admin.dashboard')}</h2>
          <p className="text-gray-600">
            Admin panel functionality is available. Use the sections above to manage different aspects of the platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
