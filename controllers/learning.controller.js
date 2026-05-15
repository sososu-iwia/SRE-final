const pool = require('../db/pool');

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        qlo.quiz_id,
        qlo.quiz_title,
        qlo.categories,
        qlo.assigned_students,
        qlo.completed_students,
        qlo.saved_answers
      FROM quiz_learning_overview qlo
      ORDER BY qlo.quiz_title
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        qe.enrollment_id AS id,
        qe.enrollment_id,
        qe.user_id,
        student.name AS student_name,
        qe.quiz_id,
        q.title AS quiz_title,
        qe.assigned_by,
        teacher.name AS assigned_by_name,
        qe.assigned_at,
        qe.due_at,
        qe.status
      FROM quiz_enrollment qe
      JOIN users student ON student.user_id = qe.user_id
      JOIN quiz q ON q.quiz_id = qe.quiz_id
      LEFT JOIN users teacher ON teacher.user_id = qe.assigned_by
      ORDER BY qe.assigned_at DESC, qe.enrollment_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getResultAnswers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ra.result_answer_id AS id,
        ra.result_answer_id,
        r.result_id,
        u.name AS student_name,
        q.title AS quiz_title,
        qu.text AS question_text,
        a.text AS answer_text,
        ra.written_answer,
        ra.is_correct,
        ra.points_awarded,
        ra.answered_at
      FROM result_answer ra
      JOIN result r ON r.result_id = ra.result_id
      JOIN users u ON u.user_id = r.user_id
      JOIN quiz q ON q.quiz_id = r.quiz_id
      JOIN question qu ON qu.question_id = ra.question_id
      LEFT JOIN answer a ON a.answer_id = ra.answer_id
      ORDER BY ra.answered_at DESC, ra.result_answer_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
