const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const { sqliteToIso, toSqlite, startOfPeriod, utcDayKey } = require('../../utils/dates');

async function measure(goal, userId) {
  if (goal.type === 'custom') return goal.completed_at ? 1 : 0;

  const periodStart = startOfPeriod(goal.period);
  const since = periodStart ? toSqlite(periodStart) : goal.created_at;

  if (goal.type === 'lessons') {
    const row = await db.get(
      'SELECT COUNT(*) AS value FROM user_progress WHERE user_id = ? AND completed_at >= ?',
      [userId, since],
    );
    return row.value;
  }

  const row = await db.get(
    `SELECT COALESCE(SUM(l.duration_min), 0) AS value
     FROM user_progress up JOIN lessons l ON l.id = up.lesson_id
     WHERE up.user_id = ? AND up.completed_at >= ?`,
    [userId, since],
  );
  return row.value;
}

async function present(goal, userId) {
  const current = await measure(goal, userId);
  const achieved = current >= goal.target;
  const overdue = !achieved && goal.due_date && goal.due_date < utcDayKey(new Date());

  return {
    id: goal.id,
    title: goal.title,
    type: goal.type,
    target: goal.target,
    period: goal.period,
    dueDate: goal.due_date,
    current: Math.min(current, goal.target),
    percent: Math.min(100, Math.round((current / goal.target) * 100)),
    status: achieved ? 'completed' : overdue ? 'overdue' : 'active',
    createdAt: sqliteToIso(goal.created_at),
  };
}

async function findOwned(goalId, userId) {
  const goal = await db.get('SELECT * FROM goals WHERE id = ? AND user_id = ?', [goalId, userId]);
  if (!goal) throw AppError.notFound('Goal not found.');
  return goal;
}

async function list(userId) {
  const goals = await db.all('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC, id DESC', [userId]);
  return Promise.all(goals.map((g) => present(g, userId)));
}

async function create(userId, data) {
  const { lastID } = await db.run(
    'INSERT INTO goals (user_id, title, type, target, period, due_date) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, data.title, data.type, data.target, data.period, data.dueDate],
  );
  return present(await findOwned(lastID, userId), userId);
}

async function update(goal, userId, changes) {
  const { completed, ...columns } = changes;
  if (completed !== undefined) {
    columns.completed_at = completed ? toSqlite(new Date()) : null;
  }

  const keys = Object.keys(columns);
  if (keys.length > 0) {
    const assignments = keys.map((k) => `${k} = ?`).join(', ');
    await db.run(`UPDATE goals SET ${assignments} WHERE id = ? AND user_id = ?`, [...keys.map((k) => columns[k]), goal.id, userId]);
  }
  return present(await findOwned(goal.id, userId), userId);
}

async function remove(goalId, userId) {
  await findOwned(goalId, userId);
  await db.run('DELETE FROM goals WHERE id = ? AND user_id = ?', [goalId, userId]);
}

module.exports = { list, create, update, remove, findOwned };
