const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Ensure the media_assets table exists
const ensureMediaTable = async () => {
    try {
        const { rows } = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'media_assets'
        `);

        if (rows.length === 0) {
            console.log("[DB] Creating media_assets table...");
            await db.query(`
                CREATE TABLE media_assets (
                    asset_id VARCHAR(36) PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    original_name VARCHAR(255),
                    mime_type VARCHAR(100),
                    file_size BIGINT,
                    path VARCHAR(255) NOT NULL,
                    alt_text VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log("[DB] media_assets table created successfully.");
        }
    } catch (err) {
        console.error("[DB] Media table check failed:", err.message);
    }
};

// Initial check
ensureMediaTable();

exports.uploadAssets = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        const crypto = require('crypto');
        const results = [];

        for (const file of req.files) {
            const asset_id = crypto.randomUUID();
            const filename = file.filename;
            const orgName = file.originalname;
            const mimeType = file.mimetype;
            const size = file.size;
            const filePath = `/uploads/${filename}`;

            await db.query(`
                INSERT INTO media_assets (asset_id, filename, original_name, mime_type, file_size, path)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [asset_id, filename, orgName, mimeType, size, filePath]);

            const newAsset = await db.query('SELECT * FROM media_assets WHERE asset_id = $1', [asset_id]);
            results.push(newAsset.rows[0]);
        }

        res.status(201).json({
            message: `${results.length} files uploaded successfully`,
            data: results
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload assets' });
    }
};

exports.listAssets = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM media_assets ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM media_assets WHERE asset_id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = rows[0];
        const fullPath = path.join(__dirname, '..', 'uploads', asset.filename);

        // Delete from DB
        await db.query('DELETE FROM media_assets WHERE asset_id = $1', [id]);

        // Delete from Disk
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        res.json({ message: 'Asset deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete asset' });
    }
};
