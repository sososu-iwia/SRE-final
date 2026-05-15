const pool = require('../db/pool');

exports.getAllResults = async (req, res) => {
  try {
    const result = await pool.query('SELECT result_id AS id, * FROM result ORDER BY result_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT result_id AS id, * FROM result WHERE result_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const { user_id, quiz_id, score, submitted_at, status } = req.body;
    const result = await pool.query(
      'INSERT INTO result (user_id, quiz_id, score, submitted_at, status) VALUES ($1, $2, $3, $4, $5) RETURNING result_id AS id, *',
      [user_id, quiz_id, score, submitted_at || new Date(), status || 'submitted']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, quiz_id, score, submitted_at, status } = req.body;
    const result = await pool.query(
      'UPDATE result SET user_id = $1, quiz_id = $2, score = $3, submitted_at = $4, status = $5 WHERE result_id = $6 RETURNING result_id AS id, *',
      [user_id, quiz_id, score, submitted_at || new Date(), status || 'submitted', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteResult = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query('UPDATE result SET status = $1 WHERE result_id = $2', ['cancelled', id]);
    const result = await client.query('DELETE FROM result WHERE result_id = $1 RETURNING result_id AS id, *', [id]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Result not found' });
    }
    await client.query('COMMIT');
    res.json({ message: 'Result deleted', result: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const viewExists = await pool.query(`
      SELECT 1
      FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = 'student_result_summary'
    `);

    const result = viewExists.rowCount
      ? await pool.query(`
          SELECT
            s.result_id AS id,
            s.result_id,
            s.user_id,
            s.student_name AS username,
            s.student_name,
            s.email,
            s.quiz_id,
            s.quiz_title,
            s.score,
            s.submitted_at,
            s.status,
            s.performance_level
          FROM student_result_summary s
          ORDER BY s.submitted_at DESC NULLS LAST
        `)
      : await pool.query(`
          SELECT 
            r.result_id AS id,
            r.result_id,
            r.user_id,
            u.name AS username,
            u.name AS student_name,
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
        `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
