const pool = require('../db/pool');

exports.getAllQuizzes = async (req, res) => {
  try {
    const result = await pool.query('SELECT quiz_id AS id, * FROM quiz ORDER BY quiz_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT quiz_id AS id, * FROM quiz WHERE quiz_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { title, created_by, status, created_at } = req.body;
    const result = await pool.query(
      'INSERT INTO quiz (title, created_by, status, created_at) VALUES ($1, $2, $3, $4) RETURNING quiz_id AS id, *',
      [title, created_by, status || 'draft', created_at || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, created_by, status } = req.body;
    const result = await pool.query(
      'UPDATE quiz SET title = $1, created_by = $2, status = $3 WHERE quiz_id = $4 RETURNING quiz_id AS id, *',
      [title, created_by, status || 'draft', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM quiz WHERE quiz_id = $1 RETURNING quiz_id AS id, *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted', quiz: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getQuizzesFull = async (req, res) => {
  try {
    const quizzesResult = await pool.query('SELECT quiz_id AS id, * FROM quiz ORDER BY quiz_id DESC');
    const quizzes = quizzesResult.rows;

    for (let quiz of quizzes) {
      const questionsResult = await pool.query(
        'SELECT question_id AS id, * FROM question WHERE quiz_id = $1 ORDER BY question_id',
        [quiz.quiz_id]
      );
      quiz.questions = questionsResult.rows;

      for (let question of quiz.questions) {
        const answersResult = await pool.query(
          'SELECT answer_id AS id, * FROM answer WHERE question_id = $1 ORDER BY answer_id',
          [question.question_id]
        );
        question.answers = answersResult.rows;
      }
    }

    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
