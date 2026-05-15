const pool = require('../db/pool');

exports.getAuditLog = async (req, res) => {
  try {
    const result = await pool.query('SELECT audit_id AS id, * FROM audit_log ORDER BY changed_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLogPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      'SELECT audit_id AS id, * FROM audit_log ORDER BY changed_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    const countResult = await pool.query('SELECT COUNT(*) FROM audit_log');
    const total = parseInt(countResult.rows[0].count, 10);
    
    res.json({
      data: result.rows,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
