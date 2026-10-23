const { assertValid, isEmail } = require('../../utils/validation');

const MIN_PASSWORD = 8;

function validateRegister(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = {};

  if (name.length < 2 || name.length > 80) errors.name = 'Name must be between 2 and 80 characters.';
  if (!isEmail(email)) errors.email = 'Please enter a valid email address.';
  if (password.length < MIN_PASSWORD) errors.password = `Password must be at least ${MIN_PASSWORD} characters.`;
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Password must contain letters and numbers.';

  assertValid(errors);
  return { name, email, password };
}

function validateLogin(body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = {};

  if (!isEmail(email)) errors.email = 'Please enter a valid email address.';
  if (!password) errors.password = 'Please enter your password.';

  assertValid(errors);
  return { email, password };
}

module.exports = { validateRegister, validateLogin };
