const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const controller = require('./auth.controller');

const router = Router();

router.post('/register',         asyncHandler(controller.register));
router.post('/login',            asyncHandler(controller.login));
router.get('/me',                authenticate, asyncHandler(controller.me));
router.post('/change-password',  authenticate, asyncHandler(controller.changePassword));
router.post('/forgot-password',  asyncHandler(controller.forgotPassword));
router.post('/reset-password',   asyncHandler(controller.resetPassword));

module.exports = router;
