CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  profile_image TEXT,
  education TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  constraints TEXT,
  examples JSONB NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
  topic TEXT NOT NULL,
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['python','javascript','java','cpp'],
  starter_code JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  problem_id UUID NOT NULL REFERENCES problems(id),
  language TEXT NOT NULL,
  source_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS execution_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  stdout TEXT,
  stderr TEXT,
  compilation_error TEXT,
  passed_tests INT NOT NULL DEFAULT 0,
  failed_tests INT NOT NULL DEFAULT 0,
  execution_time_ms INT,
  memory_usage_kb INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  problem_id UUID REFERENCES problems(id),
  interaction_type TEXT NOT NULL,
  request_payload JSONB NOT NULL DEFAULT '{}',
  response_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  problem_id UUID REFERENCES problems(id),
  original_code TEXT NOT NULL,
  review JSONB NOT NULL,
  confidence NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  problem_id UUID REFERENCES problems(id),
  original_code TEXT NOT NULL,
  suggestion JSONB NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accept','modify','reject')),
  modified_code TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mistake_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  frequency INT NOT NULL DEFAULT 0,
  trend TEXT,
  examples JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

CREATE TABLE IF NOT EXISTS learning_transfer_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_problem_id UUID REFERENCES problems(id),
  concept TEXT NOT NULL,
  generated_problem JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_transfer_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_problem_id UUID NOT NULL REFERENCES learning_transfer_problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source_code TEXT,
  result TEXT,
  score NUMERIC,
  ai_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  prerequisite_ids UUID[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_node_id UUID NOT NULL REFERENCES skill_nodes(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Not Started',
  evidence JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_node_id)
);

CREATE TABLE IF NOT EXISTS learning_debt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  concept TEXT NOT NULL,
  evidence TEXT NOT NULL,
  severity TEXT NOT NULL,
  recent_performance NUMERIC,
  recommendation TEXT NOT NULL,
  progress NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curriculum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  prerequisite_ids UUID[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS curriculum_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_id UUID NOT NULL REFERENCES curriculum_topics(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Not Started',
  evidence JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS code_ownership_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  submission_id UUID NOT NULL REFERENCES submissions(id),
  ownership_score NUMERIC,
  understanding_score NUMERIC,
  concept_clarity NUMERIC,
  modification_ability NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS code_ownership_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES code_ownership_sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  evaluation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  ai_allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  expected_answer TEXT,
  problem_id UUID REFERENCES problems(id)
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  score NUMERIC,
  attempted_questions INT NOT NULL DEFAULT 0,
  ai_usage_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  visibility BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY,
  appearance TEXT NOT NULL DEFAULT 'system',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_enabled BOOLEAN NOT NULL DEFAULT true,
  leaderboard_visibility BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON ai_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_events_user ON progress_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_submission ON execution_results(submission_id);

INSERT INTO skill_nodes(name) VALUES
('Programming Fundamentals'),('Arrays'),('Data Structures'),('Algorithms'),
('Problem Solving'),('Debugging'),('Complexity'),('Recursion'),('Searching'),
('Sorting'),('Graphs'),('Dynamic Programming'),('Databases'),('Operating Systems'),
('Networking') ON CONFLICT DO NOTHING;

INSERT INTO curriculum_topics(name) SELECT name FROM skill_nodes ON CONFLICT DO NOTHING;

INSERT INTO problems(title,slug,description,constraints,examples,difficulty,topic,starter_code)
VALUES
('Two Sum','two-sum','Given an array of integers and a target, return the indices of two numbers that add up to target.',
 '2 <= n <= 10^4',
 '[{"input":"[2,7,11,15], target=9","output":"[0,1]"}]',
 'Easy','Arrays',
 '{"python":"def two_sum(nums, target):\\n    # return indices\\n    pass","javascript":"function twoSum(nums, target) {\\n  // return indices\\n}","java":"class Solution { public int[] twoSum(int[] nums, int target) { return new int[0]; }}","cpp":"#include <vector>\\nusing namespace std;\\nvector<int> twoSum(vector<int> nums, int target) { return {}; }"}'
),
('Binary Search','binary-search','Given a sorted array and a target, return the index of target or -1 if absent.',
 'Array is sorted in ascending order.',
 '[{"input":"[1,3,5,7], target=5","output":"2"}]',
 'Easy','Searching',
 '{"python":"def binary_search(nums, target):\\n    pass","javascript":"function binarySearch(nums, target) {\\n}","java":"class Solution { public int binarySearch(int[] nums, int target) { return -1; }}","cpp":"#include <vector>\\nusing namespace std;\\nint binarySearch(vector<int> nums, int target) { return -1; }"}'
)
ON CONFLICT (slug) DO NOTHING;
