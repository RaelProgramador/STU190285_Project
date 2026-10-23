const AppError = require('../utils/AppError');
const { isProduction } = require('../config/env');

function notFound(req, res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found.`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body.' });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  console.error('[error]', err);
  res.status(500).json({
    error: 'Internal server error.',
    ...(isProduction ? {} : { debug: err.message }),
  });
}

module.exports = { notFound, errorHandler };
