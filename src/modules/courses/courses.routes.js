const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { optionalAuth } = require('../../middlewares/authenticate');
const controller = require('./courses.controller');

const router = Router();

router.get('/', optionalAuth, asyncHandler(controller.list));
router.get('/:slug', optionalAuth, asyncHandler(controller.getBySlug));

module.exports = router;
