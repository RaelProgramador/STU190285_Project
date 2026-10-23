const coursesService = require('./courses.service');

async function list(req, res) {
  res.json({ courses: await coursesService.listCourses(req.user) });
}

async function getBySlug(req, res) {
  res.json({ course: await coursesService.getCourseBySlug(req.params.slug, req.user) });
}

module.exports = { list, getBySlug };
