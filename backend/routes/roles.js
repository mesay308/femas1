const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { requireAuth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// All role routes require auth and user_role edit permission (or super admin)
router.use(requireAuth);
router.use(checkPermission('user_role', 'edit'));

router.get('/', rolesController.getRoles);
router.get('/:id', rolesController.getRole);
router.post('/', rolesController.createRole);
router.put('/:id', rolesController.updateRole);
router.delete('/:id', rolesController.deleteRole);

module.exports = router;
