const db = require('../config/db');
const crypto = require('crypto');

// Whitelists for ENUM-backed columns so unexpected values can't reach SQL.
const VALID_IMAGE_SIDES = new Set(['left', 'right']);
const VALID_RATIOS = new Set(['40_60', '50_50', '60_40']);
const VALID_THEMES = new Set(['light', 'dark']);

const normEnum = (raw, allowed, fallback) => {
    const v = (raw ?? '').toString().trim();
    return allowed.has(v) ? v : fallback;
};

const toBool = (v, fallback = true) => {
    if (v === undefined || v === null || v === '') return fallback;
    if (typeof v === 'boolean') return v;
    const s = String(v).toLowerCase();
    if (['0', 'false', 'no', 'off'].includes(s)) return false;
    return true;
};

// Returns rows of trust badges keyed by slide_id for a list of slides.
async function loadBadgesForSlides(slideIds) {
    if (!slideIds.length) return new Map();
    const placeholders = slideIds.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await db.query(
        `SELECT * FROM hero_trust_badges
         WHERE slide_id IN (${placeholders})
         ORDER BY slide_id, display_order ASC`,
        slideIds
    );
    const map = new Map();
    for (const r of rows) {
        if (!map.has(r.slide_id)) map.set(r.slide_id, []);
        map.get(r.slide_id).push(r);
    }
    return map;
}

// --- Hero Slides ---
exports.getHeroSlides = async (req, res) => {
    try {
        const { page, includeInactive } = req.query;
        const where = [];
        const params = [];
        if (page) {
            params.push(page);
            where.push(`page_slug = $${params.length}`);
        }
        if (!includeInactive || includeInactive === 'false') {
            where.push(`is_active = TRUE`);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const { rows } = await db.query(
            `SELECT * FROM hero_slides ${whereSql} ORDER BY display_order ASC, created_at ASC`,
            params
        );

        const badgeMap = await loadBadgesForSlides(rows.map(r => r.slide_id));
        const enriched = rows.map(r => ({ ...r, trust_badges: badgeMap.get(r.slide_id) || [] }));
        res.json(enriched);
    } catch (err) {
        console.error('[hero] getHeroSlides error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createHeroSlide = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            cta_text,
            cta_link,
            display_order,
            is_active,
            page_slug,
            eyebrow,
            image_side,
            content_ratio,
            theme,
        } = req.body;

        let image_url = '/uploads/placeholder-hero.jpg';
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        } else if (req.body.image_url) {
            image_url = req.body.image_url;
        }

        const slide_id = crypto.randomUUID();
        const query = `
            INSERT INTO hero_slides (
                slide_id, page_slug, eyebrow, title, subtitle, image_url,
                image_side, content_ratio, theme,
                cta_text, cta_link, display_order, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;
        const values = [
            slide_id,
            (page_slug || 'home').toString().trim(),
            eyebrow || null,
            title || null,
            subtitle || null,
            image_url,
            normEnum(image_side, VALID_IMAGE_SIDES, 'right'),
            normEnum(content_ratio, VALID_RATIOS, '40_60'),
            normEnum(theme, VALID_THEMES, 'dark'),
            cta_text || null,
            cta_link || null,
            Number.isFinite(parseInt(display_order, 10)) ? parseInt(display_order, 10) : 0,
            toBool(is_active, true),
        ];

        await db.query(query, values);
        const newSlide = await db.query('SELECT * FROM hero_slides WHERE slide_id = $1', [slide_id]);
        res.status(201).json({ ...newSlide.rows[0], trust_badges: [] });
    } catch (err) {
        console.error('[hero] createHeroSlide error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            subtitle,
            cta_text,
            cta_link,
            display_order,
            is_active,
            page_slug,
            eyebrow,
            image_side,
            content_ratio,
            theme,
        } = req.body;

        const baseFields = [
            ['page_slug', (page_slug || 'home').toString().trim()],
            ['eyebrow', eyebrow || null],
            ['title', title || null],
            ['subtitle', subtitle || null],
            ['image_side', normEnum(image_side, VALID_IMAGE_SIDES, 'right')],
            ['content_ratio', normEnum(content_ratio, VALID_RATIOS, '40_60')],
            ['theme', normEnum(theme, VALID_THEMES, 'dark')],
            ['cta_text', cta_text || null],
            ['cta_link', cta_link || null],
            ['display_order', Number.isFinite(parseInt(display_order, 10)) ? parseInt(display_order, 10) : 0],
            ['is_active', toBool(is_active, true)],
        ];

        if (req.file) {
            baseFields.push(['image_url', `/uploads/${req.file.filename}`]);
        } else if (req.body.image_url) {
            baseFields.push(['image_url', req.body.image_url]);
        }

        const setSql = baseFields.map(([col], i) => `${col} = $${i + 1}`).join(', ');
        const values = baseFields.map(([, v]) => v);
        values.push(id);

        const { rowCount } = await db.query(
            `UPDATE hero_slides SET ${setSql} WHERE slide_id = $${values.length}`,
            values
        );
        if (rowCount === 0) return res.status(404).json({ error: 'Slide not found' });

        const updated = await db.query('SELECT * FROM hero_slides WHERE slide_id = $1', [id]);
        const badges = await db.query(
            'SELECT * FROM hero_trust_badges WHERE slide_id = $1 ORDER BY display_order ASC',
            [id]
        );
        res.json({ ...updated.rows[0], trust_badges: badges.rows });
    } catch (err) {
        console.error('[hero] updateHeroSlide error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteHeroSlide = async (req, res) => {
    try {
        // hero_trust_badges has ON DELETE CASCADE, so badges are removed automatically.
        await db.query('DELETE FROM hero_slides WHERE slide_id = $1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('[hero] deleteHeroSlide error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// --- Hero Trust Badges ---
exports.listHeroTrustBadges = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM hero_trust_badges WHERE slide_id = $1 ORDER BY display_order ASC',
            [req.params.slideId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[hero] listHeroTrustBadges error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createHeroTrustBadge = async (req, res) => {
    try {
        const { slideId } = req.params;
        const { label, display_order, is_active } = req.body;
        if (!label || !label.toString().trim()) {
            return res.status(400).json({ error: 'label is required' });
        }
        const slideCheck = await db.query('SELECT slide_id FROM hero_slides WHERE slide_id = $1', [slideId]);
        if (!slideCheck.rows.length) return res.status(404).json({ error: 'Slide not found' });

        const badge_id = crypto.randomUUID();
        const icon_url = req.file ? `/uploads/${req.file.filename}` : null;
        await db.query(
            `INSERT INTO hero_trust_badges (badge_id, slide_id, label, icon_url, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                badge_id,
                slideId,
                label.toString().trim(),
                icon_url,
                Number.isFinite(parseInt(display_order, 10)) ? parseInt(display_order, 10) : 0,
                toBool(is_active, true),
            ]
        );
        const created = await db.query('SELECT * FROM hero_trust_badges WHERE badge_id = $1', [badge_id]);
        res.status(201).json(created.rows[0]);
    } catch (err) {
        console.error('[hero] createHeroTrustBadge error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateHeroTrustBadge = async (req, res) => {
    try {
        const { badgeId } = req.params;
        const { label, display_order, is_active } = req.body;

        const fields = [];
        const values = [];

        if (label !== undefined) {
            fields.push(`label = $${fields.length + 1}`);
            values.push(label.toString().trim());
        }
        if (display_order !== undefined) {
            fields.push(`display_order = $${fields.length + 1}`);
            values.push(Number.isFinite(parseInt(display_order, 10)) ? parseInt(display_order, 10) : 0);
        }
        if (is_active !== undefined) {
            fields.push(`is_active = $${fields.length + 1}`);
            values.push(toBool(is_active, true));
        }
        if (req.file) {
            fields.push(`icon_url = $${fields.length + 1}`);
            values.push(`/uploads/${req.file.filename}`);
        }

        if (!fields.length) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(badgeId);
        const { rowCount } = await db.query(
            `UPDATE hero_trust_badges SET ${fields.join(', ')} WHERE badge_id = $${values.length}`,
            values
        );
        if (rowCount === 0) return res.status(404).json({ error: 'Badge not found' });

        const updated = await db.query('SELECT * FROM hero_trust_badges WHERE badge_id = $1', [badgeId]);
        res.json(updated.rows[0]);
    } catch (err) {
        console.error('[hero] updateHeroTrustBadge error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteHeroTrustBadge = async (req, res) => {
    try {
        await db.query('DELETE FROM hero_trust_badges WHERE badge_id = $1', [req.params.badgeId]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('[hero] deleteHeroTrustBadge error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// --- Testimonials ---
exports.getTestimonials = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        const { client_name, client_role, content, rating, is_active } = req.body; // Frontend sends 'content'
        const client_image_url = req.file ? `/uploads/${req.file.filename}` : null;

        // Fix: Map 'content' to 'quote' column in DB
        const testimonial_id = require('crypto').randomUUID();
        const query = `
            INSERT INTO testimonials (testimonial_id, client_name, position, company, quote, avatar_url, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        // Mapping: client_role -> position, content -> quote. Company is missing in body, assume empty or reuse role?
        // Schema: client_name, position, company, quote, avatar_url
        // Frontend sends: client_name, client_role, content, rating
        // Adjusted values:
        const values = [
            testimonial_id,
            client_name,
            client_role || '', // position
            '', // company (not sent by frontend?)
            content, // quote
            client_image_url, // avatar_url
            is_active || true
        ];

        await db.query(query, values);
        const newTestimonial = await db.query('SELECT * FROM testimonials WHERE testimonial_id = $1', [testimonial_id]);
        res.status(201).json(newTestimonial.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { client_name, client_role, content, rating, is_active } = req.body;

        let query, values;
        if (req.file) {
            const client_image_url = `/uploads/${req.file.filename}`;
            query = `
                UPDATE testimonials 
                SET client_name = $1, position = $2, quote = $3, avatar_url = $4, is_active = $5
                WHERE testimonial_id = $6
            `;
            values = [client_name, client_role, content, client_image_url, is_active || true, id];
        } else {
            query = `
                UPDATE testimonials 
                SET client_name = $1, position = $2, quote = $3, is_active = $4
                WHERE testimonial_id = $5
            `;
            values = [client_name, client_role, content, is_active || true, id];
        }

        const { rowCount } = await db.query(query, values);
        if (rowCount === 0) return res.status(404).json({ error: 'Testimonial not found' });
        const updatedTestimonial = await db.query('SELECT * FROM testimonials WHERE testimonial_id = $1', [id]);
        res.json(updatedTestimonial.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        await db.query('DELETE FROM testimonials WHERE testimonial_id = $1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
