const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadsRoot)) {
    try {
        fs.mkdirSync(uploadsRoot, { recursive: true });
    } catch (err) {
        console.warn(`[Media Route] Warning: Could not create uploads directory at ${uploadsRoot}. This is expected on read-only environments like Vercel.`, err.message);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsRoot);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const limits = {
    /** Match Next proxy buffer (proxyClientMaxBodySize) ~60mb; rejects oversize cleanly. */
    fileSize: 60 * 1024 * 1024,
};
const upload = multer({
    storage: storage,
    limits,
});

router.get('/', mediaController.listAssets);
router.post('/upload', upload.array('files', 10), mediaController.uploadAssets);
router.delete('/:id', mediaController.deleteAsset);

module.exports = router;
