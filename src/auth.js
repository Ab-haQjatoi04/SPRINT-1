const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function login(email, password) {
  const result = await pool.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
  if (!result.rows[0] || !(await bcrypt.compare(password, result.rows[0].password_hash))) return null;
  const user = result.rows[0];
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'authentication_required' });
  try {
    const token = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (token.role !== 'admin') return res.status(403).json({ error: 'administrator_required' });
    req.user = token; next();
  } catch { return res.status(401).json({ error: 'invalid_or_expired_token' }); }
}
module.exports = { login, requireAdmin };
