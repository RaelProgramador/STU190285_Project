const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', require('./modules/auth/auth.routes'));
router.use('/courses', require('./modules/courses/courses.routes'));
router.use('/lessons', require('./modules/lessons/lessons.routes'));
router.use('/progress', require('./modules/progress/progress.routes'));
router.use('/goals', require('./modules/goals/goals.routes'));
router.use('/admin', require('./modules/admin/admin.routes'));

module.exports = router;
