const pool = require('../db/pool');

exports.getAllQuestions = async (req, res) => {
  try {
    const result = await pool.query('SELECT question_id AS id, * FROM question ORDER BY question_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT question_id AS id, * FROM question WHERE question_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { quiz_id, text, question_text } = req.body;
    const result = await pool.query(
      'INSERT INTO question (quiz_id, text) VALUES ($1, $2) RETURNING question_id AS id, *',
      [quiz_id, text || question_text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { quiz_id, text, question_text } = req.body;
    const result = await pool.query(
      'UPDATE question SET quiz_id = $1, text = $2 WHERE question_id = $3 RETURNING question_id AS id, *',
      [quiz_id, text || question_text, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM question WHERE question_id = $1 RETURNING question_id AS id, *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted', question: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
