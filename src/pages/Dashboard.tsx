import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  name: string;
  current_level: string;
}

interface DashboardStats {
  completedLessons: number;
  testsTaken: number;
  averageScore: number;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    completedLessons: 0,
    testsTaken: 0,
    averageScore: 0,
  });
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('users')
        .select('name, current_level')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      const { count: completedCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);

      const { data: testResults, count: testsCount } = await supabase
        .from('test_results')
        .select('*, tests(title_en, title_ru, title_uz, test_type)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      const avgScore = testResults && testResults.length > 0
        ? testResults.reduce((sum, test) => sum + test.band_score, 0) / testResults.length
        : 0;

      setStats({
        completedLessons: completedCount || 0,
        testsTaken: testsCount || 0,
        averageScore: avgScore,
      });

      setRecentTests(testResults || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome')}, {profile?.name || user?.email}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('dashboard.currentLevel')}: <span className="font-semibold capitalize">{profile?.current_level || 'beginner'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('dashboard.completedLessons')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedLessons}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('dashboard.testsTaken')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.testsTaken}</p>
              </div>
              <Award className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('dashboard.averageScore')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '-'}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-red-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('dashboard.recentTests')}
            </h2>
            {recentTests.length > 0 ? (
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {test.tests?.title_en || 'Test'}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(test.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{test.band_score.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">{t('tests.bandScore')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{t('dashboard.noActivity')}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('common.next')}
            </h2>
            <div className="space-y-4">
              <Link
                to="/courses"
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">{t('dashboard.continueLesson')}</p>
                    <p className="text-sm text-gray-600">{t('courses.allCourses')}</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/tests"
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">{t('dashboard.takeTest')}</p>
                    <p className="text-sm text-gray-600">{t('tests.allTests')}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
