/**
 * One-shot migration: add categories.features and categories.hero_config
 * Safe to re-run: skips if columns already exist.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

const SQL = `
ALTER TABLE categories
    ADD COLUMN features JSON NULL COMMENT 'Array of {title, description}' AFTER meta_description,
    ADD COLUMN hero_config JSON NULL COMMENT 'headline, subheadline, ctas, trust_badges' AFTER features;
`;

(async () => {
    try {
        await db.query(SQL);
        console.log('[migration] Added categories.features and categories.hero_config.');
        process.exit(0);
    } catch (err) {
        const msg = String(err.message || '');
        const dup =
            err.code === 'ER_DUP_FIELDNAME' ||
            err.errno === 1060 ||
            /Duplicate column name/i.test(msg);
        if (dup) {
            console.log('[migration] Columns already present; nothing to do.');
            process.exit(0);
        }
        console.error('[migration] Failed:', err.message);
        process.exit(1);
    }
})();
