const db = require('../config/db');

// Self-healing migration for Company Profile
const ensureProfileColumns = async () => {
    try {
        const { rows } = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'company_profile'
        `);
        const columns = rows.map(r => r.column_name);

        const needed = [
            { name: 'brand_name', type: 'VARCHAR(255)' },
            { name: 'core_values', type: 'JSON' },
            { name: 'description_brief', type: 'TEXT' },
            { name: 'reasons_why_us', type: 'JSON' },
            { name: 'corporate_contacts', type: 'JSON' },
            { name: 'sales_contacts', type: 'JSON' },
            { name: 'dedicated_admin', type: 'JSON' },
            { name: 'social_media', type: 'JSON' },
            { name: 'physical_addresses', type: 'JSON' },
            { name: 'primary_color', type: 'VARCHAR(50)' },
            { name: 'secondary_color', type: 'VARCHAR(50)' }
        ];

        for (const col of needed) {
            if (!columns.includes(col.name)) {
                console.log(`[DB] Auto-migration: Adding column ${col.name} to company_profile`);
                // Use standard MySQL ALTER TABLE without IF NOT EXISTS (since we manually checked list)
                await db.query(`ALTER TABLE company_profile ADD COLUMN ${col.name} ${col.type} NULL`);
            }
        }
    } catch (err) {
        // Log but don't crash the server
        console.error("[DB] Auto-migration check encountered issues (may be connection related):", err.message);
    }
};

// Initial check on startup
ensureProfileColumns();

const parseJSON = (val, defaultVal = []) => {
    if (!val) return defaultVal;
    if (typeof val === 'object') return val;
    try {
        return JSON.parse(val);
    } catch (e) {
        return val;
    }
};

exports.getProfile = async (req, res) => {
    try {
        // Trigger self-healing on GET ensure columns exist before returning
        await ensureProfileColumns();

        const { rows } = await db.query('SELECT * FROM company_profile LIMIT 1');
        if (rows.length === 0) {
            return res.json({});
        }
        const profile = rows[0];

        // Parse JSON fields
        const objectFields = ['corporate_contacts', 'sales_contacts', 'dedicated_admin', 'social_media', 'physical_addresses', 'core_values'];
        const arrayFields = ['industry_verticals', 'engineering_specialties', 'reasons_why_us'];

        objectFields.forEach(field => {
            profile[field] = parseJSON(profile[field], {});
        });
        arrayFields.forEach(field => {
            profile[field] = parseJSON(profile[field], []);
        });

        // Compatibility flattening for frontend 'settings' fetch
        profile.primary_phone = profile.phone || profile.sales_contacts?.phones?.primary || '';
        profile.secondary_phone = profile.sales_contacts?.phones?.secondary || '';
        profile.sales_email = profile.email || profile.sales_contacts?.emails?.[0] || '';
        profile.support_email = profile.corporate_contacts?.emails?.[0] || profile.email || '';
        profile.whatsapp_number = profile.sales_contacts?.whatsapp || profile.phone || '';
        profile.telegram_url = profile.social_media?.telegram || '';
        profile.linkedin_url = profile.social_media?.linkedin || '';
        profile.facebook_url = profile.social_media?.facebook || '';
        profile.youtube_url = profile.social_media?.youtube || '';

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // Ensure columns exist before update attempt
        await ensureProfileColumns();

        const {
            legal_name, brand_name, tagline, year_established,
            mission, vision, core_values,
            description_brief, overview, // overview is detail
            address, phone, email, website,
            reasons_why_us,
            corporate_contacts, sales_contacts, social_media, physical_addresses,
            primary_color, secondary_color
        } = req.body;

        // Find existing profile
        const check = await db.query('SELECT profile_id, logo_light, logo_dark FROM company_profile LIMIT 1');

        // Handle logo uploads
        let logo_light = req.body.logo_light;
        let logo_dark = req.body.logo_dark;

        if (req.files) {
            if (req.files.logo_light) {
                logo_light = `/uploads/${req.files.logo_light[0].filename}`;
            }
            if (req.files.logo_dark) {
                logo_dark = `/uploads/${req.files.logo_dark[0].filename}`;
            }
        }

        // Helper to ensure JSON strings for DB
        const toJSON = (val) => {
            if (!val) return '[]';
            if (typeof val === 'object') return JSON.stringify(val);
            return val;
        };

        let query;
        let values;

        if (check.rows.length === 0) {
            const profile_id = require('crypto').randomUUID();
            query = `
                INSERT INTO company_profile (
                    profile_id, legal_name, brand_name, tagline, year_established, 
                    mission, vision, core_values,
                    description_brief, overview, 
                    address, phone, email, website,
                    logo_light, logo_dark,
                    reasons_why_us,
                    corporate_contacts, sales_contacts, social_media, physical_addresses,
                    primary_color, secondary_color
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            `;
            values = [
                profile_id, legal_name, brand_name, tagline, year_established,
                mission, vision, toJSON(core_values),
                description_brief, overview,
                address, phone, email, website,
                logo_light, logo_dark,
                toJSON(reasons_why_us),
                toJSON(corporate_contacts),
                toJSON(sales_contacts),
                toJSON(social_media),
                toJSON(physical_addresses),
                primary_color, secondary_color
            ];
        } else {
            const profile_id = check.rows[0].profile_id;
            query = `
                UPDATE company_profile SET 
                    legal_name = $1, brand_name = $2, tagline = $3, year_established = $4, 
                    mission = $5, vision = $6, core_values = $7,
                    description_brief = $8, overview = $9, 
                    address = $10, phone = $11, email = $12, website = $13,
                    logo_light = $14, logo_dark = $15,
                    reasons_why_us = $16,
                    corporate_contacts = $17, sales_contacts = $18, social_media = $19, physical_addresses = $20,
                    primary_color = $21, secondary_color = $22,
                    updated_at = NOW()
                WHERE profile_id = $23
            `;
            values = [
                legal_name, brand_name, tagline, year_established,
                mission, vision, toJSON(core_values),
                description_brief, overview,
                address, phone, email, website,
                logo_light, logo_dark,
                toJSON(reasons_why_us),
                toJSON(corporate_contacts),
                toJSON(sales_contacts),
                toJSON(social_media),
                toJSON(physical_addresses),
                primary_color, secondary_color,
                profile_id
            ];
        }

        await db.query(query, values);

        // Return updated profile
        const updated = await db.query('SELECT * FROM company_profile LIMIT 1');
        const profile = updated.rows[0];

        const objectFieldsRes = ['corporate_contacts', 'sales_contacts', 'dedicated_admin', 'social_media', 'physical_addresses', 'core_values'];
        const arrayFieldsRes = ['industry_verticals', 'engineering_specialties', 'reasons_why_us'];

        objectFieldsRes.forEach(field => {
            profile[field] = parseJSON(profile[field], {});
        });
        arrayFieldsRes.forEach(field => {
            profile[field] = parseJSON(profile[field], []);
        });

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
