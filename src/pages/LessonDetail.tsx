import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, Play, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Lesson {
  id: string;
  course_id: string;
  title_en: string;
  title_ru: string;
  title_uz: string;
  content_en: string;
  content_ru: string;
  content_uz: string;
  audio_url: string | null;
  video_url: string | null;
  order_index: number;
}

const LessonDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
  }, [id, user]);

  const fetchLessonData = async () => {
    if (!id) return;

    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      if (lessonData) {
        const { data: nextLesson } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', lessonData.course_id)
          .gt('order_index', lessonData.order_index)
          .order('order_index')
          .limit(1)
          .maybeSingle();

        setNextLessonId(nextLesson?.id || null);
      }

      if (user && lessonData) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('lesson_id', id)
          .maybeSingle();

        setCompleted(progressData?.completed || false);
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    if (!user || !id) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: id,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
      setCompleted(true);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const getTitle = (lesson: Lesson) => {
    switch (i18n.language) {
      case 'ru': return lesson.title_ru;
      case 'uz': return lesson.title_uz;
      default: return lesson.title_en;
    }
  };

  const getContent = (lesson: Lesson) => {
    switch (i18n.language) {
      case 'ru': return lesson.content_ru;
      case 'uz': return lesson.content_uz;
      default: return lesson.content_en;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!lesson) {
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
          to={`/courses/${lesson.course_id}`}
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('lessons.backToCourse')}
        </Link>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{getTitle(lesson)}</h1>
            {completed && (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-5 w-5 mr-1" />
                {t('lessons.completed')}
              </span>
            )}
          </div>

          {lesson.video_url && (
            <div className="mb-6 bg-gray-900 rounded-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <Video className="h-16 w-16 text-white mx-auto mb-4" />
                <p className="text-white">{t('lessons.video')}</p>
                <p className="text-gray-400 text-sm mt-2">{lesson.video_url}</p>
              </div>
            </div>
          )}

          {lesson.audio_url && (
            <div className="mb-6 bg-gray-100 rounded-lg p-4 flex items-center">
              <Play className="h-8 w-8 text-red-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">{t('lessons.audio')}</p>
                <p className="text-sm text-gray-600">{lesson.audio_url}</p>
              </div>
            </div>
          )}

          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap">{getContent(lesson)}</div>
          </div>

          {user && !completed && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={markComplete}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
              >
                {t('lessons.markComplete')}
              </button>
            </div>
          )}

          {nextLessonId && (
            <div className="mt-4">
              <button
                onClick={() => navigate(`/lessons/${nextLessonId}`)}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
              >
                {t('lessons.nextLesson')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
