import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Test {
  id: string;
  title_en: string;
  title_ru: string;
  title_uz: string;
  test_type: string;
  duration_minutes: number;
}

interface Question {
  id: string;
  question_en: string;
  question_ru: string;
  question_uz: string;
  question_type: string;
  options: any;
  correct_answer: string | null;
  points: number;
  order_index: number;
}

const TestTaking = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestData();
  }, [id]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchTestData = async () => {
    if (!id) return;

    try {
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (testError) throw testError;
      setTest(testData);
      setTimeRemaining(testData.duration_minutes * 60);

      const { data: questionsData, error: questionsError } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', id)
        .order('order_index');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      if (question.correct_answer && answers[question.id] === question.correct_answer) {
        earnedPoints += question.points;
      }
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const bandScore = Math.min(9, Math.max(0, (percentage / 100) * 9));

    return { score: percentage, bandScore };
  };

  const submitTest = async () => {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    const { score, bandScore } = calculateScore();

    try {
      const { error } = await supabase.from('test_results').insert({
        user_id: user.id,
        test_id: id,
        answers,
        score,
        band_score: bandScore,
        status: test?.test_type === 'writing' || test?.test_type === 'speaking' ? 'grading' : 'completed',
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const getTitle = (test: Test) => {
    switch (i18n.language) {
      case 'ru': return test.title_ru;
      case 'uz': return test.title_uz;
      default: return test.title_en;
    }
  };

  const getQuestion = (question: Question) => {
    switch (i18n.language) {
      case 'ru': return question.question_ru;
      case 'uz': return question.question_uz;
      default: return question.question_en;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t('common.noResults')}</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{getTitle(test)}</h1>
            <div className="flex items-center text-red-600">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {t('tests.question')} {currentQuestionIndex + 1} {t('tests.of')} {questions.length}
            </span>
            <div className="flex space-x-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    answers[questions[index].id] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{getQuestion(currentQuestion)}</h2>

          {currentQuestion.question_type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.options?.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                    answers[currentQuestion.id] === option
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.question_type === 'true_false' && (
            <div className="space-y-3">
              {['True', 'False'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                    answers[currentQuestion.id] === option
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {(currentQuestion.question_type === 'fill_blank' ||
            currentQuestion.question_type === 'essay' ||
            currentQuestion.question_type === 'speaking') && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              rows={currentQuestion.question_type === 'essay' ? 10 : 3}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder={t('common.submit')}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            {t('tests.previous')}
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={submitTest}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t('tests.submitTest')}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('tests.next')}
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestTaking;
