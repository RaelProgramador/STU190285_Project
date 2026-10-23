const AppError = require('../utils/AppError');

/** Must run after `authenticate`. Usage: authorize('admin') */
module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(AppError.unauthorized());
  if (!allowedRoles.includes(req.user.role)) return next(AppError.forbidden());
  next();
};
