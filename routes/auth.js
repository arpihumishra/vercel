const express = require('express');
const { login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiting');
const { loginValidation } = require('../validators/validators');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// @route   POST /api/auth/login
router.post('/login', authLimiter, loginValidation, handleValidationErrors, login);

// @route   GET /api/auth/profile
router.get('/profile', authenticate, getProfile);

module.exports = router;