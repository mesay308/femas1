/**
 * Authentication Controller
 * ==========================
 * Handles user login (bcrypt + JWT), token verification, and password changes.
 * Uses the project's db.query() wrapper which returns { rows, rowCount }.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

function parseRolePermissions(raw) {
    if (raw == null || raw === '') return {};
    if (typeof raw === 'object' && !Buffer.isBuffer(raw)) return raw;
    const s = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
    try {
        return JSON.parse(s);
    } catch {
        return {};
    }
}

/** Safe JSON clone for JWT payload (drops undefined / non-serializable values). */
function jwtSafeObject(obj) {
    try {
        return JSON.parse(JSON.stringify(obj == null ? {} : obj));
    } catch {
        return {};
    }
}

/**
 * POST /api/auth/login
 * Validate email + password against the users table.
 * Returns a JWT token on success.
 */
const login = async (req, res) => {
    try {
        const { email: rawEmail, password } = req.body;

        // Trim only — compare case in SQL so locale-sensitive JS .toLowerCase() cannot break emails (e.g. Turkish "I").
        const emailTrim = typeof rawEmail === 'string' ? rawEmail.trim() : '';
        if (!emailTrim || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Case-insensitive match; treat NULL is_active as active (legacy rows).
        const result = await db.query(
            `
            SELECT u.*, r.name as role_name, r.permissions, r.is_system_admin 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.role_id 
            WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
              AND (u.is_active IS NULL OR u.is_active = TRUE OR u.is_active = 1)
        `,
            [emailTrim]
        );

        if (!result.rows || result.rows.length === 0) {
            const inactive = await db.query(
                `SELECT user_id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) AND NOT (is_active IS NULL OR is_active = TRUE OR is_active = 1)`,
                [emailTrim]
            );
            if (inactive.rows?.length) {
                return res.status(403).json({ error: 'This account is disabled. Ask a super admin to re-enable it.' });
            }
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        const hash = user.password_hash != null ? String(user.password_hash).trim() : '';
        if (!hash || !hash.startsWith('$2')) {
            console.error('[auth] User has no valid bcrypt hash:', user.user_id);
            return res.status(500).json({
                error: 'Account password is not set correctly. Run the admin seed script to reset it.',
            });
        }

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(String(password), hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Update last_login timestamp
        await db.query('UPDATE users SET last_login = NOW() WHERE user_id = $1', [user.user_id]);

        const permissions = jwtSafeObject(parseRolePermissions(user.permissions));

        // Generate JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name,
                full_name: user.full_name,
                is_system_admin: Boolean(user.is_system_admin),
                permissions
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                role_id: user.role_id,
                role_name: user.role_name,
                is_system_admin: user.is_system_admin,
                permissions
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        const hint =
            err && (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'PROTOCOL_CONNECTION_LOST')
                ? ' Database connection failed — check DB_HOST / DB_NAME in backend/.env.'
                : '';
        res.status(500).json({ error: `Internal server error during login.${hint}` });
    }
};

/**
 * GET /api/auth/me
 * Return current authenticated user info from the JWT token.
 * Requires requireAuth middleware.
 */
const me = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.user_id, u.full_name, u.email, u.role_id, u.last_login, u.created_at, 
                    r.name as role_name, r.permissions, r.is_system_admin 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.role_id 
             WHERE u.user_id = $1`,
            [req.user.user_id]
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Failed to retrieve user info.' });
    }
};

/**
 * POST /api/auth/change-password
 * Change the authenticated user's password.
 * Requires requireAuth middleware.
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }

        // Get current user's hash
        const result = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [req.user.user_id]);
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        // Hash and update
        const newHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2', [newHash, req.user.user_id]);

        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Failed to change password.' });
    }
};

module.exports = { login, me, changePassword };
