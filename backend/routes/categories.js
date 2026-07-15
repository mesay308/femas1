const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/by-id/:id', categoryController.getCategoryById);
router.get('/', categoryController.getCategories);
router.post('/', upload.single('cover_image'), categoryController.createCategory);
router.put('/:id', upload.single('cover_image'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
