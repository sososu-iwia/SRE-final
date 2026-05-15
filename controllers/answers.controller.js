const pool = require('../db/pool');

exports.getAllAnswers = async (req, res) => {
  try {
    const result = await pool.query('SELECT answer_id AS id, * FROM answer ORDER BY answer_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAnswerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT answer_id AS id, * FROM answer WHERE answer_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createAnswer = async (req, res) => {
  try {
    const { question_id, text, answer_text, is_correct } = req.body;
    const result = await pool.query(
      'INSERT INTO answer (question_id, text, is_correct) VALUES ($1, $2, $3) RETURNING answer_id AS id, *',
      [question_id, text || answer_text, is_correct || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_id, text, answer_text, is_correct } = req.body;
    const result = await pool.query(
      'UPDATE answer SET question_id = $1, text = $2, is_correct = $3 WHERE answer_id = $4 RETURNING answer_id AS id, *',
      [question_id, text || answer_text, is_correct || false, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM answer WHERE answer_id = $1 RETURNING answer_id AS id, *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    res.json({ message: 'Answer deleted', answer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
