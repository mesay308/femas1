/**
 * Authentication Routes
 * =====================
 * POST /api/auth/login          — Login with email + password
 * GET  /api/auth/me             — Get current user info (protected)
 * POST /api/auth/change-password — Change password (protected)
 */
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, me, changePassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

/** Rate limit brute-force only on login — must NOT wrap /me or change-password. */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts from this IP. Please try again in a few minutes.' },
});

router.post('/login', loginLimiter, login);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, changePassword);

module.exports = router;
