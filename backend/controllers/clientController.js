const db = require('../config/db');

// Get all clients
exports.getClients = async (req, res) => {
    try {
        const showAll = req.query.all === 'true';
        const query = showAll 
            ? 'SELECT * FROM clients ORDER BY display_order ASC'
            : 'SELECT * FROM clients WHERE is_active = TRUE ORDER BY display_order ASC';
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('[Clients GET Error]:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create client
exports.createClient = async (req, res) => {
    try {
        const { name, website_url, category, display_order, is_active } = req.body;
        const logo_url = req.file ? `/uploads/${req.file.filename}` : null;
        const client_id = require('crypto').randomUUID();

        const query = `
            INSERT INTO clients (client_id, name, logo_url, website_url, category, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
            client_id, 
            name, 
            logo_url, 
            website_url, 
            category, 
            display_order || 0,
            is_active === 'false' ? false : true
        ];

        await db.query(query, values);
        const { rows } = await db.query('SELECT * FROM clients WHERE client_id = $1', [client_id]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update client
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, website_url, category, display_order, is_active } = req.body;

        let query, values;
        if (req.file) {
            const logo_url = `/uploads/${req.file.filename}`;
            query = `
                UPDATE clients 
                SET name = $1, logo_url = $2, website_url = $3, category = $4, display_order = $5, is_active = $6
                WHERE client_id = $7
            `;
            values = [name, logo_url, website_url, category, display_order, is_active, id];
        } else {
            query = `
                UPDATE clients 
                SET name = $1, website_url = $2, category = $3, display_order = $4, is_active = $5
                WHERE client_id = $6
            `;
            values = [name, website_url, category, display_order, is_active, id];
        }

        await db.query(query, values);
        const { rows } = await db.query('SELECT * FROM clients WHERE client_id = $1', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete client
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM clients WHERE client_id = $1', [id]);
        res.json({ message: 'Client deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
