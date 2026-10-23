const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const controller = require('./lessons.controller');

const router = Router();

router.use(authenticate);
router.get('/:id', asyncHandler(controller.getById));
router.post('/:id/complete', asyncHandler(controller.complete));

module.exports = router;
