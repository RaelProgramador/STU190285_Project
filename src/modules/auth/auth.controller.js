const authService = require('./auth.service');
const { validateRegister, validateLogin } = require('./auth.validator');
const AppError = require('../../utils/AppError');

async function register(req, res) {
  const result = await authService.register(validateRegister(req.body));
  res.status(201).json(result);
}

async function login(req, res) {
  const result = await authService.login(validateLogin(req.body));
  res.json(result);
}

async function me(req, res) {
  res.json({ user: authService.toPublicUser(req.user) });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword) throw AppError.badRequest('Current password is required.');
  if (!newPassword)     throw AppError.badRequest('New password is required.');
  const result = await authService.changePassword({
    userId: req.user.id,
    currentPassword,
    newPassword,
  });
  res.json(result);
}

async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) throw AppError.badRequest('Email address is required.');
  const result = await authService.forgotPassword({ email: String(email).trim().toLowerCase() });
  res.json(result);
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body || {};
  const result = await authService.resetPassword({ token, newPassword });
  res.json(result);
}

module.exports = { register, login, me, changePassword, forgotPassword, resetPassword };
