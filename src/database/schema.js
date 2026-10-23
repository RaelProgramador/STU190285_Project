const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    slug            TEXT    NOT NULL UNIQUE,
    title           TEXT    NOT NULL,
    subtitle        TEXT,
    description     TEXT,
    level           TEXT    NOT NULL,
    icon            TEXT    NOT NULL DEFAULT '🎸',
    estimated_weeks INTEGER NOT NULL DEFAULT 4,
    outcomes        TEXT    NOT NULL DEFAULT '[]',
    order_index     INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modules (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id   INTEGER NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id    INTEGER NOT NULL REFERENCES modules (id) ON DELETE CASCADE,
    title        TEXT    NOT NULL,
    summary      TEXT,
    content      TEXT,
    practice     TEXT    NOT NULL DEFAULT '[]',
    tab_content  TEXT,
    video_id     TEXT,
    duration_min INTEGER NOT NULL DEFAULT 10,
    order_index  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id      INTEGER NOT NULL REFERENCES users (id)   ON DELETE CASCADE,
    lesson_id    INTEGER NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title        TEXT    NOT NULL,
    type         TEXT    NOT NULL CHECK (type IN ('lessons', 'minutes', 'custom')),
    target       INTEGER NOT NULL DEFAULT 1 CHECK (target > 0),
    period       TEXT    NOT NULL DEFAULT 'weekly' CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    due_date     TEXT,
    completed_at DATETIME,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token      TEXT    NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at    DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_modules_course   ON modules (course_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_lessons_module   ON lessons (module_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_progress_user    ON user_progress (user_id, completed_at);
  CREATE INDEX IF NOT EXISTS idx_goals_user       ON goals (user_id);
  CREATE INDEX IF NOT EXISTS idx_reset_tokens     ON password_reset_tokens (token);
`;

const DROP = `
  DROP TABLE IF EXISTS password_reset_tokens;
  DROP TABLE IF EXISTS goals;
  DROP TABLE IF EXISTS user_progress;
  DROP TABLE IF EXISTS enrollments;
  DROP TABLE IF EXISTS lessons;
  DROP TABLE IF EXISTS modules;
  DROP TABLE IF EXISTS courses;
  DROP TABLE IF EXISTS users;
`;

async function createSchema(db) {
  await db.exec(SCHEMA);
}

async function resetSchema(db) {
  await db.exec('PRAGMA foreign_keys = OFF');
  await db.exec(DROP);
  await db.exec('PRAGMA foreign_keys = ON');
  await createSchema(db);
}

module.exports = { createSchema, resetSchema };
