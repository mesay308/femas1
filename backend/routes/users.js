const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireAuth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// All user routes require auth and user_role edit permission
router.use(requireAuth);
router.use(checkPermission('user_role', 'edit'));

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUser);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
