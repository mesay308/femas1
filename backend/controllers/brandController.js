const db = require('../config/db');

exports.getBrands = async (req, res) => {
    try {
        const showAll = req.query.all === 'true';
        const query = `
            SELECT 
                b.*,
                (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.brand_id) as product_count
            FROM brands b 
            ${showAll ? '' : 'WHERE b.is_active = TRUE'}
            ORDER BY b.display_order ASC, b.name ASC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('[Brands GET Error]:', err.message);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const { name, website_url, category, display_order, is_active } = req.body;
        const logo_url = req.file ? `/uploads/${req.file.filename}` : '/placeholder-logo.png';
        const brand_id = require('crypto').randomUUID();

        const query = `
            INSERT INTO brands (brand_id, name, logo_url, website_url, category, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
            brand_id, 
            name, 
            logo_url, 
            website_url, 
            category || 'Partner', 
            display_order || 0,
            is_active === 'false' ? false : true
        ];

        await db.query(query, values);
        const newBrand = await db.query('SELECT * FROM brands WHERE brand_id = $1', [brand_id]);
        res.status(201).json(newBrand.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, website_url, category, display_order, is_active } = req.body;

        let query, values;
        if (req.file) {
            const logo_url = `/uploads/${req.file.filename}`;
            query = `
                UPDATE brands 
                SET name = $1, website_url = $2, logo_url = $3, category = $4, display_order = $5, is_active = $6
                WHERE brand_id = $7
            `;
            values = [name, website_url, logo_url, category, display_order, is_active, id];
        } else {
            query = `
                UPDATE brands 
                SET name = $1, website_url = $2, category = $3, display_order = $4, is_active = $5
                WHERE brand_id = $6
            `;
            values = [name, website_url, category, display_order, is_active, id];
        }

        const { rowCount } = await db.query(query, values);
        if (rowCount === 0) return res.status(404).json({ error: 'Brand not found' });

        const updatedRow = await db.query('SELECT * FROM brands WHERE brand_id = $1', [id]);
        res.json(updatedRow.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM brands WHERE brand_id = $1', [id]);
        res.json({ message: 'Brand deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
