-- Demonstration queries for report screenshots.
-- Run with: psql -U postgres -d dbms2 -f database/03_demo_queries.sql

-- 1. Full student result summary with calculated pass/fail status.
SELECT *
FROM student_result_summary
ORDER BY submitted_at DESC;

-- 2. Quiz quality dashboard: question count, attempts, average score, pass rate.
SELECT *
FROM quiz_dashboard_view
ORDER BY attempt_count DESC, average_score DESC NULLS LAST;

-- 3. Top students by average score.
SELECT
  u.user_id,
  u.name,
  u.email,
  COUNT(r.result_id) AS attempts,
  ROUND(AVG(r.score), 2) AS average_score
FROM users u
JOIN result r ON r.user_id = u.user_id
WHERE r.status <> 'cancelled'
GROUP BY u.user_id, u.name, u.email
ORDER BY average_score DESC;

-- 4. Question and answer listing for defense explanation.
SELECT
  qz.title AS quiz_title,
  qu.position,
  qu.text AS question_text,
  a.text AS answer_text,
  a.is_correct
FROM quiz qz
JOIN question qu ON qu.quiz_id = qz.quiz_id
JOIN answer a ON a.question_id = qu.question_id
ORDER BY qz.title, qu.position, a.is_correct DESC;

-- 5. Audit trail proving trigger-based logging.
SELECT
  audit_id,
  operation_type,
  table_name,
  record_id,
  changed_by,
  changed_at
FROM audit_log
ORDER BY changed_at DESC
LIMIT 20;

-- 6. Monthly analytics materialized view.
SELECT *
FROM quiz_monthly_analytics
ORDER BY month DESC, attempts DESC;

-- 7. New learning workflow overview: categories, assignments, and saved answers.
SELECT *
FROM quiz_learning_overview
ORDER BY quiz_title;

-- 8. Enrollment list with teacher and student names.
SELECT
  student.name AS student_name,
  q.title AS quiz_title,
  teacher.name AS assigned_by,
  qe.status,
  qe.due_at
FROM quiz_enrollment qe
JOIN users student ON student.user_id = qe.user_id
JOIN quiz q ON q.quiz_id = qe.quiz_id
LEFT JOIN users teacher ON teacher.user_id = qe.assigned_by
ORDER BY qe.assigned_at DESC;

-- 9. Student answers stored per question.
SELECT
  u.name AS student_name,
  q.title AS quiz_title,
  qu.text AS question_text,
  a.text AS selected_answer,
  ra.is_correct,
  ra.points_awarded
FROM result_answer ra
JOIN result r ON r.result_id = ra.result_id
JOIN users u ON u.user_id = r.user_id
JOIN quiz q ON q.quiz_id = r.quiz_id
JOIN question qu ON qu.question_id = ra.question_id
LEFT JOIN answer a ON a.answer_id = ra.answer_id
ORDER BY ra.answered_at DESC;
