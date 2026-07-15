const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const multer = require('multer');
const path = require('path');

// Configure multer for logo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        const uploadsRoot = path.join(__dirname, '..', '..', 'public', 'uploads');
        if (!fs.existsSync(uploadsRoot)) {
            try {
                fs.mkdirSync(uploadsRoot, { recursive: true });
            } catch (err) {}
        }
        cb(null, uploadsRoot);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const logoUpload = upload.fields([
    { name: 'logo_light', maxCount: 1 },
    { name: 'logo_dark', maxCount: 1 }
]);

router.get('/', profileController.getProfile);
router.put('/', logoUpload, profileController.updateProfile);

module.exports = router;
