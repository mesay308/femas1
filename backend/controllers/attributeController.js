const db = require('../config/db');

exports.getAttributes = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM attributes ORDER BY name ASC');

        // For each attribute, fetch its linked categories and parse options
        for (const attr of rows) {
            if (attr.options && typeof attr.options === 'string') {
                try { attr.options = JSON.parse(attr.options); } catch (e) { attr.options = []; }
            } else if (!attr.options) {
                attr.options = [];
            }

            const catRes = await db.query(`
                SELECT c.category_id, c.name 
                FROM category_attributes ca 
                JOIN categories c ON ca.category_id = c.category_id 
                WHERE ca.attribute_id = $1
                ORDER BY c.name ASC
            `, [attr.attribute_id]);
            attr.categories = catRes.rows;
        }

        res.json(rows);
    } catch (err) {
        console.error('[Attributes GET Error]:', err.message);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

exports.getAttributesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { rows } = await db.query(`
            SELECT a.* 
            FROM attributes a 
            JOIN category_attributes ca ON a.attribute_id = ca.attribute_id 
            WHERE ca.category_id = $1 
            ORDER BY ca.display_order ASC, a.name ASC
        `, [categoryId]);

        for (const attr of rows) {
            if (attr.options && typeof attr.options === 'string') {
                try { attr.options = JSON.parse(attr.options); } catch (e) { attr.options = []; }
            } else if (!attr.options) {
                attr.options = [];
            }
        }
        res.json(rows);
    } catch (err) {
        console.error('[Attributes by Category Error]:', err.message);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

exports.createAttribute = async (req, res) => {
    try {
        const { name, code, type, unit, is_filterable, options, category_ids } = req.body;

        const attribute_id = require('crypto').randomUUID();
        const query = `
            INSERT INTO attributes (attribute_id, name, code, type, unit, is_filterable, options)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [attribute_id, name, code, type, unit, is_filterable || false, JSON.stringify(options || [])];

        await db.query(query, values);

        // Link to categories
        if (category_ids && category_ids.length > 0) {
            for (let i = 0; i < category_ids.length; i++) {
                await db.query(
                    'INSERT INTO category_attributes (category_id, attribute_id, display_order) VALUES ($1, $2, $3)',
                    [category_ids[i], attribute_id, i]
                );
            }
        }

        const newAttr = await db.query('SELECT * FROM attributes WHERE attribute_id = $1', [attribute_id]);

        // Fetch linked categories for response
        const catRes = await db.query(`
            SELECT c.category_id, c.name 
            FROM category_attributes ca 
            JOIN categories c ON ca.category_id = c.category_id 
            WHERE ca.attribute_id = $1
        `, [attribute_id]);
        newAttr.rows[0].categories = catRes.rows;

        res.status(201).json(newAttr.rows[0]);
    } catch (err) {
        console.error("Create Attribute Error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Attribute code must be unique.' });
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

exports.updateAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, type, unit, is_filterable, options, category_ids } = req.body;

        const query = `
            UPDATE attributes 
            SET name = $1, code = $2, type = $3, unit = $4, is_filterable = $5, options = $6
            WHERE attribute_id = $7
        `;
        const values = [name, code, type, unit, is_filterable, options ? JSON.stringify(options) : null, id];

        const { rowCount } = await db.query(query, values);
        if (rowCount === 0) return res.status(404).json({ error: 'Attribute not found' });

        // Rebuild category links
        if (category_ids !== undefined) {
            await db.query('DELETE FROM category_attributes WHERE attribute_id = $1', [id]);
            if (category_ids && category_ids.length > 0) {
                for (let i = 0; i < category_ids.length; i++) {
                    await db.query(
                        'INSERT INTO category_attributes (category_id, attribute_id, display_order) VALUES ($1, $2, $3)',
                        [category_ids[i], id, i]
                    );
                }
            }
        }

        const updatedAttr = await db.query('SELECT * FROM attributes WHERE attribute_id = $1', [id]);

        // Fetch linked categories for response
        const catRes = await db.query(`
            SELECT c.category_id, c.name 
            FROM category_attributes ca 
            JOIN categories c ON ca.category_id = c.category_id 
            WHERE ca.attribute_id = $1
        `, [id]);
        updatedAttr.rows[0].categories = catRes.rows;

        res.json(updatedAttr.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM attributes WHERE attribute_id = $1', [id]);
        res.json({ message: 'Attribute deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
