import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
}

interface Lesson {
  id: string;
  title_en: string;
  title_ru: string;
  title_uz: string;
  order_index: number;
  completed?: boolean;
}

const CourseDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const fetchCourseData = async () => {
    if (!id) return;

    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) || []);
        const lessonsWithProgress = lessonsData?.map(lesson => ({
          ...lesson,
          completed: completedLessonIds.has(lesson.id)
        })) || [];

        setLessons(lessonsWithProgress);
      } else {
        setLessons(lessonsData || []);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (item: Course | Lesson) => {
    switch (i18n.language) {
      case 'ru': return item.title_ru;
      case 'uz': return item.title_uz;
      default: return item.title_en;
    }
  };

  const getDescription = (course: Course) => {
    switch (i18n.language) {
      case 'ru': return course.description_ru;
      case 'uz': return course.description_uz;
      default: return course.description_en;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t('common.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/courses"
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('lessons.backToCourse')}
        </Link>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{getTitle(course)}</h1>
            <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded capitalize">
              {course.difficulty}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{getDescription(course)}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="capitalize">{course.module_type}</span>
            <span>•</span>
            <span>{lessons.length} {t('courses.lessons')}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{t('lessons.title')}</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {lesson.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {index + 1}. {getTitle(lesson)}
                      </p>
                    </div>
                  </div>
                  <span className="text-red-600 font-medium">{t('common.view')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
