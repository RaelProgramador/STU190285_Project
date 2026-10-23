const db = require('../../config/database');
const { sqliteToIso } = require('../../utils/dates');

/**
 * Lesson statuses:
 *  - completed: the user finished it
 *  - available: unlocked and ready to study (previous lesson completed, or admin)
 *  - locked:    previous lesson not finished yet, or visitor is not logged in
 */
const STATUS = Object.freeze({ COMPLETED: 'completed', AVAILABLE: 'available', LOCKED: 'locked' });

function percent(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

async function getOrderedLessons() {
  return db.all(`
    SELECT l.id, l.title, l.summary, l.duration_min AS durationMin, l.order_index AS orderIndex,
           (l.video_id IS NOT NULL) AS hasVideo,
           m.id AS moduleId, m.title AS moduleTitle, m.order_index AS moduleOrder,
           c.id AS courseId, c.slug AS courseSlug, c.title AS courseTitle, c.order_index AS courseOrder
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN courses c ON c.id = m.course_id
    ORDER BY c.order_index, m.order_index, l.order_index
  `);
}

async function getCompletionMap(userId) {
  const rows = await db.all('SELECT lesson_id, completed_at FROM user_progress WHERE user_id = ?', [userId]);
  return new Map(rows.map((r) => [r.lesson_id, sqliteToIso(r.completed_at)]));
}

/**
 * Builds the full, ordered learning path with a status per lesson.
 * The whole curriculum is one sequence: a lesson unlocks only when the one before it is completed.
 */
async function buildPath(user) {
  const [lessons, completions] = await Promise.all([
    getOrderedLessons(),
    user ? getCompletionMap(user.id) : new Map(),
  ]);
  const unrestricted = user?.role === 'admin';

  let previousCompleted = true;
  return lessons.map((lesson, index) => {
    const completedAt = completions.get(lesson.id) || null;
    let status;
    if (completedAt) status = STATUS.COMPLETED;
    else if (user && (unrestricted || previousCompleted)) status = STATUS.AVAILABLE;
    else status = STATUS.LOCKED;

    previousCompleted = Boolean(completedAt);
    return { ...lesson, hasVideo: Boolean(lesson.hasVideo), position: index + 1, status, completedAt };
  });
}

function summarize(lessons) {
  const completed = lessons.filter((l) => l.status === STATUS.COMPLETED).length;
  return { total: lessons.length, completed, percent: percent(completed, lessons.length) };
}

function findNextLesson(path) {
  return path.find((l) => l.status === STATUS.AVAILABLE) || null;
}

module.exports = { STATUS, buildPath, summarize, findNextLesson, percent };
