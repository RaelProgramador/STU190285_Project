const { PORT } = require('./config/env');
const db = require('./config/database');
const { createSchema } = require('./database/schema');
const { seedDatabase } = require('./database/seed');
const app = require('./app');

async function start() {
  await createSchema(db);

  const { count } = await db.get('SELECT COUNT(*) AS count FROM courses');
  if (count === 0) {
    console.log('[server] Empty database detected — loading the curriculum and demo accounts...');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`[server] FireGuitar running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
