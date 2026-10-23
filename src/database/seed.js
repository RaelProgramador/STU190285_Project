/**
 * Resets the database and loads the full curriculum plus demo users.
 * Run with: npm run seed
 */
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { BCRYPT_ROUNDS } = require('../config/env');
const { resetSchema } = require('./schema');
const curriculum = require('./seeds/curriculum');
const demoUsers = require('./seeds/users');
const { toSqlite } = require('../utils/dates');

async function seedCurriculum() {
  const lessonIds = [];

  for (const [courseIndex, course] of curriculum.entries()) {
    const { lastID: courseId } = await db.run(
      `INSERT INTO courses (slug, title, subtitle, description, level, icon, estimated_weeks, outcomes, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [course.slug, course.title, course.subtitle, course.description, course.level, course.icon,
        course.estimatedWeeks, JSON.stringify(course.outcomes), courseIndex + 1],
    );

    for (const [moduleIndex, mod] of course.modules.entries()) {
      const { lastID: moduleId } = await db.run(
        'INSERT INTO modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)',
        [courseId, mod.title, mod.description, moduleIndex + 1],
      );

      for (const [lessonIndex, lesson] of mod.lessons.entries()) {
        const { lastID } = await db.run(
          `INSERT INTO lessons (module_id, title, summary, content, practice, tab_content, video_id, duration_min, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [moduleId, lesson.title, lesson.summary, lesson.content, JSON.stringify(lesson.practice || []),
            lesson.tab || null, lesson.videoId || null, lesson.durationMin, lessonIndex + 1],
        );
        lessonIds.push(lastID);
      }
    }
  }

  return lessonIds;
}

async function seedUsers(orderedLessonIds) {
  const now = Date.now();

  for (const user of demoUsers) {
    const hash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    const { lastID: userId } = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [user.name, user.email, hash, user.role],
    );

    const toComplete = orderedLessonIds.slice(0, user.completedLessons);
    for (const [i, lessonId] of toComplete.entries()) {
      // Spread completions from ~10 days ago up to today so streaks and weekly stats look realistic.
      const daysAgo = Math.max(0, Math.floor(((toComplete.length - 1 - i) * 10) / toComplete.length));
      const completedAt = toSqlite(new Date(now - daysAgo * 86400000 - (i % 3) * 3600000));
      await db.run('INSERT INTO user_progress (user_id, lesson_id, completed_at) VALUES (?, ?, ?)', [userId, lessonId, completedAt]);
    }

    for (const goal of user.goals) {
      await db.run(
        'INSERT INTO goals (user_id, title, type, target, period, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, goal.title, goal.type, goal.target, goal.period, toSqlite(new Date(now - 14 * 86400000))],
      );
    }
  }
}

/** Drops every table and reloads the curriculum and demo users. */
async function seedDatabase() {
  await resetSchema(db);

  await db.transaction(async () => {
    const lessonIds = await seedCurriculum();
    await seedUsers(lessonIds);
    console.log(`[seed] ${curriculum.length} stages, ${lessonIds.length} lessons, ${demoUsers.length} demo users.`);
  });

  console.log('[seed] Demo accounts:');
  demoUsers.forEach((u) => console.log(`        ${u.role.padEnd(7)} ${u.email} / ${u.password}`));
}

if (require.main === module) {
  console.log('[seed] Resetting schema...');
  seedDatabase()
    .then(() => db.close())
    .catch(async (err) => {
      console.error('[seed] Failed:', err);
      await db.close();
      process.exit(1);
    });
}

module.exports = { seedDatabase };
