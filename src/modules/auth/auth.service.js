const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../../config/env');
const AppError = require('../../utils/AppError');

const RESET_TOKEN_TTL_MINUTES = 60;

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register({ name, email, password }) {
  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) throw AppError.conflict('An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const { lastID } = await db.run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, 'student'],
  );

  const user = await db.get('SELECT * FROM users WHERE id = ?', [lastID]);
  return { user: toPublicUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  // Same message for unknown email and wrong password to avoid account enumeration.
  const valid = user && (await bcrypt.compare(password, user.password_hash));
  if (!valid) throw AppError.unauthorized('Invalid email or password.');

  return { user: toPublicUser(user), token: signToken(user) };
}

async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) throw AppError.notFound('User not found.');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw AppError.unauthorized('Current password is incorrect.');

  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw AppError.badRequest('New password must be at least 8 characters and contain letters and numbers.');
  }
  if (currentPassword === newPassword) {
    throw AppError.badRequest('New password must be different from your current password.');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
  return { message: 'Password changed successfully.' };
}

async function forgotPassword({ email }) {
  // Always return success to avoid account enumeration
  const user = await db.get('SELECT id, name, email FROM users WHERE email = ?', [email]);
  if (!user) return { message: 'If that email is registered, a reset token has been generated.' };

  // Invalidate any existing unused tokens for this user
  await db.run(
    'DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL',
    [user.id]
  );

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  await db.run(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, token, expiresAt]
  );

  // Since this app has no email service, return the token directly in the response.
  // In a production app this would be sent via email instead.
  return {
    message: 'If that email is registered, a reset token has been generated.',
    resetToken: token,
    expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
  };
}

async function resetPassword({ token, newPassword }) {
  if (!token) throw AppError.badRequest('Reset token is required.');
  if (!newPassword) throw AppError.badRequest('New password is required.');
  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw AppError.badRequest('Password must be at least 8 characters and contain letters and numbers.');
  }

  const row = await db.get(
    `SELECT t.id, t.user_id, t.used_at, t.expires_at
     FROM password_reset_tokens t
     WHERE t.token = ?`,
    [token]
  );

  if (!row) throw AppError.badRequest('Invalid or expired reset token.');
  if (row.used_at) throw AppError.badRequest('This reset token has already been used.');
  if (new Date(row.expires_at) < new Date()) throw AppError.badRequest('This reset token has expired.');

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, row.user_id]);
  await db.run('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [row.id]);

  return { message: 'Password reset successfully. You can now log in with your new password.' };
}

module.exports = { register, login, toPublicUser, changePassword, forgotPassword, resetPassword };
