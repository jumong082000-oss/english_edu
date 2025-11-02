import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Course {
  id: string;
  title_en: string;
  title_ru: string;
  title_uz: string;
  description_en: string;
  description_ru: string;
  description_uz: string;
  module_type: string;
  difficulty: string;
  lesson_count?: number;
}

const Courses = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, lessons(count)')
        .order('order_index');

      if (error) throw error;

      const coursesWithCount = data?.map(course => ({
        ...course,
        lesson_count: course.lessons?.[0]?.count || 0
      })) || [];

      setCourses(coursesWithCount);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (course: Course) => {
    switch (i18n.language) {
      case 'ru': return course.title_ru;
      case 'uz': return course.title_uz;
      default: return course.title_en;
    }
  };

  const getDescription = (course: Course) => {
    switch (i18n.language) {
      case 'ru': return course.description_ru;
      case 'uz': return course.description_uz;
      default: return course.description_en;
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filterModule !== 'all' && course.module_type !== filterModule) return false;
    if (filterLevel !== 'all' && course.difficulty !== filterLevel) return false;
    return true;
  });

  const moduleColors: { [key: string]: string } = {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('courses.title')}</h1>

        <div className="mb-8 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('courses.filterByModule')}
            </label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-600"
            >
              <option value="all">{t('courses.allCourses')}</option>
              <option value="reading">{t('home.modules.reading')}</option>
              <option value="writing">{t('home.modules.writing')}</option>
              <option value="listening">{t('home.modules.listening')}</option>
              <option value="speaking">{t('home.modules.speaking')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('courses.filterByLevel')}
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-600"
            >
              <option value="all">{t('courses.allCourses')}</option>
              <option value="beginner">{t('courses.beginner')}</option>
              <option value="intermediate">{t('courses.intermediate')}</option>
              <option value="advanced">{t('courses.advanced')}</option>
            </select>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className={`${moduleColors[course.module_type]} h-32 flex items-center justify-center`}>
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{getTitle(course)}</h3>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded capitalize">
                      {course.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{getDescription(course)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {course.lesson_count} {t('courses.lessons')}
                    </span>
                    <span className="text-red-600 font-medium">{t('courses.viewCourse')}</span>
                  </div>
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

export default Courses;
