/** SQLite CURRENT_TIMESTAMP is UTC "YYYY-MM-DD HH:MM:SS"; convert it to ISO-8601. */
function sqliteToIso(value) {
  if (!value) return null;
  return value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
}

function toSqlite(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Returns the UTC start of the given period, or null for 'all_time'. Weeks start on Monday. */
function startOfPeriod(period, now = new Date()) {
  const today = startOfUtcDay(now);
  switch (period) {
    case 'daily':
      return today;
    case 'weekly': {
      const daysSinceMonday = (today.getUTCDay() + 6) % 7;
      return new Date(today.getTime() - daysSinceMonday * 86400000);
    }
    case 'monthly':
      return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    default:
      return null;
  }
}

function utcDayKey(date) {
  return date.toISOString().slice(0, 10);
}

module.exports = { sqliteToIso, toSqlite, startOfUtcDay, startOfPeriod, utcDayKey };
