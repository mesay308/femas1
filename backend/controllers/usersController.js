const db = require('../config/db');
const bcrypt = require('bcrypt');
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// List all users
exports.getUsers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.user_id, u.full_name, u.email, u.last_login, u.is_active, u.created_at, r.name as role_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Get single user
exports.getUser = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.user_id, u.full_name, u.email, u.role_id, u.is_active 
            FROM users u 
            WHERE u.user_id = $1
        `, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// Create user
exports.createUser = async (req, res) => {
    try {
        const { full_name, email, password, role_id, is_active } = req.body;
        
        // Check if email exists
        const check = await db.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        await db.query(
            'INSERT INTO users (full_name, email, password_hash, role_id, is_active) VALUES ($1, $2, $3, $4, $5)',
            [full_name, email, hash, role_id, is_active ?? true]
        );
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { full_name, email, password, role_id, is_active } = req.body;
        const userId = req.params.id;

        // Check email uniqueness
        const check = await db.query('SELECT user_id FROM users WHERE email = $1 AND user_id != $2', [email, userId]);
        if (check.rows.length > 0) return res.status(400).json({ error: 'Email already in use by another user' });

        if (password && password.trim() !== '') {
            const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
            await db.query(
                'UPDATE users SET full_name = $1, email = $2, password_hash = $3, role_id = $4, is_active = $5, updated_at = NOW() WHERE user_id = $6',
                [full_name, email, hash, role_id, is_active ?? true, userId]
            );
        } else {
            await db.query(
                'UPDATE users SET full_name = $1, email = $2, role_id = $3, is_active = $4, updated_at = NOW() WHERE user_id = $5',
                [full_name, email, role_id, is_active ?? true, userId]
            );
        }
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Prevent deleting oneself
        if (req.user.user_id === userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
