const pool = require('../db/pool');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      usersCount,
      quizzesCount,
      questionsCount,
      answersCount,
      resultsCount,
      enrollmentsCount,
      resultAnswersCount,
      scoreStats,
      roleBreakdown,
      statusBreakdown,
      topQuizzes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM quiz'),
      pool.query('SELECT COUNT(*) FROM question'),
      pool.query('SELECT COUNT(*) FROM answer'),
      pool.query('SELECT COUNT(*) FROM result'),
      pool.query('SELECT COUNT(*) FROM quiz_enrollment'),
      pool.query('SELECT COUNT(*) FROM result_answer'),
      pool.query(`
        SELECT
          ROUND(AVG(score), 2) AS average_score,
          ROUND(100.0 * COUNT(*) FILTER (WHERE score >= 60) / NULLIF(COUNT(*), 0), 2) AS pass_rate
        FROM result
        WHERE status <> 'cancelled'
      `),
      pool.query(`
        SELECT role, COUNT(*)::INTEGER AS total
        FROM users
        GROUP BY role
        ORDER BY total DESC, role
      `),
      pool.query(`
        SELECT status, COUNT(*)::INTEGER AS total
        FROM quiz
        GROUP BY status
        ORDER BY total DESC, status
      `),
      pool.query(`
        SELECT
          q.quiz_id,
          q.title,
          COUNT(r.result_id)::INTEGER AS attempts,
          ROUND(AVG(r.score), 2) AS average_score,
          ROUND(100.0 * COUNT(*) FILTER (WHERE r.score >= 60) / NULLIF(COUNT(r.result_id), 0), 2) AS pass_rate
        FROM quiz q
        LEFT JOIN result r ON r.quiz_id = q.quiz_id AND r.status <> 'cancelled'
        GROUP BY q.quiz_id, q.title
        ORDER BY attempts DESC, average_score DESC NULLS LAST
        LIMIT 5
      `)
    ]);

    const latestResults = await pool.query(`
      SELECT 
        r.result_id AS id,
        r.result_id,
        r.user_id,
        u.name AS username,
        u.email,
        r.quiz_id,
        q.title AS quiz_title,
        r.score,
        r.submitted_at,
        r.status
      FROM result r
      JOIN users u ON r.user_id = u.user_id
      JOIN quiz q ON r.quiz_id = q.quiz_id
      ORDER BY r.submitted_at DESC NULLS LAST
      LIMIT 5
    `);

    const latestAuditLog = await pool.query(
      'SELECT audit_id AS id, * FROM audit_log ORDER BY changed_at DESC LIMIT 5'
    );

    res.json({
      users: parseInt(usersCount.rows[0].count, 10),
      quizzes: parseInt(quizzesCount.rows[0].count, 10),
      questions: parseInt(questionsCount.rows[0].count, 10),
      answers: parseInt(answersCount.rows[0].count, 10),
      results: parseInt(resultsCount.rows[0].count, 10),
      enrollments: parseInt(enrollmentsCount.rows[0].count, 10),
      resultAnswers: parseInt(resultAnswersCount.rows[0].count, 10),
      averageScore: scoreStats.rows[0].average_score || 0,
      passRate: scoreStats.rows[0].pass_rate || 0,
      roleBreakdown: roleBreakdown.rows,
      statusBreakdown: statusBreakdown.rows,
      topQuizzes: topQuizzes.rows,
      latestResults: latestResults.rows,
      latestAuditLog: latestAuditLog.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
