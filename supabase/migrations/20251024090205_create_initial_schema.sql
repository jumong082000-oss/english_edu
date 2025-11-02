/*
  # IELTS Edu Platform - Initial Database Schema

  ## Overview
  This migration creates the complete database schema for the IELTS Edu platform,
  including user management, courses, lessons, tests, and progress tracking.

  ## New Tables

  ### 1. users
  Stores user profile information and preferences
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique) - User email
  - `name` (text) - User's full name
  - `language` (text) - Preferred language (uz/ru/en)
  - `current_level` (text) - Current IELTS level
  - `created_at` (timestamptz) - Account creation date
  - `updated_at` (timestamptz) - Last profile update

  ### 2. courses
  Stores IELTS course information (Reading, Writing, Listening, Speaking)
  - `id` (uuid, primary key)
  - `title_en`, `title_ru`, `title_uz` (text) - Course titles in three languages
  - `description_en`, `description_ru`, `description_uz` (text) - Descriptions
  - `module_type` (text) - IELTS module: reading/writing/listening/speaking
  - `difficulty` (text) - beginner/intermediate/advanced
  - `order_index` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz)

  ### 3. lessons
  Individual lessons within courses
  - `id` (uuid, primary key)
  - `course_id` (uuid, foreign key) - Reference to courses table
  - `title_en`, `title_ru`, `title_uz` (text) - Lesson titles
  - `content_en`, `content_ru`, `content_uz` (text) - Lesson content
  - `audio_url` (text) - URL for audio files
  - `video_url` (text) - URL for video files
  - `order_index` (integer) - Order within course
  - `created_at`, `updated_at` (timestamptz)

  ### 4. tests
  Practice tests for IELTS preparation
  - `id` (uuid, primary key)
  - `title_en`, `title_ru`, `title_uz` (text) - Test titles
  - `description_en`, `description_ru`, `description_uz` (text) - Test descriptions
  - `test_type` (text) - reading/listening/writing/speaking
  - `difficulty` (text) - beginner/intermediate/advanced
  - `duration_minutes` (integer) - Test duration
  - `created_at`, `updated_at` (timestamptz)

  ### 5. test_questions
  Questions within each test
  - `id` (uuid, primary key)
  - `test_id` (uuid, foreign key) - Reference to tests table
  - `question_en`, `question_ru`, `question_uz` (text) - Question text
  - `question_type` (text) - multiple_choice/true_false/fill_blank/essay/speaking
  - `options` (jsonb) - Answer options for multiple choice
  - `correct_answer` (text) - Correct answer for auto-graded questions
  - `points` (integer) - Points for this question
  - `order_index` (integer) - Question order
  - `created_at` (timestamptz)

  ### 6. test_results
  User test submissions and scores
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Reference to users table
  - `test_id` (uuid, foreign key) - Reference to tests table
  - `answers` (jsonb) - User's answers
  - `score` (decimal) - Raw score
  - `band_score` (decimal) - IELTS band score (0-9)
  - `status` (text) - completed/grading/graded
  - `admin_feedback` (text) - Manual feedback for writing/speaking
  - `completed_at` (timestamptz) - Test completion time
  - `created_at` (timestamptz)

  ### 7. user_progress
  Tracks user progress through courses and lessons
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Reference to users table
  - `lesson_id` (uuid, foreign key) - Reference to lessons table
  - `completed` (boolean) - Whether lesson is completed
  - `completed_at` (timestamptz) - Completion time
  - `created_at`, `updated_at` (timestamptz)

  ### 8. support_messages
  User support and contact form submissions
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key, nullable) - Reference to users table
  - `email` (text) - Contact email
  - `name` (text) - User's name
  - `subject` (text) - Message subject
  - `message` (text) - Message content
  - `status` (text) - new/in_progress/resolved
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Admin role required for content management
  - Public read access for courses, lessons, and tests
  - Authenticated users can submit tests and track progress
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  language text DEFAULT 'en' CHECK (language IN ('en', 'ru', 'uz')),
  current_level text DEFAULT 'beginner' CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ru text NOT NULL,
  title_uz text NOT NULL,
  description_en text DEFAULT '',
  description_ru text DEFAULT '',
  description_uz text DEFAULT '',
  module_type text NOT NULL CHECK (module_type IN ('reading', 'writing', 'listening', 'speaking')),
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_ru text NOT NULL,
  title_uz text NOT NULL,
  content_en text DEFAULT '',
  content_ru text DEFAULT '',
  content_uz text DEFAULT '',
  audio_url text,
  video_url text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ru text NOT NULL,
  title_uz text NOT NULL,
  description_en text DEFAULT '',
  description_ru text DEFAULT '',
  description_uz text DEFAULT '',
  test_type text NOT NULL CHECK (test_type IN ('reading', 'writing', 'listening', 'speaking')),
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tests"
  ON tests FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create test_questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_en text NOT NULL,
  question_ru text NOT NULL,
  question_uz text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay', 'speaking')),
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer text,
  points integer DEFAULT 1,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view test questions"
  ON test_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage test questions"
  ON test_questions FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '{}'::jsonb,
  score decimal(5,2) DEFAULT 0,
  band_score decimal(3,1) DEFAULT 0,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'grading', 'graded')),
  admin_feedback text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test results"
  ON test_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results"
  ON test_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all test results"
  ON test_results FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update test results"
  ON test_results FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own support messages"
  ON support_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create support messages"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all support messages"
  ON support_messages FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update support messages"
  ON support_messages FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_courses_module_type ON courses(module_type);
CREATE INDEX IF NOT EXISTS idx_tests_test_type ON tests(test_type);