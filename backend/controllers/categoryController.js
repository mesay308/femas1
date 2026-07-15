const db = require('../config/db');

const DEFAULT_CATEGORY_FEATURES = [
    { title: 'Problem', description: '' },
    { title: 'Femas Solution', description: '' },
    { title: 'Result', description: '' },
];

const DEFAULT_HERO_CONFIG = {
    headline: '',
    subheadline: '',
    cta_primary: { label: '', link: '' },
    cta_secondary: { label: '', link: '' },
    trust_badges: [],
};

function parseJSONField(val, fallback) {
    if (val === undefined) return fallback;
    if (val === null || val === '') return fallback;
    if (typeof val === 'object') return val;
    try {
        const parsed = JSON.parse(val);
        return parsed === null || parsed === undefined ? fallback : parsed;
    } catch {
        return fallback;
    }
}

function normalizeFeatures(val) {
    const parsed = parseJSONField(val, null);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((row) => ({
            title: typeof row.title === 'string' ? row.title : '',
            description: typeof row.description === 'string' ? row.description : '',
        }));
    }
    return DEFAULT_CATEGORY_FEATURES;
}

function normalizeHeroConfig(val) {
    const parsed = parseJSONField(val, null);
    const base = { ...DEFAULT_HERO_CONFIG };
    if (!parsed || typeof parsed !== 'object') return base;
    return {
        headline: typeof parsed.headline === 'string' ? parsed.headline : '',
        subheadline: typeof parsed.subheadline === 'string' ? parsed.subheadline : '',
        cta_primary: {
            label: typeof parsed.cta_primary?.label === 'string' ? parsed.cta_primary.label : '',
            link: typeof parsed.cta_primary?.link === 'string' ? parsed.cta_primary.link : '',
        },
        cta_secondary: {
            label: typeof parsed.cta_secondary?.label === 'string' ? parsed.cta_secondary.label : '',
            link: typeof parsed.cta_secondary?.link === 'string' ? parsed.cta_secondary.link : '',
        },
        trust_badges: Array.isArray(parsed.trust_badges)
            ? parsed.trust_badges.map((b) => ({
                  label: typeof b?.label === 'string' ? b.label : '',
                  icon_url: typeof b?.icon_url === 'string' ? b.icon_url : '',
              }))
            : [],
    };
}

// Get all categories with counts
exports.getCategories = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.category_id) as product_count,
                (SELECT COUNT(*) FROM categories c2 WHERE c2.parent_category_id = c.category_id) as sub_category_count
            FROM categories c 
            ORDER BY c.display_order ASC, c.name ASC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('[Categories GET Error]:', err.message);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

// Get single category by slug for public view
exports.getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const query = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM products p WHERE p.category_id = c.category_id) as product_count
            FROM categories c 
            WHERE c.slug = $1 AND c.is_active = true
        `;
        const { rows } = await db.query(query, [slug]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('[Category GET Slug Error]:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

/** Public: load category by id (e.g. product filter sync on category page) */
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT c.*,
                   (SELECT COUNT(*) FROM products p WHERE p.category_id = c.category_id) as product_count
            FROM categories c
            WHERE c.category_id = $1 AND c.is_active = true
        `;
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('[Category GET By Id Error]:', err.message);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, slug, parent_category_id, description, short_description, meta_title, meta_description, is_active, display_order, level } = req.body;
        let cover_image_url = req.body.cover_image_url || null;
        if (req.file) {
            cover_image_url = `/uploads/${req.file.filename}`;
        }

        const features = normalizeFeatures(req.body.features);
        const hero_config = normalizeHeroConfig(req.body.hero_config);

        const category_id = require('crypto').randomUUID();
        const query = `
            INSERT INTO categories (category_id, name, slug, parent_category_id, description, short_description, cover_image_url, meta_title, meta_description, features, hero_config, is_active, display_order, level)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        const values = [
            category_id,
            name,
            slug,
            parent_category_id || null,
            description,
            short_description,
            cover_image_url,
            meta_title,
            meta_description,
            JSON.stringify(features),
            JSON.stringify(hero_config),
            is_active === undefined ? true : (is_active === 'true' || is_active === true),
            display_order || 0,
            level || 1
        ];

        await db.query(query, values);
        const newCat = await db.query('SELECT * FROM categories WHERE category_id = $1', [category_id]);
        res.status(201).json(newCat.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Start of update/delete
// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, parent_category_id, description, short_description, meta_title, meta_description, is_active, display_order, level } = req.body;

        // Handle Image Update
        let cover_image_url = req.body.cover_image_url;

        // If a new file is uploaded, use it.
        // Otherwise, if req.body.cover_image_url is missing, we might want to check the DB.
        if (req.file) {
            cover_image_url = `/uploads/${req.file.filename}`;
        }

        // If still undefined, fetch current value to avoid overwriting with NULL
        if (cover_image_url === undefined) {
            const current = await db.query('SELECT cover_image_url FROM categories WHERE category_id = $1', [id]);
            cover_image_url = current.rows[0]?.cover_image_url || null;
        }

        const features = normalizeFeatures(req.body.features);
        const hero_config = normalizeHeroConfig(req.body.hero_config);

        const query = `
            UPDATE categories 
            SET name = $1, slug = $2, parent_category_id = $3, description = $4, short_description = $5, cover_image_url = $6, meta_title = $7, meta_description = $8, features = $9, hero_config = $10, is_active = $11, display_order = $12, level = $13, updated_at = NOW()
            WHERE category_id = $14
        `;
        const values = [
            name,
            slug,
            parent_category_id || null,
            description,
            short_description,
            cover_image_url,
            meta_title,
            meta_description,
            JSON.stringify(features),
            JSON.stringify(hero_config),
            is_active === undefined ? true : (is_active === 'true' || is_active === true),
            display_order || 0,
            level || 1,
            id
        ];

        const { rowCount } = await db.query(query, values);
        if (rowCount === 0) return res.status(404).json({ error: 'Category not found' });

        const updatedRow = await db.query('SELECT * FROM categories WHERE category_id = $1', [id]);
        res.json(updatedRow.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete category with safety check
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has sub-categories
        const subCatCheck = await db.query('SELECT COUNT(*) as count FROM categories WHERE parent_category_id = $1', [id]);
        if (subCatCheck.rows[0].count > 0) {
            return res.status(400).json({
                error: 'Cannot delete category with sub-categories. Please delete or move sub-categories first.',
                sub_category_count: subCatCheck.rows[0].count
            });
        }

        // Check if category has products
        const productCheck = await db.query('SELECT COUNT(*) as count FROM products WHERE category_id = $1', [id]);
        if (productCheck.rows[0].count > 0) {
            return res.status(400).json({
                error: `Cannot delete category with ${productCheck.rows[0].count} linked products. Please move or delete products first.`,
                product_count: productCheck.rows[0].count
            });
        }

        const { rowCount } = await db.query('DELETE FROM categories WHERE category_id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
