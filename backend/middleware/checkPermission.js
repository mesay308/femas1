/**
 * Role Permission Middleware
 * ==========================
 * Verifies if the authenticated user has the required permission for a specific section and action.
 * Example usage: checkPermission('manage_product', 'edit')
 */

const checkPermission = (section, action) => {
    return (req, res, next) => {
        // Ensure user is authenticated (should be called after requireAuth)
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Super Admins always have full access
        if (req.user.is_system_admin) {
            return next();
        }

        // Check permissions object
        const permissions = req.user.permissions || {};
        const sectionPerms = permissions[section] || {};

        if (sectionPerms[action] === true) {
            return next();
        }

        return res.status(403).json({ 
            error: 'Access Denied', 
            message: `You do not have permission to ${action} ${section}.` 
        });
    };
};

module.exports = checkPermission;
