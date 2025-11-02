import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Headphones, Mic, PenTool, TrendingUp, Target, Globe, Award } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();

  const modules = [
    {
      icon: <BookOpen className="h-12 w-12" />,
      title: t('home.modules.reading'),
      color: 'bg-blue-500',
    },
    {
      icon: <PenTool className="h-12 w-12" />,
      title: t('home.modules.writing'),
      color: 'bg-green-500',
    },
    {
      icon: <Headphones className="h-12 w-12" />,
      title: t('home.modules.listening'),
      color: 'bg-yellow-500',
    },
    {
      icon: <Mic className="h-12 w-12" />,
      title: t('home.modules.speaking'),
      color: 'bg-red-500',
    },
  ];

  const features = [
    {
      icon: <Target className="h-10 w-10" />,
      title: t('home.features.interactive'),
      description: t('home.features.interactiveDesc'),
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: t('home.features.practice'),
      description: t('home.features.practiceDesc'),
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: t('home.features.progress'),
      description: t('home.features.progressDesc'),
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: t('home.features.multilingual'),
      description: t('home.features.multilingualDesc'),
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl mb-8 text-red-100 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('home.hero.cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('home.modules.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {modules.map((module, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
              >
                <div className={`${module.color} text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {module.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{module.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('home.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-red-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            {t('app.tagline')}
          </h2>
          <Link
            to="/register"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {t('home.hero.cta')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
