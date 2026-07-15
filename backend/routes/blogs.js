const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const upload = require('../middleware/upload');

router.get('/', blogController.getBlogs);
router.post('/', upload.single('cover_image'), blogController.createBlog);
router.put('/:id', upload.single('cover_image'), blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
