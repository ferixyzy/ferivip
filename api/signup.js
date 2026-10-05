const db = require('../lib/db');
const { hashPassword, signToken, codeOk, send, validEmail } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { success: false, message: 'Method not allowed' });
  try {
    const { email, password, code } = req.body || {};
    if (!validEmail(email)) return send(res, 400, { success: false, message: 'Email tidak valid' });
    if (typeof password !== 'string' || password.length < 6 || password.length > 100)
      return send(res, 400, { success: false, message: 'Password minimal 6 karakter' });
    if (!codeOk(code)) return send(res, 403, { success: false, message: 'Kode rahasia salah' });

    const mail = email.toLowerCase().trim();
    const created = await db.hsetnx('users', mail, {
      email: mail,
      password: hashPassword(password),
      createdAt: Date.now(),
    });
    if (!created) return send(res, 409, { success: false, message: 'Email sudah terdaftar' });

    return send(res, 200, { success: true, token: signToken(mail), email: mail });
  } catch (e) {
    return send(res, 500, { success: false, message: 'Server error: ' + e.message });
  }
};
