const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const { sqliteToIso } = require('../../utils/dates');
const { percent } = require('../learning-path/learningPath.service');

const ROLES = ['student', 'admin'];

async function getStats() {
  const [users, lessons, completions, goals, withVideo] = await Promise.all([
    db.get("SELECT COUNT(*) AS total, SUM(role = 'admin') AS admins FROM users"),
    db.get('SELECT COUNT(*) AS total FROM lessons'),
    db.get("SELECT COUNT(*) AS total, SUM(completed_at >= datetime('now', '-7 days')) AS lastWeek FROM user_progress"),
    db.get('SELECT COUNT(*) AS total FROM goals'),
    db.get('SELECT COUNT(*) AS total FROM lessons WHERE video_id IS NOT NULL'),
  ]);

  return {
    users: users.total,
    admins: users.admins || 0,
    lessons: lessons.total,
    lessonsWithVideo: withVideo.total,
    completions: completions.total,
    completionsLastWeek: completions.lastWeek || 0,
    goals: goals.total,
  };
}

async function listUsers() {
  const [rows, totalLessons] = await Promise.all([
    db.all(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(up.lesson_id) AS completed, MAX(up.completed_at) AS last_activity
      FROM users u LEFT JOIN user_progress up ON up.user_id = u.id
      GROUP BY u.id ORDER BY u.created_at DESC
    `),
    db.get('SELECT COUNT(*) AS total FROM lessons'),
  ]);

  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: sqliteToIso(u.created_at),
    completed: u.completed,
    percent: percent(u.completed, totalLessons.total),
    lastActivity: sqliteToIso(u.last_activity),
  }));
}

async function updateUserRole(actor, userId, role) {
  if (!ROLES.includes(role)) throw AppError.badRequest(`Role must be one of: ${ROLES.join(', ')}.`);
  if (actor.id === userId) throw AppError.badRequest('You cannot change your own role.');

  const { changes } = await db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
  if (changes === 0) throw AppError.notFound('User not found.');
  return { id: userId, role };
}

async function listLessons() {
  return db.all(`
    SELECT l.id, l.title, l.summary, l.content, l.practice, l.tab_content,
           l.video_id AS videoId, l.duration_min AS durationMin, l.order_index,
           l.module_id AS moduleId, m.title AS moduleTitle,
           c.id AS courseId, c.title AS courseTitle, c.order_index AS stage
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN courses c ON c.id = m.course_id
    ORDER BY c.order_index, m.order_index, l.order_index
  `);
}

async function getLesson(lessonId) {
  const lesson = await db.get(`
    SELECT l.*, m.title AS moduleTitle, c.title AS courseTitle, c.order_index AS stage
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN courses c ON c.id = m.course_id
    WHERE l.id = ?`, [lessonId]);
  if (!lesson) throw AppError.notFound('Lesson not found.');
  return lesson;
}

async function listModules() {
  return db.all(`
    SELECT m.id, m.title, m.order_index, c.id AS courseId, c.title AS courseTitle
    FROM modules m JOIN courses c ON c.id = m.course_id
    ORDER BY c.order_index, m.order_index
  `);
}

async function createLesson({ moduleId, title, summary, content, practice, tabContent, durationMin, videoId }) {
  const mod = await db.get('SELECT id FROM modules WHERE id = ?', [moduleId]);
  if (!mod) throw AppError.notFound('Module not found.');

  const { max } = await db.get('SELECT MAX(order_index) AS max FROM lessons WHERE module_id = ?', [moduleId]);
  const orderIndex = (max || 0) + 1;

  const practiceJson = JSON.stringify(
    Array.isArray(practice) ? practice : (typeof practice === 'string' ? practice.split('\n').map((s) => s.trim()).filter(Boolean) : [])
  );

  const { lastID } = await db.run(
    `INSERT INTO lessons (module_id, title, summary, content, practice, tab_content, video_id, duration_min, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [moduleId, title.trim(), summary || null, content || null, practiceJson, tabContent || null, videoId || null, durationMin || 10, orderIndex]
  );
  return getLesson(lastID);
}

async function updateLesson(lessonId, { title, summary, content, practice, tabContent, durationMin }) {
  const existing = await db.get('SELECT id FROM lessons WHERE id = ?', [lessonId]);
  if (!existing) throw AppError.notFound('Lesson not found.');

  const practiceJson = practice !== undefined
    ? JSON.stringify(Array.isArray(practice) ? practice : (typeof practice === 'string' ? practice.split('\n').map((s) => s.trim()).filter(Boolean) : []))
    : undefined;

  const fields = [];
  const values = [];
  if (title !== undefined)       { fields.push('title = ?');        values.push(title.trim()); }
  if (summary !== undefined)     { fields.push('summary = ?');      values.push(summary || null); }
  if (content !== undefined)     { fields.push('content = ?');      values.push(content || null); }
  if (practiceJson !== undefined){ fields.push('practice = ?');     values.push(practiceJson); }
  if (tabContent !== undefined)  { fields.push('tab_content = ?');  values.push(tabContent || null); }
  if (durationMin !== undefined) { fields.push('duration_min = ?'); values.push(Number(durationMin) || 10); }

  if (fields.length === 0) throw AppError.badRequest('No fields provided to update.');
  values.push(lessonId);

  await db.run(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
  return getLesson(lessonId);
}

async function deleteLesson(lessonId) {
  const { changes } = await db.run('DELETE FROM lessons WHERE id = ?', [lessonId]);
  if (changes === 0) throw AppError.notFound('Lesson not found.');
  return { id: lessonId, deleted: true };
}

async function updateLessonVideo(lessonId, videoId) {
  const { changes } = await db.run('UPDATE lessons SET video_id = ? WHERE id = ?', [videoId, lessonId]);
  if (changes === 0) throw AppError.notFound('Lesson not found.');
  return { id: lessonId, videoId };
}

module.exports = { getStats, listUsers, updateUserRole, listLessons, getLesson, listModules, createLesson, updateLesson, deleteLesson, updateLessonVideo };
