import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Test {
  id: string;
  title_en: string;
  title_ru: string;
  title_uz: string;
  description_en: string;
  description_ru: string;
  description_uz: string;
  test_type: string;
  difficulty: string;
  duration_minutes: number;
  question_count?: number;
}

const Tests = () => {
  const { t, i18n } = useTranslation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*, test_questions(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const testsWithCount = data?.map(test => ({
        ...test,
        question_count: test.test_questions?.[0]?.count || 0
      })) || [];

      setTests(testsWithCount);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (test: Test) => {
    switch (i18n.language) {
      case 'ru': return test.title_ru;
      case 'uz': return test.title_uz;
      default: return test.title_en;
    }
  };

  const getDescription = (test: Test) => {
    switch (i18n.language) {
      case 'ru': return test.description_ru;
      case 'uz': return test.description_uz;
      default: return test.description_en;
    }
  };

  const filteredTests = tests.filter(test => {
    if (filterType !== 'all' && test.test_type !== filterType) return false;
    return true;
  });

  const typeColors: { [key: string]: string } = {
    reading: 'bg-blue-500',
    writing: 'bg-green-500',
    listening: 'bg-yellow-500',
    speaking: 'bg-red-500',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('tests.title')}</h1>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('tests.filterByType')}
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-600"
          >
            <option value="all">{t('tests.allTests')}</option>
            <option value="reading">{t('home.modules.reading')}</option>
            <option value="writing">{t('home.modules.writing')}</option>
            <option value="listening">{t('home.modules.listening')}</option>
            <option value="speaking">{t('home.modules.speaking')}</option>
          </select>
        </div>

        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Link
                key={test.id}
                to={`/tests/${test.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className={`${typeColors[test.test_type]} h-32 flex items-center justify-center`}>
                  <FileText className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{getTitle(test)}</h3>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded capitalize">
                      {test.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{getDescription(test)}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {test.duration_minutes} {t('tests.minutes')}
                    </span>
                    <span>{test.question_count} {t('tests.questions')}</span>
                  </div>
                  <button className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                    {t('tests.startTest')}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('common.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;
