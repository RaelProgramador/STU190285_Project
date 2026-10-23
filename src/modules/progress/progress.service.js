const { STATUS, buildPath, summarize, findNextLesson } = require('../learning-path/learningPath.service');
const { startOfUtcDay, utcDayKey } = require('../../utils/dates');

const DAY_MS = 86400000;

/** Consecutive days with at least one completed lesson, counting back from today (or yesterday). */
function computeStreak(completedDates) {
  const days = new Set(completedDates.map((d) => utcDayKey(new Date(d))));
  let cursor = startOfUtcDay(new Date());
  if (!days.has(utcDayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);

  let streak = 0;
  while (days.has(utcDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

function lastSevenDaysActivity(completed) {
  const today = startOfUtcDay(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today.getTime() - (6 - i) * DAY_MS);
    const key = utcDayKey(day);
    const lessons = completed.filter((l) => utcDayKey(new Date(l.completedAt)) === key);
    return { date: key, lessons: lessons.length, minutes: lessons.reduce((s, l) => s + l.durationMin, 0) };
  });
}

function groupByCourse(path) {
  const courses = new Map();
  for (const lesson of path) {
    if (!courses.has(lesson.courseId)) {
      courses.set(lesson.courseId, { id: lesson.courseId, slug: lesson.courseSlug, title: lesson.courseTitle, lessons: [] });
    }
    courses.get(lesson.courseId).lessons.push(lesson);
  }
  return [...courses.values()].map(({ lessons, ...course }) => ({ ...course, ...summarize(lessons) }));
}

async function getSummary(user) {
  const path = await buildPath(user);
  const completed = path
    .filter((l) => l.status === STATUS.COMPLETED)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const next = findNextLesson(path);
  const courses = groupByCourse(path);
  const currentCourse = next ? courses.find((c) => c.id === next.courseId) : courses[courses.length - 1];

  return {
    overall: summarize(path),
    minutesPracticed: completed.reduce((sum, l) => sum + l.durationMin, 0),
    streakDays: computeStreak(completed.map((l) => l.completedAt)),
    currentCourse,
    nextLesson: next
      ? { id: next.id, title: next.title, summary: next.summary, moduleTitle: next.moduleTitle, courseTitle: next.courseTitle, durationMin: next.durationMin }
      : null,
    courses,
    weeklyActivity: lastSevenDaysActivity(completed),
    recent: completed.slice(0, 5).map((l) => ({ id: l.id, title: l.title, courseTitle: l.courseTitle, completedAt: l.completedAt })),
  };
}

module.exports = { getSummary };
