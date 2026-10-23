const adminService = require('./admin.service');
const AppError = require('../../utils/AppError');
const { parseId, extractYoutubeId } = require('../../utils/validation');

async function stats(req, res) {
  res.json({ stats: await adminService.getStats() });
}

async function users(req, res) {
  res.json({ users: await adminService.listUsers() });
}

async function updateRole(req, res) {
  const user = await adminService.updateUserRole(req.user, parseId(req.params.id, 'user id'), req.body?.role);
  res.json({ user });
}

async function lessons(req, res) {
  res.json({ lessons: await adminService.listLessons() });
}

async function modules(req, res) {
  res.json({ modules: await adminService.listModules() });
}

async function createLesson(req, res) {
  const { moduleId, title, summary, content, practice, tabContent, durationMin, videoUrl } = req.body || {};
  if (!moduleId) throw AppError.badRequest('moduleId is required.');
  if (!title || !String(title).trim()) throw AppError.badRequest('Title is required.');

  let videoId = null;
  if (videoUrl) {
    const { extractYoutubeId } = require('../../utils/validation');
    videoId = extractYoutubeId(videoUrl);
    if (!videoId) throw AppError.badRequest('Please provide a valid YouTube URL or video id.');
  }

  const lesson = await adminService.createLesson({
    moduleId: parseId(moduleId, 'module id'),
    title, summary, content, practice, tabContent, durationMin, videoId,
  });
  res.status(201).json({ lesson });
}

async function updateLesson(req, res) {
  const lesson = await adminService.updateLesson(
    parseId(req.params.id, 'lesson id'),
    req.body || {}
  );
  res.json({ lesson });
}

async function deleteLesson(req, res) {
  const result = await adminService.deleteLesson(parseId(req.params.id, 'lesson id'));
  res.json(result);
}

async function updateLessonVideo(req, res) {
  const raw = req.body?.video;
  let videoId = null;
  if (raw) {
    videoId = extractYoutubeId(raw);
    if (!videoId) throw AppError.badRequest('Please provide a valid YouTube URL or video id.');
  }
  const lesson = await adminService.updateLessonVideo(parseId(req.params.id, 'lesson id'), videoId);
  res.json({ lesson });
}

module.exports = { stats, users, updateRole, lessons, modules, createLesson, updateLesson, deleteLesson, updateLessonVideo };
