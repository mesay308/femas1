const db = require('../config/db');

// Get all blogs
exports.getBlogs = async (req, res) => {
    try {
        const query = 'SELECT * FROM blogs WHERE is_published = TRUE ORDER BY published_at DESC';
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('[Blogs GET Error]:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create blog
exports.createBlog = async (req, res) => {
    try {
        const { title, summary, content, author, category, tags, is_published } = req.body;
        const cover_image_url = req.file ? `/uploads/${req.file.filename}` : null;
        const blog_id = require('crypto').randomUUID();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const query = `
            INSERT INTO blogs (blog_id, title, slug, summary, content, author, category, tags, cover_image_url, is_published, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const values = [
            blog_id, title, slug, summary, content, author, category,
            JSON.stringify(tags || []),
            cover_image_url,
            is_published === 'true' || is_published === true,
            (is_published === 'true' || is_published === true) ? new Date() : null
        ];

        await db.query(query, values);
        const { rows } = await db.query('SELECT * FROM blogs WHERE blog_id = $1', [blog_id]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, summary, content, author, category, tags, is_published } = req.body;

        let cover_image_url = req.body.cover_image_url;
        if (req.file) {
            cover_image_url = `/uploads/${req.file.filename}`;
        }

        const query = `
            UPDATE blogs 
            SET title = $1, summary = $2, content = $3, author = $4, category = $5, tags = $6, cover_image_url = $7, is_published = $8, updated_at = NOW()
            WHERE blog_id = $9
        `;
        const values = [
            title, summary, content, author, category,
            JSON.stringify(tags || []),
            cover_image_url,
            is_published === 'true' || is_published === true,
            id
        ];

        await db.query(query, values);
        const { rows } = await db.query('SELECT * FROM blogs WHERE blog_id = $1', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM blogs WHERE blog_id = $1', [id]);
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
