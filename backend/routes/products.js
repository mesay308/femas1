const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// Conditional multer middleware - only process multipart requests
const optionalUpload = (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return upload.fields([
            { name: 'cover_image', maxCount: 1 },
            { name: 'gallery_images', maxCount: 30 },
            { name: 'guide_images', maxCount: 20 },
            { name: 'document_files', maxCount: 5 },
            { name: 'models_pdf', maxCount: 1 }
        ])(req, res, err => {
            if (err) {
                console.error("Upload error:", err);
                return res.status(400).json({ error: 'File upload error', details: err.message });
            }
            next();
        });
    }
    next();
};

// Routes
// Public GET routes (could also require auth based on needs, but typically public for e-commerce)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected Admin Routes
router.use(requireAuth);

router.post('/', checkPermission('manage_product', 'edit'), optionalUpload, productController.createProduct);
router.put('/:id', checkPermission('manage_product', 'edit'), optionalUpload, productController.updateProduct);
router.delete('/:id', checkPermission('manage_product', 'edit'), productController.deleteProduct);

module.exports = router;
