import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "TEST";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "TEST";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          language: 'en' | 'ru' | 'uz';
          current_level: 'beginner' | 'intermediate' | 'advanced';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          language?: 'en' | 'ru' | 'uz';
          current_level?: 'beginner' | 'intermediate' | 'advanced';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          language?: 'en' | 'ru' | 'uz';
          current_level?: 'beginner' | 'intermediate' | 'advanced';
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title_en: string;
          title_ru: string;
          title_uz: string;
          description_en: string;
          description_ru: string;
          description_uz: string;
          module_type: 'reading' | 'writing' | 'listening' | 'speaking';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          order_index: number;
          created_at: string;
          updated_at: string;
        };
      };
      lessons: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
      };
      tests: {
        Row: {
          id: string;
          title_en: string;
          title_ru: string;
          title_uz: string;
          description_en: string;
          description_ru: string;
          description_uz: string;
          test_type: 'reading' | 'writing' | 'listening' | 'speaking';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration_minutes: number;
          created_at: string;
          updated_at: string;
        };
      };
      test_questions: {
        Row: {
          id: string;
          test_id: string;
          question_en: string;
          question_ru: string;
          question_uz: string;
          question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'speaking';
          options: any;
          correct_answer: string | null;
          points: number;
          order_index: number;
          created_at: string;
        };
      };
      test_results: {
        Row: {
          id: string;
          user_id: string;
          test_id: string;
          answers: any;
          score: number;
          band_score: number;
          status: 'completed' | 'grading' | 'graded';
          admin_feedback: string | null;
          completed_at: string;
          created_at: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      support_messages: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          name: string;
          subject: string;
          message: string;
          status: 'new' | 'in_progress' | 'resolved';
          created_at: string;
        };
      };
    };
  };
};
