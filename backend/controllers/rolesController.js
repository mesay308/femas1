const db = require('../config/db');

// List all roles
exports.getRoles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM roles ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching roles:', err);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};

// Get single role
exports.getRole = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM roles WHERE role_id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Role not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching role:', err);
        res.status(500).json({ error: 'Failed to fetch role' });
    }
};

// Create role
exports.createRole = async (req, res) => {
    try {
        const { name, permissions, is_system_admin } = req.body;
        const result = await db.query(
            'INSERT INTO roles (name, permissions, is_system_admin) VALUES ($1, $2, $3)',
            [name, JSON.stringify(permissions || {}), is_system_admin || false]
        );
        // We use the last insert id if possible, but with UUID we might need to fetch the last created
        // Or better yet, we just generate the UUID here or let DB do it and return success
        res.status(201).json({ message: 'Role created successfully' });
    } catch (err) {
        console.error('Error creating role:', err);
        res.status(500).json({ error: 'Failed to create role' });
    }
};

// Update role
exports.updateRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const roleId = req.params.id;

        // Prevent modifying Super Admin permissions if needed, but since it's a super admin doing it, it's ok.
        // Or we can just block modifying is_system_admin
        
        await db.query(
            'UPDATE roles SET name = $1, permissions = $2, updated_at = NOW() WHERE role_id = $3',
            [name, JSON.stringify(permissions || {}), roleId]
        );
        res.json({ message: 'Role updated successfully' });
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ error: 'Failed to update role' });
    }
};

// Delete role
exports.deleteRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        
        // Prevent deleting system admin role
        const check = await db.query('SELECT is_system_admin FROM roles WHERE role_id = $1', [roleId]);
        if (check.rows.length > 0 && check.rows[0].is_system_admin) {
            return res.status(400).json({ error: 'Cannot delete a system admin role' });
        }

        // Check if role is in use
        const users = await db.query('SELECT user_id FROM users WHERE role_id = $1', [roleId]);
        if (users.rows.length > 0) {
            return res.status(400).json({ error: 'Cannot delete role because it is assigned to users' });
        }

        await db.query('DELETE FROM roles WHERE role_id = $1', [roleId]);
        res.json({ message: 'Role deleted successfully' });
    } catch (err) {
        console.error('Error deleting role:', err);
        res.status(500).json({ error: 'Failed to delete role' });
    }
};
