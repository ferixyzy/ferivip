const db = require('../lib/db');
const { checkPassword, signToken, codeOk, send, validEmail } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { success: false, message: 'Method not allowed' });
  try {
    const { email, password, code } = req.body || {};
    if (!validEmail(email) || typeof password !== 'string')
      return send(res, 400, { success: false, message: 'Email atau password salah' });
    if (!codeOk(code)) return send(res, 403, { success: false, message: 'Kode rahasia salah' });

    const mail = email.toLowerCase().trim();
    const user = await db.hget('users', mail);
    if (!user || !checkPassword(password, user.password))
      return send(res, 401, { success: false, message: 'Email atau password salah' });

    return send(res, 200, { success: true, token: signToken(mail), email: mail });
  } catch (e) {
    return send(res, 500, { success: false, message: 'Server error: ' + e.message });
  }
};
