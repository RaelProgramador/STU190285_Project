const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const { STATUS, buildPath, summarize } = require('../learning-path/learningPath.service');

function mapCourse(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    level: row.level,
    icon: row.icon,
    estimatedWeeks: row.estimated_weeks,
    outcomes: JSON.parse(row.outcomes || '[]'),
    stage: row.order_index,
  };
}

function courseStatus(lessons) {
  if (lessons.length === 0) return STATUS.LOCKED;
  if (lessons.every((l) => l.status === STATUS.COMPLETED)) return STATUS.COMPLETED;
  if (lessons.some((l) => l.status === STATUS.COMPLETED)) return 'in_progress';
  return lessons[0].status === STATUS.AVAILABLE ? STATUS.AVAILABLE : STATUS.LOCKED;
}

async function listCourses(user) {
  const [rows, modules, path] = await Promise.all([
    db.all('SELECT * FROM courses ORDER BY order_index'),
    db.all('SELECT course_id, COUNT(*) AS count FROM modules GROUP BY course_id'),
    buildPath(user),
  ]);
  const moduleCount = new Map(modules.map((m) => [m.course_id, m.count]));

  return rows.map((row) => {
    const lessons = path.filter((l) => l.courseId === row.id);
    return {
      ...mapCourse(row),
      moduleCount: moduleCount.get(row.id) || 0,
      lessonCount: lessons.length,
      durationMin: lessons.reduce((sum, l) => sum + l.durationMin, 0),
      status: courseStatus(lessons),
      progress: summarize(lessons),
    };
  });
}

async function getCourseBySlug(slug, user) {
  const row = await db.get('SELECT * FROM courses WHERE slug = ?', [slug]);
  if (!row) throw AppError.notFound('Course not found.');

  const [modules, path] = await Promise.all([
    db.all('SELECT id, title, description, order_index FROM modules WHERE course_id = ? ORDER BY order_index', [row.id]),
    buildPath(user),
  ]);
  const courseLessons = path.filter((l) => l.courseId === row.id);

  const neighbours = await db.all(
    'SELECT slug, title, order_index FROM courses WHERE order_index IN (?, ?)',
    [row.order_index - 1, row.order_index + 1],
  );

  return {
    ...mapCourse(row),
    status: courseStatus(courseLessons),
    progress: summarize(courseLessons),
    durationMin: courseLessons.reduce((sum, l) => sum + l.durationMin, 0),
    previousCourse: neighbours.find((c) => c.order_index === row.order_index - 1) || null,
    nextCourse: neighbours.find((c) => c.order_index === row.order_index + 1) || null,
    modules: modules.map((m) => {
      const lessons = courseLessons.filter((l) => l.moduleId === m.id);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order_index,
        progress: summarize(lessons),
        lessons: lessons.map((l) => ({
          id: l.id,
          title: l.title,
          summary: l.summary,
          durationMin: l.durationMin,
          hasVideo: l.hasVideo,
          position: l.position,
          status: l.status,
          completedAt: l.completedAt,
        })),
      };
    }),
  };
}

module.exports = { listCourses, getCourseBySlug };
