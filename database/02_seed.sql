-- Demo data for screenshots and defense.
-- Run after 01_schema.sql.

BEGIN;

INSERT INTO users (name, email, role) VALUES
  ('Aigerim Sapar', 'aigerim.sapar@example.com', 'teacher'),
  ('Damir Erbolatov', 'damir.erbolatov@example.com', 'admin'),
  ('Miras Kenzhe', 'miras.kenzhe@example.com', 'student'),
  ('Dana Tolegen', 'dana.tolegen@example.com', 'student'),
  ('Arman Ilyas', 'arman.ilyas@example.com', 'student')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

INSERT INTO quiz (title, description, created_by, status, max_score, pass_score)
SELECT 'PostgreSQL Basics', 'DDL, DML, constraints, and SELECT queries.', u.user_id, 'published', 100, 60
FROM users u
WHERE u.email = 'aigerim.sapar@example.com'
  AND NOT EXISTS (SELECT 1 FROM quiz WHERE title = 'PostgreSQL Basics');

INSERT INTO quiz (title, description, created_by, status, max_score, pass_score)
SELECT 'Database Normalization', 'Normal forms, relations, and schema quality.', u.user_id, 'published', 100, 70
FROM users u
WHERE u.email = 'aigerim.sapar@example.com'
  AND NOT EXISTS (SELECT 1 FROM quiz WHERE title = 'Database Normalization');

INSERT INTO question (quiz_id, text, question_type, points, position)
SELECT q.quiz_id, 'Which SQL command is used to create a table?', 'single_choice', 10, 1
FROM quiz q WHERE q.title = 'PostgreSQL Basics'
ON CONFLICT (quiz_id, position) DO NOTHING;

INSERT INTO question (quiz_id, text, question_type, points, position)
SELECT q.quiz_id, 'What does a primary key guarantee?', 'single_choice', 10, 2
FROM quiz q WHERE q.title = 'PostgreSQL Basics'
ON CONFLICT (quiz_id, position) DO NOTHING;

INSERT INTO question (quiz_id, text, question_type, points, position)
SELECT q.quiz_id, 'Which normal form removes partial dependency?', 'single_choice', 10, 1
FROM quiz q WHERE q.title = 'Database Normalization'
ON CONFLICT (quiz_id, position) DO NOTHING;

INSERT INTO answer (question_id, text, is_correct, explanation)
SELECT question_id, 'CREATE TABLE', TRUE, 'DDL command for creating relational tables.'
FROM question WHERE text = 'Which SQL command is used to create a table?'
ON CONFLICT DO NOTHING;

INSERT INTO answer (question_id, text, is_correct)
SELECT question_id, 'INSERT TABLE', FALSE
FROM question WHERE text = 'Which SQL command is used to create a table?'
ON CONFLICT DO NOTHING;

INSERT INTO answer (question_id, text, is_correct)
SELECT question_id, 'Unique and non-null identification of each row', TRUE
FROM question WHERE text = 'What does a primary key guarantee?'
ON CONFLICT DO NOTHING;

INSERT INTO answer (question_id, text, is_correct)
SELECT question_id, 'Faster styling of HTML pages', FALSE
FROM question WHERE text = 'What does a primary key guarantee?'
ON CONFLICT DO NOTHING;

INSERT INTO answer (question_id, text, is_correct)
SELECT question_id, 'Second normal form', TRUE
FROM question WHERE text = 'Which normal form removes partial dependency?'
ON CONFLICT DO NOTHING;

INSERT INTO answer (question_id, text, is_correct)
SELECT question_id, 'First normal form', FALSE
FROM question WHERE text = 'Which normal form removes partial dependency?'
ON CONFLICT DO NOTHING;

INSERT INTO result (user_id, quiz_id, score, submitted_at, status)
SELECT u.user_id, q.quiz_id, 86, CURRENT_TIMESTAMP - INTERVAL '5 days', 'reviewed'
FROM users u CROSS JOIN quiz q
WHERE u.email = 'miras.kenzhe@example.com'
  AND q.title = 'PostgreSQL Basics'
  AND NOT EXISTS (
    SELECT 1 FROM result r WHERE r.user_id = u.user_id AND r.quiz_id = q.quiz_id AND r.score = 86
  );

INSERT INTO result (user_id, quiz_id, score, submitted_at, status)
SELECT u.user_id, q.quiz_id, 58, CURRENT_TIMESTAMP - INTERVAL '3 days', 'reviewed'
FROM users u CROSS JOIN quiz q
WHERE u.email = 'dana.tolegen@example.com'
  AND q.title = 'PostgreSQL Basics'
  AND NOT EXISTS (
    SELECT 1 FROM result r WHERE r.user_id = u.user_id AND r.quiz_id = q.quiz_id AND r.score = 58
  );

INSERT INTO result (user_id, quiz_id, score, submitted_at, status)
SELECT u.user_id, q.quiz_id, 91, CURRENT_TIMESTAMP - INTERVAL '2 days', 'submitted'
FROM users u CROSS JOIN quiz q
WHERE u.email = 'arman.ilyas@example.com'
  AND q.title = 'Database Normalization'
  AND NOT EXISTS (
    SELECT 1 FROM result r WHERE r.user_id = u.user_id AND r.quiz_id = q.quiz_id AND r.score = 91
  );

INSERT INTO quiz_category (name, description, color) VALUES
  ('SQL Foundations', 'Core SQL concepts and PostgreSQL syntax.', '#16725d'),
  ('Database Design', 'Normalization, keys, relations, and schema quality.', '#315f9f'),
  ('Assessment', 'Quizzes used for final DBMS grading.', '#9a640c')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  color = EXCLUDED.color;

INSERT INTO quiz_category_map (quiz_id, category_id)
SELECT q.quiz_id, c.category_id
FROM quiz q
JOIN quiz_category c ON c.name IN ('SQL Foundations', 'Assessment')
WHERE q.title = 'PostgreSQL Basics'
ON CONFLICT DO NOTHING;

INSERT INTO quiz_category_map (quiz_id, category_id)
SELECT q.quiz_id, c.category_id
FROM quiz q
JOIN quiz_category c ON c.name IN ('Database Design', 'Assessment')
WHERE q.title = 'Database Normalization'
ON CONFLICT DO NOTHING;

INSERT INTO quiz_enrollment (user_id, quiz_id, assigned_by, due_at, status)
SELECT student.user_id, q.quiz_id, teacher.user_id, CURRENT_TIMESTAMP + INTERVAL '7 days', 'completed'
FROM users student
JOIN quiz q ON q.title = 'PostgreSQL Basics'
JOIN users teacher ON teacher.email = 'aigerim.sapar@example.com'
WHERE student.email = 'miras.kenzhe@example.com'
ON CONFLICT (user_id, quiz_id) DO UPDATE SET
  assigned_by = EXCLUDED.assigned_by,
  due_at = EXCLUDED.due_at,
  status = EXCLUDED.status;

INSERT INTO quiz_enrollment (user_id, quiz_id, assigned_by, due_at, status)
SELECT student.user_id, q.quiz_id, teacher.user_id, CURRENT_TIMESTAMP + INTERVAL '5 days', 'in_progress'
FROM users student
JOIN quiz q ON q.title = 'Database Normalization'
JOIN users teacher ON teacher.email = 'aigerim.sapar@example.com'
WHERE student.email = 'dana.tolegen@example.com'
ON CONFLICT (user_id, quiz_id) DO UPDATE SET
  assigned_by = EXCLUDED.assigned_by,
  due_at = EXCLUDED.due_at,
  status = EXCLUDED.status;

INSERT INTO quiz_enrollment (user_id, quiz_id, assigned_by, due_at, status)
SELECT student.user_id, q.quiz_id, teacher.user_id, CURRENT_TIMESTAMP + INTERVAL '3 days', 'completed'
FROM users student
JOIN quiz q ON q.title = 'Database Normalization'
JOIN users teacher ON teacher.email = 'aigerim.sapar@example.com'
WHERE student.email = 'arman.ilyas@example.com'
ON CONFLICT (user_id, quiz_id) DO UPDATE SET
  assigned_by = EXCLUDED.assigned_by,
  due_at = EXCLUDED.due_at,
  status = EXCLUDED.status;

INSERT INTO result_answer (result_id, question_id, answer_id, is_correct, points_awarded)
SELECT r.result_id, qu.question_id, a.answer_id, a.is_correct, CASE WHEN a.is_correct THEN qu.points ELSE 0 END
FROM result r
JOIN quiz q ON q.quiz_id = r.quiz_id
JOIN question qu ON qu.quiz_id = q.quiz_id
JOIN answer a ON a.question_id = qu.question_id AND a.is_correct = TRUE
JOIN users u ON u.user_id = r.user_id
WHERE u.email = 'miras.kenzhe@example.com'
  AND q.title = 'PostgreSQL Basics'
  AND NOT EXISTS (
    SELECT 1 FROM result_answer ra WHERE ra.result_id = r.result_id AND ra.question_id = qu.question_id
  );

INSERT INTO result_answer (result_id, question_id, answer_id, is_correct, points_awarded)
SELECT r.result_id, qu.question_id, a.answer_id, a.is_correct, CASE WHEN a.is_correct THEN qu.points ELSE 0 END
FROM result r
JOIN quiz q ON q.quiz_id = r.quiz_id
JOIN question qu ON qu.quiz_id = q.quiz_id
JOIN answer a ON a.question_id = qu.question_id AND a.is_correct = TRUE
JOIN users u ON u.user_id = r.user_id
WHERE u.email = 'arman.ilyas@example.com'
  AND q.title = 'Database Normalization'
  AND NOT EXISTS (
    SELECT 1 FROM result_answer ra WHERE ra.result_id = r.result_id AND ra.question_id = qu.question_id
  );

REFRESH MATERIALIZED VIEW quiz_monthly_analytics;

COMMIT;
