const sqlite3 = require('sqlite3');
const { DB_PATH } = require('./env');

/**
 * Thin promise-based wrapper around sqlite3 so the rest of the
 * codebase can use async/await instead of nested callbacks.
 */
class Database {
  constructor(filename) {
    this.connection = new sqlite3.Database(filename, (err) => {
      if (err) {
        console.error('[db] Failed to open database:', err.message);
        process.exit(1);
      }
    });
    this.connection.run('PRAGMA foreign_keys = ON');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.run(sql, params, function onRun(err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this.connection.exec(sql, (err) => (err ? reject(err) : resolve()));
    });
  }

  async transaction(work) {
    await this.exec('BEGIN');
    try {
      const result = await work(this);
      await this.exec('COMMIT');
      return result;
    } catch (err) {
      await this.exec('ROLLBACK');
      throw err;
    }
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

module.exports = new Database(DB_PATH);
