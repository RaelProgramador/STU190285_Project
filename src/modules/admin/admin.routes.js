const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const controller = require('./admin.controller');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats',                     asyncHandler(controller.stats));
router.get('/users',                     asyncHandler(controller.users));
router.patch('/users/:id/role',          asyncHandler(controller.updateRole));

router.get('/modules',                   asyncHandler(controller.modules));
router.get('/lessons',                   asyncHandler(controller.lessons));
router.post('/lessons',                  asyncHandler(controller.createLesson));
router.put('/lessons/:id',               asyncHandler(controller.updateLesson));
router.delete('/lessons/:id',            asyncHandler(controller.deleteLesson));
router.patch('/lessons/:id/video',       asyncHandler(controller.updateLessonVideo));

module.exports = router;
