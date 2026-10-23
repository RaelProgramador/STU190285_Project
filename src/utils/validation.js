const AppError = require('./AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_URL_REGEX = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/** Throws a 400 with every field error collected, instead of failing on the first one. */
function assertValid(errors) {
  const fields = Object.keys(errors);
  if (fields.length > 0) {
    throw AppError.badRequest(errors[fields[0]], errors);
  }
}

function isEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parseId(value, label = 'id') {
  const id = toPositiveInt(value);
  if (!id) throw AppError.badRequest(`Invalid ${label}.`);
  return id;
}

/** Accepts a YouTube URL or raw 11-char id and returns the id, or null if invalid. */
function extractYoutubeId(input) {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  if (YOUTUBE_ID_REGEX.test(value)) return value;
  const match = value.match(YOUTUBE_URL_REGEX);
  return match ? match[1] : null;
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

module.exports = { assertValid, isEmail, toPositiveInt, parseId, extractYoutubeId, isIsoDate };
