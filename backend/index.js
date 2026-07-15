const path = require('path');
// Load env FIRST — before any route/controller imports that read process.env or init the DB pool
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

const db = require('./config/db');

// Route imports (after dotenv + db pool)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const attributeRoutes = require('./routes/attributes');
const cmsRoutes = require('./routes/cms');
const profileRoutes = require('./routes/profile');
const mediaRoutes = require('./routes/media');
const clientRoutes = require('./routes/clients');
const blogRoutes = require('./routes/blogs');
const rolesRoutes = require('./routes/roles');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

const morgan = require('morgan');
app.use(morgan('dev'));

app.use(cors());
app.use(express.json());

// Security: HTTP headers
app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
})); // CSP disabled for flexibility

// Health Check — includes actual DB session name from MySQL (not only env)
app.get(['/api/health', '/health'], async (req, res) => {
    const envDb = db.envString('DB_NAME') || '';
    let connected_database = null;
    let db_ping_error = null;
    try {
        const { rows } = await db.query('SELECT DATABASE() AS current_db');
        connected_database = rows[0]?.current_db ?? null;
    } catch (err) {
        db_ping_error = err.message;
    }
    res.json({
        status: 'ok',
        deployed_at: '2026-03-29T11:40:00Z',
        env: process.env.NODE_ENV || 'development',
        db_config: {
            host: db.envString('DB_HOST') ? 'Present' : 'MISSING',
            user: db.envString('DB_USER') ? 'Present' : 'MISSING',
            database_name_from_env: envDb || null,
            pass: db.envString('DB_PASSWORD', 'DB_PASS') ? 'Present' : 'MISSING',
            connected_database,
            env_matches_connection: envDb && connected_database ? envDb === connected_database : null,
            db_ping_error
        }
    });
});

// === Authentication Routes ===
app.use(['/api/auth', '/auth'], authRoutes);

// Main Routes (public read, protected write via individual route files)
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/brands', '/brands'], brandRoutes);
app.use(['/api/attributes', '/attributes'], attributeRoutes);
app.use(['/api/content', '/api/cms', '/content', '/cms'], cmsRoutes);

app.use(['/api/profile', '/api/settings', '/profile', '/settings'], profileRoutes);
app.use(['/api/media', '/media'], mediaRoutes);
app.use(['/api/clients', '/clients'], clientRoutes);
app.use(['/api/blogs', '/blogs'], blogRoutes);
app.use(['/api/roles', '/roles'], rolesRoutes);
app.use(['/api/users', '/users'], usersRoutes);


// Smart Static Uploads — checks multiple directories in order
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const rootPublicImagesDir = path.join(__dirname, '..', 'public', 'images');
const rootPublicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
        console.warn(`[Server] Warning: Could not create uploads directory at ${uploadsDir}. This is expected on read-only environments like Vercel.`, err.message);
    }
}

app.use(['/api/uploads', '/uploads'], (req, res, next) => {
    const filename = req.path.replace('/api/uploads', '').replace('/uploads', '');
    
    // Check Vercel temporary storage first
    const tmpPath = path.join('/tmp/uploads', filename);
    if (fs.existsSync(tmpPath)) return res.sendFile(tmpPath);
    
    const exactPath = path.join(uploadsDir, filename);
    if (fs.existsSync(exactPath)) return res.sendFile(exactPath);

    // Fallback: check local backend/uploads/ folder as well
    const fallbackPath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(fallbackPath)) return res.sendFile(fallbackPath);

    next();
});

// Serve /images from root public/images if requested via API
app.use(['/api/images', '/images'], (req, res, next) => {
    const filename = req.path.replace('/api/images', '').replace('/images', '');
    const exactPath = path.join(rootPublicImagesDir, filename);
    if (fs.existsSync(exactPath)) return res.sendFile(exactPath);
    next();
});

// Fallback for any image request to serve placeholder
app.use(['/api/uploads', '/api/images', '/uploads', '/images'], (req, res, next) => {
    const placeholderPath = path.join(rootPublicDir, 'images', 'placeholder.svg');
    if (fs.existsSync(placeholderPath)) {
        return res.sendFile(placeholderPath);
    }
    next();
});

app.get('/', (req, res) => {
    res.send('API Running');
});

// For Vercel Serverless Functions, we export the app
module.exports = app;

// For Local Dev and Vercel Services, we need to listen on the port
const isVercelFunction = process.env.VERCEL && !process.env.PORT;
if (!isVercelFunction) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
