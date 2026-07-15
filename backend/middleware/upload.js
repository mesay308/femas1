const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
        const uploadsRoot = isVercel 
            ? '/tmp/uploads' 
            : path.join(__dirname, '..', '..', 'public', 'uploads');
            
        if (!fs.existsSync(uploadsRoot)) {
            try {
                fs.mkdirSync(uploadsRoot, { recursive: true });
            } catch (err) {
                console.warn(`[Upload Middleware] Warning: Could not create directory at ${uploadsRoot}.`, err.message);
            }
        }
        cb(null, uploadsRoot);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    // Modify as needed, currently accepting all files or filter by mimetype
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only images and PDFs are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
