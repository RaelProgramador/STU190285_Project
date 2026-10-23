const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const db = require('../config/database');
const AppError = require('../utils/AppError');

function extractToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

/**
 * Resolves the user from the token against the database on every request,
 * so role changes and deleted accounts take effect immediately.
 */
async function resolveUser(token) {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw AppError.unauthorized('Your session has expired. Please log in again.');
  }

  const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [payload.sub]);
  if (!user) throw AppError.unauthorized('Account no longer exists.');
  return user;
}

async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw AppError.unauthorized();
    req.user = await resolveUser(token);
    next();
  } catch (err) {
    next(err);
  }
}

/** Attaches req.user when a valid token is present, but never blocks the request. */
async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = await resolveUser(token);
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { authenticate, optionalAuth };
