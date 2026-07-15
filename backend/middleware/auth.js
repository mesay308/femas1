/**
 * JWT Authentication Middleware
 * ===============================
 * Verifies JWT tokens and attaches user data to requests.
 * Used to protect admin-only API routes.
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_default_secret';

/**
 * Middleware: requireAuth
 * Verifies the JWT token from the Authorization header.
 * Attaches decoded user info to req.user on success.
 */
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { user_id, email, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

/**
 * Middleware: requireRole
 * Checks if the authenticated user has one of the specified roles.
 * Must be used AFTER requireAuth.
 *
 * Usage: router.delete('/resource/:id', requireAuth, requireRole('admin'), handler)
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions.' });
        }
        next();
    };
};

module.exports = { requireAuth, requireRole };
