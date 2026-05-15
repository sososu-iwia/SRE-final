-- Quiz Management System
-- PostgreSQL schema for the final DBMS group project.
-- Run with: psql -U postgres -d dbms2 -f database/01_schema.sql

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'admin'))
);

CREATE TABLE IF NOT EXISTS quiz (
  quiz_id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  pass_score NUMERIC(5,2) NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT quiz_status_check CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  CONSTRAINT quiz_score_check CHECK (max_score > 0 AND pass_score >= 0 AND pass_score <= max_score)
);

CREATE TABLE IF NOT EXISTS question (
  question_id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  question_type VARCHAR(30) NOT NULL DEFAULT 'single_choice',
  points NUMERIC(5,2) NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT question_type_check CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
  CONSTRAINT question_points_check CHECK (points > 0),
  CONSTRAINT question_position_unique UNIQUE (quiz_id, position)
);

CREATE TABLE IF NOT EXISTS answer (
  answer_id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  explanation TEXT
);

CREATE TABLE IF NOT EXISTS result (
  result_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  CONSTRAINT result_score_check CHECK (score >= 0 AND score <= 100),
  CONSTRAINT result_status_check CHECK (status IN ('submitted', 'reviewed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS quiz_category (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(90) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) NOT NULL DEFAULT '#16725d',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_category_map (
  quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES quiz_category(category_id) ON DELETE CASCADE,
  PRIMARY KEY (quiz_id, category_id)
);

CREATE TABLE IF NOT EXISTS quiz_enrollment (
  enrollment_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'assigned',
  CONSTRAINT quiz_enrollment_unique UNIQUE (user_id, quiz_id),
  CONSTRAINT quiz_enrollment_status_check CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS result_answer (
  result_answer_id SERIAL PRIMARY KEY,
  result_id INTEGER NOT NULL REFERENCES result(result_id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
  answer_id INTEGER REFERENCES answer(answer_id) ON DELETE SET NULL,
  written_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  points_awarded NUMERIC(5,2) NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT result_answer_points_check CHECK (points_awarded >= 0)
);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id BIGSERIAL PRIMARY KEY,
  operation_type VARCHAR(20) NOT NULL,
  table_name VARCHAR(80) NOT NULL,
  record_id TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by TEXT NOT NULL DEFAULT CURRENT_USER,
  old_data JSONB,
  new_data JSONB
);

ALTER TABLE audit_log ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS max_score NUMERIC(5,2) NOT NULL DEFAULT 100;
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS pass_score NUMERIC(5,2) NOT NULL DEFAULT 60;
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE question ADD COLUMN IF NOT EXISTS question_type VARCHAR(30) NOT NULL DEFAULT 'single_choice';
ALTER TABLE question ADD COLUMN IF NOT EXISTS points NUMERIC(5,2) NOT NULL DEFAULT 1;
ALTER TABLE question ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 1;
ALTER TABLE answer ADD COLUMN IF NOT EXISTS explanation TEXT;

ALTER TABLE result DROP CONSTRAINT IF EXISTS result_status_check;
ALTER TABLE result ADD CONSTRAINT result_status_check CHECK (status IN ('submitted', 'reviewed', 'cancelled'));

WITH ranked_questions AS (
  SELECT
    question_id,
    ROW_NUMBER() OVER (PARTITION BY quiz_id ORDER BY position, question_id) AS new_position
  FROM question
)
UPDATE question q
SET position = ranked_questions.new_position
FROM ranked_questions
WHERE ranked_questions.question_id = q.question_id;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
CREATE INDEX IF NOT EXISTS idx_quiz_status ON quiz(status);
CREATE INDEX IF NOT EXISTS idx_quiz_created_by ON quiz(created_by);
CREATE INDEX IF NOT EXISTS idx_question_quiz_id ON question(quiz_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_quiz_position_unique ON question(quiz_id, position);
CREATE INDEX IF NOT EXISTS idx_answer_question_id ON answer(question_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_answer_question_text_unique ON answer(question_id, text);
CREATE INDEX IF NOT EXISTS idx_result_user_id ON result(user_id);
CREATE INDEX IF NOT EXISTS idx_result_quiz_id ON result(quiz_id);
CREATE INDEX IF NOT EXISTS idx_result_submitted_at ON result(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_category_map_category_id ON quiz_category_map(category_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_category_name_unique ON quiz_category(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_enrollment_user_quiz_unique ON quiz_enrollment(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_enrollment_user_id ON quiz_enrollment(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_enrollment_quiz_id ON quiz_enrollment(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_enrollment_status ON quiz_enrollment(status);
CREATE INDEX IF NOT EXISTS idx_result_answer_result_id ON result_answer(result_id);
CREATE INDEX IF NOT EXISTS idx_result_answer_question_id ON result_answer(question_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quiz_set_updated_at ON quiz;
CREATE TRIGGER trg_quiz_set_updated_at
BEFORE UPDATE ON quiz
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION write_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  row_data JSONB;
  target_id TEXT;
BEGIN
  row_data := COALESCE(to_jsonb(NEW), to_jsonb(OLD));
  target_id := COALESCE(
    row_data ->> 'user_id',
    row_data ->> 'quiz_id',
    row_data ->> 'question_id',
    row_data ->> 'answer_id',
    row_data ->> 'result_id',
    row_data ->> 'category_id',
    row_data ->> 'enrollment_id',
    row_data ->> 'result_answer_id'
  );

  INSERT INTO audit_log(operation_type, table_name, record_id, old_data, new_data)
  VALUES (TG_OP, TG_TABLE_NAME, target_id, to_jsonb(OLD), to_jsonb(NEW));

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_audit ON users;
CREATE TRIGGER trg_users_audit
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP TRIGGER IF EXISTS trg_quiz_audit ON quiz;
CREATE TRIGGER trg_quiz_audit
AFTER INSERT OR UPDATE OR DELETE ON quiz
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP TRIGGER IF EXISTS trg_question_audit ON question;
CREATE TRIGGER trg_question_audit
AFTER INSERT OR UPDATE OR DELETE ON question
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP TRIGGER IF EXISTS trg_answer_audit ON answer;
CREATE TRIGGER trg_answer_audit
AFTER INSERT OR UPDATE OR DELETE ON answer
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP TRIGGER IF EXISTS trg_result_audit ON result;
CREATE TRIGGER trg_result_audit
AFTER INSERT OR UPDATE OR DELETE ON result
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP TRIGGER IF EXISTS trg_quiz_category_audit ON quiz_category;
CREATE TRIGGER trg_quiz_category_audit
AFTER INSERT OR UPDATE OR DELETE ON quiz_category
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP TRIGGER IF EXISTS trg_quiz_enrollment_audit ON quiz_enrollment;
CREATE TRIGGER trg_quiz_enrollment_audit
AFTER INSERT OR UPDATE OR DELETE ON quiz_enrollment
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP TRIGGER IF EXISTS trg_result_answer_audit ON result_answer;
CREATE TRIGGER trg_result_answer_audit
AFTER INSERT OR UPDATE OR DELETE ON result_answer
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

DROP VIEW IF EXISTS quiz_learning_overview;
DROP VIEW IF EXISTS quiz_dashboard_view;
DROP VIEW IF EXISTS student_result_summary;

CREATE OR REPLACE VIEW student_result_summary AS
SELECT
  r.result_id,
  u.user_id,
  u.name AS student_name,
  u.email,
  q.quiz_id,
  q.title AS quiz_title,
  r.score,
  q.pass_score,
  r.submitted_at,
  r.status,
  CASE
    WHEN r.status = 'cancelled' THEN 'cancelled'
    WHEN r.score >= q.pass_score THEN 'passed'
    ELSE 'failed'
  END AS performance_level
FROM result r
JOIN users u ON u.user_id = r.user_id
JOIN quiz q ON q.quiz_id = r.quiz_id;

CREATE OR REPLACE VIEW quiz_dashboard_view AS
SELECT
  q.quiz_id,
  q.title,
  q.status,
  COUNT(DISTINCT qu.question_id) AS question_count,
  COUNT(DISTINCT r.result_id) AS attempt_count,
  ROUND(AVG(r.score), 2) AS average_score,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE r.score >= q.pass_score) / NULLIF(COUNT(r.result_id), 0),
    2
  ) AS pass_rate
FROM quiz q
LEFT JOIN question qu ON qu.quiz_id = q.quiz_id
LEFT JOIN result r ON r.quiz_id = q.quiz_id AND r.status <> 'cancelled'
GROUP BY q.quiz_id, q.title, q.status;

CREATE OR REPLACE VIEW quiz_learning_overview AS
SELECT
  q.quiz_id,
  q.title AS quiz_title,
  STRING_AGG(DISTINCT qc.name, ', ' ORDER BY qc.name) AS categories,
  COUNT(DISTINCT qe.enrollment_id) AS assigned_students,
  COUNT(DISTINCT qe.enrollment_id) FILTER (WHERE qe.status = 'completed') AS completed_students,
  COUNT(DISTINCT ra.result_answer_id) AS saved_answers
FROM quiz q
LEFT JOIN quiz_category_map qcm ON qcm.quiz_id = q.quiz_id
LEFT JOIN quiz_category qc ON qc.category_id = qcm.category_id
LEFT JOIN quiz_enrollment qe ON qe.quiz_id = q.quiz_id
LEFT JOIN result r ON r.quiz_id = q.quiz_id
LEFT JOIN result_answer ra ON ra.result_id = r.result_id
GROUP BY q.quiz_id, q.title;

DROP MATERIALIZED VIEW IF EXISTS quiz_monthly_analytics;
CREATE MATERIALIZED VIEW quiz_monthly_analytics AS
SELECT
  DATE_TRUNC('month', r.submitted_at)::DATE AS month,
  q.quiz_id,
  q.title AS quiz_title,
  COUNT(*) AS attempts,
  ROUND(AVG(r.score), 2) AS average_score,
  ROUND(100.0 * COUNT(*) FILTER (WHERE r.score >= q.pass_score) / COUNT(*), 2) AS pass_rate
FROM result r
JOIN quiz q ON q.quiz_id = r.quiz_id
WHERE r.status <> 'cancelled'
GROUP BY DATE_TRUNC('month', r.submitted_at)::DATE, q.quiz_id, q.title
ORDER BY month DESC, attempts DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_monthly_analytics_unique
ON quiz_monthly_analytics(month, quiz_id);

COMMIT;
