const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const { STATUS, buildPath, summarize, findNextLesson } = require('../learning-path/learningPath.service');

function toNavItem(entry) {
  return entry ? { id: entry.id, title: entry.title, status: entry.status } : null;
}

function locateInPath(path, lessonId) {
  const index = path.findIndex((l) => l.id === lessonId);
  if (index === -1) throw AppError.notFound('Lesson not found.');
  return { index, entry: path[index] };
}

function assertUnlocked(entry) {
  if (entry.status === STATUS.LOCKED) {
    throw AppError.forbidden('This lesson is locked. Complete the previous lesson to unlock it.');
  }
}

async function getLesson(lessonId, user) {
  const path = await buildPath(user);
  const { index, entry } = locateInPath(path, lessonId);
  assertUnlocked(entry);

  const lesson = await db.get(
    'SELECT id, title, summary, content, practice, tab_content, video_id, duration_min FROM lessons WHERE id = ?',
    [lessonId],
  );
  const courseLessons = path.filter((l) => l.courseId === entry.courseId);

  return {
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    content: lesson.content,
    practice: JSON.parse(lesson.practice || '[]'),
    tab: lesson.tab_content,
    videoId: lesson.video_id,
    durationMin: lesson.duration_min,
    position: entry.position,
    totalLessons: path.length,
    status: entry.status,
    completedAt: entry.completedAt,
    course: { id: entry.courseId, slug: entry.courseSlug, title: entry.courseTitle, progress: summarize(courseLessons) },
    module: {
      id: entry.moduleId,
      title: entry.moduleTitle,
      lessons: path
        .filter((l) => l.moduleId === entry.moduleId)
        .map((l) => ({ id: l.id, title: l.title, status: l.status, durationMin: l.durationMin })),
    },
    previous: toNavItem(path[index - 1]),
    next: toNavItem(path[index + 1]),
  };
}

async function completeLesson(lessonId, user) {
  const before = await buildPath(user);
  const { entry } = locateInPath(before, lessonId);
  assertUnlocked(entry);

  await db.run('INSERT OR IGNORE INTO user_progress (user_id, lesson_id) VALUES (?, ?)', [user.id, lessonId]);

  const after = await buildPath(user);
  const courseLessons = after.filter((l) => l.courseId === entry.courseId);
  const next = findNextLesson(after);

  return {
    lessonId,
    overall: summarize(after),
    course: summarize(courseLessons),
    courseCompleted: courseLessons.every((l) => l.status === STATUS.COMPLETED),
    pathCompleted: after.every((l) => l.status === STATUS.COMPLETED),
    nextLesson: next ? { id: next.id, title: next.title, courseSlug: next.courseSlug } : null,
  };
}

module.exports = { getLesson, completeLesson };
