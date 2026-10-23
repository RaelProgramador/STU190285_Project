const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const progressService = require('./progress.service');

const router = Router();

router.get('/summary', authenticate, asyncHandler(async (req, res) => {
  res.json(await progressService.getSummary(req.user));
}));

module.exports = router;
