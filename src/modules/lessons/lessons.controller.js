const lessonsService = require('./lessons.service');
const { parseId } = require('../../utils/validation');

async function getById(req, res) {
  const lesson = await lessonsService.getLesson(parseId(req.params.id, 'lesson id'), req.user);
  res.json({ lesson });
}

async function complete(req, res) {
  const result = await lessonsService.completeLesson(parseId(req.params.id, 'lesson id'), req.user);
  res.json(result);
}

module.exports = { getById, complete };
