const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-change-me';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in production.');
}

if (!process.env.JWT_SECRET) {
  console.warn('[env] JWT_SECRET is not set. Using an insecure development secret.');
}

module.exports = Object.freeze({
  NODE_ENV,
  isProduction,
  PORT: Number(process.env.PORT) || 3000,
  DB_PATH: path.resolve(__dirname, '..', '..', process.env.DB_PATH || 'database.sqlite'),
  JWT_SECRET: process.env.JWT_SECRET || DEV_FALLBACK_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS) || 10,
});
