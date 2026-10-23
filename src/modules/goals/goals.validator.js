const { assertValid, toPositiveInt, isIsoDate } = require('../../utils/validation');

const TYPES = ['lessons', 'minutes', 'custom'];
const PERIODS = ['daily', 'weekly', 'monthly', 'all_time'];
const MAX_TARGET = 10000;

function validateTitle(title, errors) {
  const value = typeof title === 'string' ? title.trim() : '';
  if (value.length < 3 || value.length > 100) errors.title = 'Title must be between 3 and 100 characters.';
  return value;
}

function validateDueDate(dueDate, errors) {
  if (dueDate === undefined || dueDate === null || dueDate === '') return null;
  if (!isIsoDate(dueDate)) errors.dueDate = 'Due date must be in YYYY-MM-DD format.';
  return dueDate;
}

function validateCreate(body = {}) {
  const errors = {};
  const title = validateTitle(body.title, errors);
  const type = TYPES.includes(body.type) ? body.type : null;
  if (!type) errors.type = `Type must be one of: ${TYPES.join(', ')}.`;

  const isCustom = type === 'custom';
  const target = isCustom ? 1 : toPositiveInt(body.target);
  if (!isCustom && (!target || target > MAX_TARGET)) errors.target = `Target must be a whole number between 1 and ${MAX_TARGET}.`;

  const period = isCustom ? 'all_time' : body.period || 'weekly';
  if (!PERIODS.includes(period)) errors.period = `Period must be one of: ${PERIODS.join(', ')}.`;

  const dueDate = validateDueDate(body.dueDate, errors);

  assertValid(errors);
  return { title, type, target, period, dueDate };
}

function validateUpdate(body = {}, goal) {
  const errors = {};
  const changes = {};

  if (body.title !== undefined) changes.title = validateTitle(body.title, errors);
  if (body.dueDate !== undefined) changes.due_date = validateDueDate(body.dueDate, errors);

  if (goal.type !== 'custom') {
    if (body.target !== undefined) {
      const target = toPositiveInt(body.target);
      if (!target || target > MAX_TARGET) errors.target = `Target must be a whole number between 1 and ${MAX_TARGET}.`;
      changes.target = target;
    }
    if (body.period !== undefined) {
      if (!PERIODS.includes(body.period)) errors.period = `Period must be one of: ${PERIODS.join(', ')}.`;
      changes.period = body.period;
    }
  } else if (body.completed !== undefined) {
    changes.completed = Boolean(body.completed);
  }

  assertValid(errors);
  return changes;
}

module.exports = { validateCreate, validateUpdate };
